export const metadata = {
  title: "联系方式",
};

export default function ContactPage() {
  return (
    <main className="mx-auto max-w-4xl px-4 py-10 sm:px-6">
      <h1 className="text-2xl font-semibold tracking-tight text-foreground">联系方式</h1>

      <div className="mt-10 grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
        <div className="rounded-xl border border-border bg-card p-6 text-center shadow-sm">
          <h2 className="text-sm font-medium text-foreground">微信</h2>
          <div className="mx-auto mt-4 flex aspect-square w-full max-w-[16rem] items-center justify-center overflow-hidden rounded-lg">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/images/mywechat.jpg" alt="微信二维码" width={256} height={256} className="h-full w-full object-contain" />
          </div>
        </div>
        <div className="rounded-xl border border-border bg-card p-6 text-center shadow-sm">
          <h2 className="text-sm font-medium text-foreground">公众号</h2>
          <div className="mx-auto mt-4 flex aspect-square w-full max-w-[16rem] items-center justify-center overflow-hidden rounded-lg">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/images/gongzhonghao.jpg"
              alt="微信公众号"
              width={256}
              height={256}
              className="h-full w-full object-contain"
            />
          </div>
        </div>
        <div className="rounded-xl border border-border bg-card p-6 text-center shadow-sm">
          <h2 className="text-sm font-medium text-foreground">视频号</h2>
          <div className="mx-auto mt-4 flex aspect-square w-full max-w-[16rem] items-center justify-center overflow-hidden rounded-lg">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/images/shipinhao.jpg"
              alt="视频号"
              width={256}
              height={256}
              className="h-full w-full object-contain"
            />
          </div>
        </div>
      </div>
    </main>
  );
}
