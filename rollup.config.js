import { terser } from "rollup-plugin-terser"
import typescript from '@rollup/plugin-typescript'

const isProd = process.env.NODE_ENV === "production"

const def = {
  input: "src/index.ts",
  output: {
    dir: "dist",
    name: "index",
    format: "umd",
    globals: {
      colorette: 'colorette'
    }
  },
  external: ['colorette'],
  plugins: [
    typescript()
  ],
}

/* add terset if on production */
if (isProd) {
  def.plugins.push(terser())
}

export default def
