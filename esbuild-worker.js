const { build } = require('esbuild');

build({
  entryPoints: ['./worker/index.ts'],
  bundle: true,
  sourcemap: process.env.NODE_ENV !== 'production',
  format: 'esm',
  outfile: './dist/worker.mjs',
  minify: process.env.NODE_ENV === 'production',
  define: {
    'process.env.NODE_ENV': `"${process.env.NODE_ENV}"`,
  },
  external: ['__STATIC_CONTENT_MANIFEST'],
}).catch(() => process.exit(1));
