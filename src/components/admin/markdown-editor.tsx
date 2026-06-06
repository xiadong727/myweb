"use client";

import { useRef, useState } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import rehypeRaw from "rehype-raw";
import { Bold, Italic, Heading2, Heading3, List, ListOrdered, Quote, Link2, Code, Image as ImageIcon, FolderOpen, Palette, Type } from "lucide-react";
import { ImagePicker } from "./image-picker";

// 文字颜色 / 字号 预设（插入内联 <span style>，正文已开启 rehype-raw 渲染）
const TEXT_COLORS: [string, string][] = [
  ["朱红", "#e11d48"], ["橙", "#ea580c"], ["金", "#d97706"],
  ["绿", "#16a34a"], ["蓝", "#2563eb"], ["紫", "#7c3aed"], ["灰", "#6b7280"],
];
const TEXT_SIZES: [string, string][] = [["小", "0.85em"], ["大", "1.25em"], ["特大", "1.6em"]];

type Props = {
  value: string;
  onChange: (v: string) => void;
  /** 上传图片，返回站内路径数组 */
  onUpload: (files: FileList | null) => Promise<string[]>;
};

function ToolBtn({ title, onClick, children }: { title: string; onClick: () => void; children: React.ReactNode }) {
  return (
    <button type="button" title={title} onClick={onClick} className="rounded p-1.5 text-muted-foreground transition hover:bg-primary/10 hover:text-primary">
      {children}
    </button>
  );
}

const previewProse =
  "text-sm leading-relaxed text-foreground [&_h1]:text-xl [&_h1]:font-bold [&_h1]:mt-3 [&_h2]:text-lg [&_h2]:font-bold [&_h2]:mt-4 [&_h3]:text-base [&_h3]:font-bold [&_h3]:mt-3 [&_p]:my-2 [&_ul]:my-2 [&_ul]:list-disc [&_ul]:pl-5 [&_ol]:my-2 [&_ol]:list-decimal [&_ol]:pl-5 [&_li]:my-1 [&_img]:my-2 [&_img]:max-w-full [&_img]:rounded-lg [&_blockquote]:border-l-4 [&_blockquote]:border-primary/40 [&_blockquote]:pl-3 [&_blockquote]:text-muted-foreground [&_a]:text-primary [&_a]:underline [&_code]:rounded [&_code]:bg-muted [&_code]:px-1 [&_strong]:font-bold";

export function MarkdownEditor({ value, onChange, onUpload }: Props) {
  const ref = useRef<HTMLTextAreaElement>(null);
  const fileRef = useRef<HTMLInputElement>(null);
  const [mode, setMode] = useState<"split" | "write" | "preview">("split");
  const [uploading, setUploading] = useState(false);
  const [pickerOpen, setPickerOpen] = useState(false);
  const [palette, setPalette] = useState<null | "color" | "size">(null);

  function setSel(start: number, end: number) {
    requestAnimationFrame(() => {
      const ta = ref.current;
      if (!ta) return;
      ta.focus();
      ta.setSelectionRange(start, end);
    });
  }

  // 在光标处用 pre/post 包裹选中文字（无选中则用占位符）
  function wrap(pre: string, post: string, placeholder: string) {
    const ta = ref.current;
    const s = ta?.selectionStart ?? value.length;
    const e = ta?.selectionEnd ?? value.length;
    const sel = value.slice(s, e) || placeholder;
    const next = value.slice(0, s) + pre + sel + post + value.slice(e);
    onChange(next);
    setSel(s + pre.length, s + pre.length + sel.length);
  }

  // 给当前行加前缀（标题/列表/引用）
  function prefixLine(prefix: string) {
    const ta = ref.current;
    const s = ta?.selectionStart ?? value.length;
    const lineStart = value.lastIndexOf("\n", s - 1) + 1;
    const next = value.slice(0, lineStart) + prefix + value.slice(lineStart);
    onChange(next);
    setSel(s + prefix.length, s + prefix.length);
  }

  function insertAtCursor(text: string) {
    const ta = ref.current;
    const s = ta?.selectionStart ?? value.length;
    const next = value.slice(0, s) + text + value.slice(s);
    onChange(next);
    setSel(s + text.length, s + text.length);
  }

  async function handleImage(files: FileList | null) {
    if (!files || files.length === 0) return;
    setUploading(true);
    try {
      const paths = await onUpload(files);
      if (paths.length) insertAtCursor(`\n${paths.map((p) => `![](${p})`).join("\n")}\n`);
    } finally {
      setUploading(false);
      if (fileRef.current) fileRef.current.value = "";
    }
  }

  return (
    <div className="overflow-hidden rounded-lg border border-border bg-card">
      {/* 工具栏 */}
      <div className="flex flex-wrap items-center gap-0.5 border-b border-border bg-muted/40 px-2 py-1.5">
        <ToolBtn title="标题" onClick={() => prefixLine("## ")}><Heading2 className="h-4 w-4" /></ToolBtn>
        <ToolBtn title="小标题" onClick={() => prefixLine("### ")}><Heading3 className="h-4 w-4" /></ToolBtn>
        <ToolBtn title="加粗" onClick={() => wrap("**", "**", "粗体")}><Bold className="h-4 w-4" /></ToolBtn>
        <ToolBtn title="斜体" onClick={() => wrap("*", "*", "斜体")}><Italic className="h-4 w-4" /></ToolBtn>
        <span className="mx-1 h-4 w-px bg-border" />
        <ToolBtn title="无序列表" onClick={() => prefixLine("- ")}><List className="h-4 w-4" /></ToolBtn>
        <ToolBtn title="有序列表" onClick={() => prefixLine("1. ")}><ListOrdered className="h-4 w-4" /></ToolBtn>
        <ToolBtn title="引用" onClick={() => prefixLine("> ")}><Quote className="h-4 w-4" /></ToolBtn>
        <ToolBtn title="链接" onClick={() => wrap("[", "](https://)", "链接文字")}><Link2 className="h-4 w-4" /></ToolBtn>
        <ToolBtn title="行内代码" onClick={() => wrap("`", "`", "代码")}><Code className="h-4 w-4" /></ToolBtn>
        <span className="mx-1 h-4 w-px bg-border" />
        {/* 文字颜色 */}
        <div className="relative">
          <ToolBtn title="文字颜色" onClick={() => setPalette((p) => (p === "color" ? null : "color"))}><Palette className="h-4 w-4" /></ToolBtn>
          {palette === "color" ? (
            <div className="absolute left-0 top-full z-20 mt-1 flex gap-1.5 rounded-lg border border-border bg-card p-2 shadow-lg">
              {TEXT_COLORS.map(([name, hex]) => (
                <button
                  key={hex}
                  type="button"
                  title={name}
                  onClick={() => { wrap(`<span style="color:${hex}">`, "</span>", "彩色文字"); setPalette(null); }}
                  className="h-5 w-5 rounded-full ring-1 ring-inset ring-black/10 transition hover:scale-110"
                  style={{ background: hex }}
                />
              ))}
            </div>
          ) : null}
        </div>
        {/* 字号 */}
        <div className="relative">
          <ToolBtn title="字号" onClick={() => setPalette((p) => (p === "size" ? null : "size"))}><Type className="h-4 w-4" /></ToolBtn>
          {palette === "size" ? (
            <div className="absolute left-0 top-full z-20 mt-1 flex gap-1 rounded-lg border border-border bg-card p-1.5 shadow-lg">
              {TEXT_SIZES.map(([name, em]) => (
                <button
                  key={em}
                  type="button"
                  onClick={() => { wrap(`<span style="font-size:${em}">`, "</span>", "文字"); setPalette(null); }}
                  className="whitespace-nowrap rounded px-2 py-1 text-xs text-foreground transition hover:bg-primary/10 hover:text-primary"
                >
                  {name}
                </button>
              ))}
            </div>
          ) : null}
        </div>
        <span className="mx-1 h-4 w-px bg-border" />
        <ToolBtn title="插入图片（上传）" onClick={() => fileRef.current?.click()}>
          <ImageIcon className={`h-4 w-4 ${uploading ? "animate-pulse text-primary" : ""}`} />
        </ToolBtn>
        <ToolBtn title="从图片库选择" onClick={() => setPickerOpen(true)}>
          <FolderOpen className="h-4 w-4" />
        </ToolBtn>
        <input ref={fileRef} type="file" accept="image/*" multiple className="hidden" onChange={(e) => handleImage(e.target.files)} />

        <div className="ml-auto flex gap-0.5 text-xs">
          {(["write", "split", "preview"] as const).map((m) => (
            <button key={m} type="button" onClick={() => setMode(m)} className={`rounded px-2 py-1 ${mode === m ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground"}`}>
              {m === "write" ? "编辑" : m === "split" ? "并排" : "预览"}
            </button>
          ))}
        </div>
      </div>

      {/* 编辑 / 预览 */}
      <div className={`grid ${mode === "split" ? "sm:grid-cols-2" : "grid-cols-1"}`}>
        {mode !== "preview" && (
          <textarea
            ref={ref}
            value={value}
            onChange={(e) => onChange(e.target.value)}
            onDrop={(e) => { if (e.dataTransfer.files?.length) { e.preventDefault(); handleImage(e.dataTransfer.files); } }}
            onPaste={(e) => { const imgs = Array.from(e.clipboardData.files).filter((f) => f.type.startsWith("image/")); if (imgs.length) { e.preventDefault(); const dt = new DataTransfer(); imgs.forEach((f) => dt.items.add(f)); handleImage(dt.files); } }}
            placeholder="在这里写正文。用上方按钮排版，可粘贴/拖入图片自动插入。"
            className="h-80 w-full resize-y border-0 bg-card p-3 font-mono text-sm text-foreground outline-none"
          />
        )}
        {mode !== "write" && (
          <div className={`h-80 overflow-auto p-3 ${mode === "split" ? "border-l border-border" : ""} ${previewProse}`}>
            {value.trim() ? (
              <ReactMarkdown remarkPlugins={[remarkGfm]} rehypePlugins={[rehypeRaw]}>{value}</ReactMarkdown>
            ) : (
              <p className="text-muted-foreground">预览区——左边写，这里实时显示排版效果。</p>
            )}
          </div>
        )}
      </div>

      <ImagePicker open={pickerOpen} multiple onClose={() => setPickerOpen(false)} onPick={(ps) => insertAtCursor(`\n${ps.map((p) => `![](${p})`).join("\n")}\n`)} />
    </div>
  );
}
