/// <reference types="vitest" />
import { defineConfig } from 'vite';

// micromark ships an assertion-heavy `dev/` build behind the `development`
// export condition. Under Vite 6 that condition is selected whenever NODE_ENV
// is not "production", which surfaces micromark's internal dev-only assertions
// during tests. Pin production so its optimized `default` build resolves, as it
// did before the Vite/Vitest upgrade. Set before Vitest defaults NODE_ENV.
process.env.NODE_ENV = 'production';

export default defineConfig({
  test: {
    coverage: {
      include: ['src/database/datalayer.ts', 'src/database/index.ts'],
    },
  },
});
