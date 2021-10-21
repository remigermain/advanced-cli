import babel from "@rollup/plugin-babel"
import { terser } from "rollup-plugin-terser"
import typescript from '@rollup/plugin-typescript'

const def = {
  input: "src/index.ts",
  output: {
    dir: "dist",
    name: "index",
    format: "umd",
  },
  plugins: [
    babel({
      babelHelpers: "bundled",
      exclude: ["node_modules/**"],
    }),
    typescript()
  ],
}

/* add terset if on production */
if (process.env.NODE_ENV === "production") {
  def.plugins.push(terser())
}

export default def
