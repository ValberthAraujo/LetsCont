import js from '@eslint/js'
import globals from 'globals'
import react from 'eslint-plugin-react'
import reactHooks from 'eslint-plugin-react-hooks'
import reactRefresh from 'eslint-plugin-react-refresh'
import { defineConfig, globalIgnores } from 'eslint/config'

export default defineConfig([
  globalIgnores(['dist']),
  {
    files: ['**/*.{js,jsx}'],
    plugins: { react },
    extends: [
      js.configs.recommended,
      reactHooks.configs['recommended-latest'],
      reactRefresh.configs.vite,
    ],
    languageOptions: {
      ecmaVersion: 2020,
      globals: globals.browser,
      parserOptions: {
        ecmaVersion: 'latest',
        ecmaFeatures: { jsx: true },
        sourceType: 'module',
      },
    },
    rules: {
      // Treat JSX references as usage to avoid false positives
      'react/jsx-uses-vars': 'error',
      'react/react-in-jsx-scope': 'off',
      // Allow empty catch blocks (used intentionally for permissive fallbacks)
      'no-empty': ['error', { allowEmptyCatch: true }],
      // Ignore unused vars when they start with _ or are ALLCAPS; also ignore unused args/caught errors starting with _
      'no-unused-vars': ['error', { varsIgnorePattern: '^[A-Z_]', argsIgnorePattern: '^_', caughtErrorsIgnorePattern: '^_' }],
    },
    settings: { react: { version: 'detect' } },
  },
  // Node environment for scripts
  {
    files: ['scripts/**/*.js'],
    languageOptions: {
      globals: { ...globals.node },
      sourceType: 'module',
    },
  },
  // Relax react-refresh rule for context/hooks files to allow named exports
  {
    files: ['src/context/**/*.{js,jsx}'],
    rules: {
      'react-refresh/only-export-components': 'off',
    },
  },
])
