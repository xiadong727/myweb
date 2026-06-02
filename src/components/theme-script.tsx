import { THEME_IDS, THEME_STORAGE_KEY } from "@/lib/themes";

/** 首屏前执行，减少主题切换时的闪烁。服务端渲染为普通 <script>，随首屏 HTML 同步执行。 */
export function ThemeScript() {
  const list = JSON.stringify([...THEME_IDS]);
  const code = `(function(){try{var k=${JSON.stringify(THEME_STORAGE_KEY)};var t=localStorage.getItem(k);var a=${list};if(t&&a.indexOf(t)>=0)document.documentElement.setAttribute('data-theme',t);}catch(e){}})();`;
  return <script dangerouslySetInnerHTML={{ __html: code }} />;
}
