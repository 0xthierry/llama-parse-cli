import { defineConfig } from 'tsup'

export default defineConfig({
  entry: ['src/server.ts'], // specify the entry file
  format: ['esm'], // output format
  bundle: true, // bundle the code into a single file
  minify: true, // optionally minify the output
  sourcemap: true, // generate sourcemaps for debugging
  outDir: 'dist', // output directory
  target: 'es2022', // specify the target ECMAScript version
  clean: true, // clean the output directory before bundling
})