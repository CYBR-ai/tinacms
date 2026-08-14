import type { Config } from '@tinacms/schema-tools';

/**
 * Resolve packages explicitly configured for externalization when bundling
 * `tina/database.ts`.
 */
export const resolveDatabaseExternals = (
  config: Config | undefined
): string[] => {
  return config?.build?.externalDependencies ?? [];
};
