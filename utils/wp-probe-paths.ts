/** WordPress login probes that never existed on this Next host. */
export const WP_PROBE_PATHS = [
  '/wp-login.php',
  '/xmlrpc.php',
  '/wp-admin',
] as const;

export function isWpProbePath(pathname: string): boolean {
  const path = pathname.split(/[?#]/)[0];
  const normalized = path.length > 1 ? path.replace(/\/+$/, '') : path || '/';
  return (
    normalized === '/wp-login.php'
    || normalized === '/xmlrpc.php'
    || normalized === '/wp-admin'
    || normalized.startsWith('/wp-admin/')
  );
}
