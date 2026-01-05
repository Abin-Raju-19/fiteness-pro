import eslintJs from '@eslint/js'
import tseslint from '@typescript-eslint/eslint-plugin'
import tsParser from '@typescript-eslint/parser'
import globals from 'globals'
import { defineConfig } from 'eslint/config'

export default defineConfig([
  {
    files: ['**/*.{ts,tsx}'],
    ignores: ['dist'],
    languageOptions: {
      parser: tsParser,
      parserOptions: {
        sourceType: 'module',
        ecmaVersion: 'latest'
      },
      globals: {
        ...globals.node
      }
    },
    plugins: {
      '@typescript-eslint': tseslint
    },
    rules: {
      ...eslintJs.configs.recommended.rules,
      ...tseslint.configs.recommended.rules
    }
  },
  {
    files: ['src/__tests__/**/*.{ts,tsx}'],
    languageOptions: {
      parser: tsParser,
      parserOptions: {
        sourceType: 'module',
        ecmaVersion: 'latest'
      },
      globals: {
        ...globals.node,
        ...globals.jest
      }
    }
  }
])


