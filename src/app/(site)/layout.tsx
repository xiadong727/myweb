import { getNavigation } from "@/lib/navigation";
import { SiteChrome } from "@/components/site-chrome";

export default function SiteLayout({ children }: { children: React.ReactNode }) {
  const nav = getNavigation();
  return <SiteChrome nav={nav}>{children}</SiteChrome>;
}
