/** Exact directory URLs only (with or without trailing slash after normalizePath). */
export const ELEMENTOR_ASSETS_DIRECTORY_PATH =
  '/wp-static/wp-content/plugins/elementor/assets' as const;

export function isElementorAssetsDirectoryGone(pathname: string): boolean {
  return pathname === ELEMENTOR_ASSETS_DIRECTORY_PATH;
}