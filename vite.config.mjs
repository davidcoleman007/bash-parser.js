// import SegfaultHandler  from 'segfault-handler';
// SegfaultHandler.registerHandler('crash.log');

import { defineConfig } from 'vite'

export default defineConfig({
  test: {
    testTimeout: 30000,
    globals: true,
    alias: {
      '~/': new URL('./src/', import.meta.url).pathname,
    },
  },
})
