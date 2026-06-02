import type { ImgHTMLAttributes } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { resolveArticleMarkdownAssetUrl } from "@/lib/article-assets";
import { makeSlugger } from "@/lib/toc";
import { bodyTextStyle, paragraphStyle } from "@/lib/article-style";

type HastNode = {
  type: string;
  tagName?: string;
  value?: string;
  properties?: Record<string, unknown>;
  children?: HastNode[];
};

function hastText(node: HastNode): string {
  if (node.type === "text") return node.value ?? "";
  if (node.children) return node.children.map(hastText).join("");
  return "";
}

/** 给 h2/h3 注入与目录(extractToc)一致的锚点 id，供 TOC 跳转 */
function rehypeHeadingIds() {
  const slug = makeSlugger();
  const visit = (node: HastNode) => {
    if (node.type === "element" && (node.tagName === "h2" || node.tagName === "h3")) {
      node.properties = node.properties ?? {};
      if (!node.properties.id) node.properties.id = slug(hastText(node));
    }
    node.children?.forEach(visit);
  };
  return (tree: HastNode) => visit(tree);
}

export function ArticleBody({
  content,
  articleSlug,
}: {
  content: string;
  /** 如 `cogrow/10years02`，用于把 `![](images/a.png)` 解析到 content/articles 下 */
  articleSlug?: string;
}) {
  return (
    <ReactMarkdown
      remarkPlugins={[remarkGfm]}
      rehypePlugins={[rehypeHeadingIds]}
      components={{
        h1: (props) => (
          <h1 className="mt-12 text-[1.75rem] sm:text-[2rem] lg:text-[2.25rem] font-bold leading-[1.3] tracking-tight text-foreground first:mt-0" {...props} />
        ),
        h2: (props) => (
          <h2 className="mt-10 scroll-mt-24 text-[1.35rem] sm:text-[1.5rem] lg:text-[1.75rem] font-semibold leading-[1.4] text-foreground/95" {...props} />
        ),
        h3: (props) => <h3 className="mt-8 scroll-mt-24 text-[1.15rem] sm:text-[1.25rem] lg:text-[1.35rem] font-semibold leading-[1.5] text-foreground" {...props} />,
        h4: (props) => <h4 className="mt-6 text-[1.05rem] sm:text-[1.15rem] font-semibold leading-[1.5] text-foreground" {...props} />,
        p: (props) => <p className="text-muted-foreground" style={paragraphStyle} {...props} />,
        a: (props) => (
          <a
            className="font-medium text-primary underline decoration-primary/30 underline-offset-4 hover:opacity-80"
            {...props}
          />
        ),
        ul: (props) => <ul className="mt-5 list-disc space-y-3 pl-[2.5em] text-muted-foreground sm:pl-[3.5em]" style={bodyTextStyle} {...props} />,
        ol: (props) => <ol className="mt-5 list-decimal space-y-3 pl-[2.5em] text-muted-foreground sm:pl-[3.5em]" style={bodyTextStyle} {...props} />,
        li: (props) => <li {...props} />,
        code: (props) => {
          const { className, children, ...rest } = props;
          const isBlock = Boolean(className);
          if (isBlock) {
            return (
              <code
                className={`font-mono text-[0.9em] text-foreground/95 ${className ?? ""}`}
                {...rest}
              >
                {children}
              </code>
            );
          }
          return (
            <code
              className="rounded border border-border bg-muted px-1.5 py-0.5 font-mono text-[0.9em] text-primary"
              {...rest}
            >
              {children}
            </code>
          );
        },
        pre: (props) => (
          <pre
            className="mt-4 overflow-x-auto rounded-lg border border-border bg-muted/80 p-4 text-sm leading-relaxed"
            {...props}
          />
        ),
        blockquote: (props) => (
          <blockquote
            className="mt-6 border-l-4 border-primary/40 bg-primary/5 py-3 pl-4 pr-4 italic text-muted-foreground sm:pl-5"
            style={bodyTextStyle}
            {...props}
          />
        ),
        hr: () => <hr className="my-10 border-border" />,
        img: ({ src, alt, ...rest }: ImgHTMLAttributes<HTMLImageElement>) => {
          const resolved =
            articleSlug && typeof src === "string"
              ? resolveArticleMarkdownAssetUrl(src, articleSlug)
              : src;
          return (
            // eslint-disable-next-line @next/next/no-img-element -- 正文内用户任意相对路径，用原生 img + /media 路由
            <img
              {...rest}
              src={resolved}
              alt={alt ?? ""}
              className="mt-4 max-h-[min(70vh,720px)] w-auto max-w-full rounded-lg border border-border object-contain shadow-sm"
              loading="lazy"
              decoding="async"
            />
          );
        },
      }}
    >
      {content}
    </ReactMarkdown>
  );
}
