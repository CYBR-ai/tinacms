import type { Config } from '@tinacms/schema-tools';
import { resolveDatabaseExternals } from './external-resolver';

/**
 * Helper to build a minimal Config object with just the build fields these
 * tests care about. Casts the result so we don't have to fill in every
 * required Config property unrelated to externalize behavior.
 */
const buildConfig = (externalDependencies?: string[]): Config | undefined => {
  if (externalDependencies === undefined) {
    return {
      build: { publicFolder: 'public', outputFolder: 'admin' },
    } as unknown as Config;
  }
  return {
    build: {
      publicFolder: 'public',
      outputFolder: 'admin',
      externalDependencies,
    },
  } as unknown as Config;
};

describe('resolveDatabaseExternals', () => {
  it('returns an empty list when no external dependencies are configured', () => {
    expect(resolveDatabaseExternals(buildConfig())).toEqual([]);
  });

  it('returns an empty list when config is undefined', () => {
    expect(resolveDatabaseExternals(undefined)).toEqual([]);
  });

  it('returns an empty list when build is undefined', () => {
    expect(resolveDatabaseExternals({} as Config)).toEqual([]);
  });

  it('returns user-provided external dependencies', () => {
    const result = resolveDatabaseExternals(
      buildConfig(['my-custom-native-adapter', 'another-pkg'])
    );
    expect(result).toEqual(['my-custom-native-adapter', 'another-pkg']);
  });

  it('preserves the user list order', () => {
    const result = resolveDatabaseExternals(buildConfig(['z-pkg', 'a-pkg']));
    expect(result).toEqual(['z-pkg', 'a-pkg']);
  });

  it('handles an empty user-extension list', () => {
    expect(resolveDatabaseExternals(buildConfig([]))).toEqual([]);
  });
});
