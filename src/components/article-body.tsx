import type { ImgHTMLAttributes } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { resolveArticleMarkdownAssetUrl } from "@/lib/article-assets";

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
      components={{
        h1: (props) => (
          <h1 className="mt-12 text-[2.0rem] font-bold leading-[1.3] tracking-tight text-foreground first:mt-0" {...props} />
        ),
        h2: (props) => (
          <h2 className="mt-10 text-[1.5rem] font-semibold leading-[1.4] text-foreground/95" {...props} />
        ),
        h3: (props) => <h3 className="mt-8 text-[1.2rem] font-semibold leading-[1.5] text-foreground" {...props} />,
        h4: (props) => <h4 className="mt-6 text-[1.15rem] font-semibold leading-[1.5] text-foreground" {...props} />,
        p: (props) => (
          <p
            className="mt-5 text-justify text-[1.05rem] leading-[1.5] tracking-[0.02em] text-muted-foreground"
            style={{ textIndent: "2em" }}
            {...props}
          />
        ),
        a: (props) => (
          <a
            className="font-medium text-primary underline decoration-primary/30 underline-offset-4 hover:opacity-80"
            {...props}
          />
        ),
        ul: (props) => <ul className="mt-5 list-disc space-y-3 pl-[3.5em] text-[1.05rem] leading-[1.5] tracking-[0.02em] text-muted-foreground" {...props} />,
        ol: (props) => <ol className="mt-5 list-decimal space-y-3 pl-[3.5em] text-[1.05rem] leading-[1.5] tracking-[0.02em] text-muted-foreground" {...props} />,
        li: (props) => <li className="leading-[1.5]" {...props} />,
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
            className="mt-6 border-l-4 border-primary/40 bg-primary/5 py-3 pl-5 pr-4 text-[1.05rem] leading-[1.5] text-muted-foreground italic"
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
