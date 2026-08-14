// Adapter-matrix tests need native ESM because they import config-manager.ts,
// which uses import.meta.url. Keep that setup isolated so the default CLI Jest
// suite can stay on its existing CJS-compatible config.
//
import base from './jest.config.js';

export default {
  ...base,
  extensionsToTreatAsEsm: ['.ts'],
  // Keep adapter tests out of the default Jest run; enable discovery here.
  testMatch: ['**/*.adapter-test.[jt]s?(x)'],
};
