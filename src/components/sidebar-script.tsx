import { SIDEBAR_COLLAPSED_KEY } from "@/lib/sidebar";

/** 与侧栏折叠状态同步，减少布局跳动。服务端渲染为普通 <script>，随首屏 HTML 同步执行。 */
export function SidebarScript() {
  const key = JSON.stringify(SIDEBAR_COLLAPSED_KEY);
  const code = `(function(){try{var k=${key};if(localStorage.getItem(k)==='1')document.documentElement.setAttribute('data-sidebar','collapsed');}catch(e){}})();`;
  return <script dangerouslySetInnerHTML={{ __html: code }} />;
}
