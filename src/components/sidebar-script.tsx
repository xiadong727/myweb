import { SIDEBAR_COLLAPSED_KEY } from "@/lib/sidebar";

/** 与侧栏折叠状态同步，减少布局跳动 */
export function SidebarScript() {
  const key = JSON.stringify(SIDEBAR_COLLAPSED_KEY);
  const code = `(function(){try{var k=${key};if(localStorage.getItem(k)==='1')document.documentElement.setAttribute('data-sidebar','collapsed');}catch(e){}})();`;
  return <script dangerouslySetInnerHTML={{ __html: code }} />;
}
