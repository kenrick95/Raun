/* eslint-env node */
import svelte from 'rollup-plugin-svelte';
import resolve from 'rollup-plugin-node-resolve';
import commonjs from 'rollup-plugin-commonjs';
import livereload from 'rollup-plugin-livereload';
import replace from 'rollup-plugin-replace';
import json from 'rollup-plugin-json';
import { terser } from 'rollup-plugin-terser';

const production = !process.env.ROLLUP_WATCH;

export default {
  input: 'src/main.js',
  output: {
    sourcemap: true,
    format: 'iife',
    name: 'app',
    file: 'dist/bundle.js'
  },
  plugins: [
    json({
      exclude: ['node_modules/**'],
      preferConst: true,
      compact: true,
      namedExports: false
    }),

    replace({
      'process.env.NODE_ENV': production
        ? JSON.stringify('production')
        : JSON.stringify('development')
    }),

    svelte({
      // enable run-time checks when not in production
      dev: !production,
      // we'll extract any component CSS out into
      // a separate file — better for performance
      css: (css) => {
        css.write('dist/bundle.css');
      }
    }),

    // If you have external dependencies installed from
    // npm, you'll most likely need these plugins. In
    // some cases you'll need additional configuration —
    // consult the documentation for details:
    // https://github.com/rollup/rollup-plugin-commonjs
    resolve(),
    commonjs(),

    // Watch the `dist` directory and refresh the
    // browser on changes when not in production
    !production && livereload('dist'),

    // If we're building for production (npm run build
    // instead of npm run dev), minify
    production && terser()
  ]
};
