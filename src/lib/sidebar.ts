export const SIDEBAR_COLLAPSED_KEY = "portfolio-sidebar-collapsed";

/** 桌面侧栏宽度（px），与 SiteChrome 中拖动条共用 */
export const SIDEBAR_WIDTH_KEY = "portfolio-sidebar-width-px";

export const SIDEBAR_WIDTH_DEFAULT = 280;
export const SIDEBAR_WIDTH_MIN = 200;
export const SIDEBAR_WIDTH_MAX = 480;

/** 主内容区至少保留的宽度（px），避免侧栏拖满屏 */
export const SIDEBAR_MAIN_MIN = 200;

/** 将侧栏宽度限制在配置范围与当前视口内 */
export function clampSidebarWidthPx(width: number, viewportWidth: number): number {
  const maxByViewport = Math.min(
    SIDEBAR_WIDTH_MAX,
    Math.max(SIDEBAR_WIDTH_MIN, viewportWidth - SIDEBAR_MAIN_MIN),
  );
  return Math.min(maxByViewport, Math.max(SIDEBAR_WIDTH_MIN, Math.round(width)));
}
