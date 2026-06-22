import normalizePath from 'normalize-path';
import type { ConfigManager } from '../config-manager';

/**
 * The Vite `base` for the admin SPA, e.g. `/admin/` (or `/<basePath>/admin/`
 * when a build.basePath is configured). Vite serves every asset under this
 * base — including its internal dev endpoints (`/@vite/client`,
 * `/@react-refresh`, `/src/main.tsx`) — so any HTML referencing those must
 * include it too. Returned with both a leading and trailing slash.
 */
export const getAdminBasePath = (configManager: ConfigManager): string => {
  const basePath = configManager.config.build.basePath;
  return `/${basePath ? `${normalizePath(basePath)}/` : ''}${normalizePath(
    configManager.config.build.outputFolder
  )}/`;
};
