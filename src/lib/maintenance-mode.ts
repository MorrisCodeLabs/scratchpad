// Set PUBLIC_MAINTENANCE_MODE=true in Vercel's env vars and redeploy to
// lock everyone but the app owner out (gate lives in Workspace.tsx, banner
// in AppShell.tsx). PUBLIC_-prefixed vars are inlined into the client
// bundle by Vite at build time, so toggling always needs a redeploy.
export const MAINTENANCE_MODE = import.meta.env.PUBLIC_MAINTENANCE_MODE === "true";
