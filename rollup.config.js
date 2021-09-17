import typescript from 'rollup-plugin-typescript2'
import bundleSize from 'rollup-plugin-bundle-size'
import { terser } from 'rollup-plugin-terser'

import pkg from './package.json'

export default [
  // CommonJS (for Node) and ES module (for bundlers) build.
  {
    input: 'src/depsin.ts',
    external: [],
    plugins: [typescript(), terser(), bundleSize()],
    output: [{ file: pkg.main, format: 'cjs' }, { file: pkg.module, format: 'es' }]
  }
]
