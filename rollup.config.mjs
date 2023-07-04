import sass from 'rollup-plugin-sass';
import { uglify } from 'rollup-plugin-uglify';
import typescript from 'rollup-plugin-typescript2';
import commonjs from '@rollup/plugin-commonjs';

import pkg from './package.json' assert {type: "json"};

export default {
  input: 'src/index.ts',
  output: [
    {
      file: pkg.main,
      format: 'cjs',
      exports: 'named',
      sourcemap: true,
      strict: false,
    }, 
  ],
  plugins: [commonjs(), sass({ insert: true }), typescript(), uglify()],
  external: ['react', 'react-dom',"react-native-toast-message","prop-types", "firebase/app", "firebase/auth"],
};
 