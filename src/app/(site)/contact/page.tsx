export const metadata = {
  title: "联系方式",
};

export default function ContactPage() {
  return (
    <main className="mx-auto max-w-4xl px-4 py-10 sm:px-6">
      <h1 className="text-2xl font-semibold tracking-tight text-foreground">联系方式</h1>
      <p className="mt-2 text-sm text-muted-foreground">
        将下方占位图替换为 <code className="text-primary">public/images/</code> 中的真实二维码即可。
      </p>

      <div className="mt-10 grid gap-8 sm:grid-cols-2">
        <div className="rounded-xl border border-border bg-card p-6 text-center shadow-sm">
          <h2 className="text-sm font-medium text-foreground">微信</h2>
          <div className="mx-auto mt-4 flex h-48 w-48 items-center justify-center overflow-hidden rounded-lg border border-border bg-muted">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/images/qr-wechat.svg" alt="微信二维码占位" width={192} height={192} className="h-full w-full object-cover" />
          </div>
          <p className="mt-3 text-xs text-muted-foreground">替换 public/images/qr-wechat.svg</p>
        </div>
        <div className="rounded-xl border border-border bg-card p-6 text-center shadow-sm">
          <h2 className="text-sm font-medium text-foreground">社群</h2>
          <div className="mx-auto mt-4 flex h-48 w-48 items-center justify-center overflow-hidden rounded-lg border border-border bg-muted">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/images/qr-community.svg"
              alt="社群二维码占位"
              width={192}
              height={192}
              className="h-full w-full object-cover"
            />
          </div>
          <p className="mt-3 text-xs text-muted-foreground">替换 public/images/qr-community.svg</p>
        </div>
      </div>
    </main>
  );
}
