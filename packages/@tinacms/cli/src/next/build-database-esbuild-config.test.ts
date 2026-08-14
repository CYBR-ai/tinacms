import type { Loader } from 'esbuild';
import { buildDatabaseEsbuildConfig } from './build-database-esbuild-config';

const baseOpts = {
  entryPoint: '/project/tina/database.ts',
  outfile:
    '/project/tina/__generated__/.cache/12345/database/database.build.mjs',
  external: ['my-custom-native-adapter'],
  loader: { '.ts': 'ts' as Loader },
};

describe('buildDatabaseEsbuildConfig — externalize contract', () => {
  it('externalizes packages passed by the caller', () => {
    const config = buildDatabaseEsbuildConfig(baseOpts);
    expect(config.external).toContain('my-custom-native-adapter');
  });

  it('passes the caller-provided external list through unchanged', () => {
    const config = buildDatabaseEsbuildConfig({
      ...baseOpts,
      external: ['my-custom-native-adapter', 'another-pkg'],
    });
    expect(config.external).toEqual([
      'my-custom-native-adapter',
      'another-pkg',
    ]);
  });

  it('does NOT use `packages: "external"` (broad-externalize regression guard)', () => {
    // Broad externalization can break named imports from CJS dependencies.
    const config = buildDatabaseEsbuildConfig(baseOpts);
    expect(config.packages).toBeUndefined();
  });
});

describe('buildDatabaseEsbuildConfig — output path contract', () => {
  // Locks down the regression where someone changes `loadDatabaseFile` to
  // write to `os.tmpdir()` again. The helper itself doesn't construct paths
  // (the caller does), but it must faithfully forward whatever it's given.
  // The caller-side guarantee that the path is in the project tree is
  // enforced by `prepareCacheLocation()` in cache-manager.ts.

  it('forwards the caller-provided outfile unchanged', () => {
    const config = buildDatabaseEsbuildConfig(baseOpts);
    expect(config.outfile).toBe(baseOpts.outfile);
  });

  it('outfile is whatever was passed in — no remapping', () => {
    const customOutfile = '/some/other/path/build.mjs';
    const config = buildDatabaseEsbuildConfig({
      ...baseOpts,
      outfile: customOutfile,
    });
    expect(config.outfile).toBe(customOutfile);
  });
});

describe('buildDatabaseEsbuildConfig — fixed esbuild options', () => {
  // These options should never change without a careful review — they're
  // the contract Tina's runtime depends on for ESM dynamic-import to work.

  it('bundles user code (entryPoints + bundle: true)', () => {
    const config = buildDatabaseEsbuildConfig(baseOpts);
    expect(config.entryPoints).toEqual([baseOpts.entryPoint]);
    expect(config.bundle).toBe(true);
  });

  it('targets Node ESM output', () => {
    const config = buildDatabaseEsbuildConfig(baseOpts);
    expect(config.platform).toBe('node');
    expect(config.format).toBe('esm');
  });

  it('forwards the caller-provided loader map', () => {
    const customLoader = { '.ts': 'ts' as Loader, '.svg': 'file' as Loader };
    const config = buildDatabaseEsbuildConfig({
      ...baseOpts,
      loader: customLoader,
    });
    expect(config.loader).toBe(customLoader);
  });

  it('injects the createRequire banner so bundled CJS deps can call require()', () => {
    // Some bundled packages (e.g. `scmp` via mongodb-level) use require() for
    // Node built-ins. The banner re-creates require() in the ESM context
    // using Node's official createRequire API. Removing it would silently
    // break any bundled CJS dep that calls require() at runtime.
    const config = buildDatabaseEsbuildConfig(baseOpts);
    expect(config.banner?.js).toContain('createRequire');
    expect(config.banner?.js).toContain('import.meta.url');
  });
});
