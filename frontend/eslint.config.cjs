const tseslint = require('typescript-eslint');
const reactHooksPlugin = require('eslint-plugin-react-hooks');
const reactRefreshPlugin = require('eslint-plugin-react-refresh');

module.exports = tseslint.config(
  {
    ignores: [
      'dist/**',
      'node_modules/**',
      'coverage/**',
      '**/*.js',
      '!eslint.config.cjs',
      'vite.config.ts',
      'vitest.config.ts',
    ],
  },
  // Main source files with type-aware linting
  {
    files: ['src/**/*.{ts,tsx}'],
    ignores: ['**/*.test.ts', '**/*.test.tsx', '**/__tests__/**'],
    languageOptions: {
      parser: tseslint.parser,
      parserOptions: {
        ecmaVersion: 2022,
        sourceType: 'module',
        project: './tsconfig.json',
        ecmaFeatures: {
          jsx: true,
        },
      },
    },
    plugins: {
      '@typescript-eslint': tseslint.plugin,
      'react-hooks': reactHooksPlugin,
      'react-refresh': reactRefreshPlugin,
    },
    rules: {
      '@typescript-eslint/no-unused-vars': [
        'error',
        { argsIgnorePattern: '^_' },
      ],
      '@typescript-eslint/explicit-function-return-type': 'off',
      '@typescript-eslint/no-explicit-any': 'warn',
      'react-hooks/rules-of-hooks': 'error',
      'react-hooks/exhaustive-deps': 'warn',
      'react-refresh/only-export-components': 'warn',
    },
  },
  // Test files with relaxed rules
  {
    files: ['**/*.test.ts', '**/*.test.tsx', '**/__tests__/**/*.{ts,tsx}'],
    languageOptions: {
      parser: tseslint.parser,
      parserOptions: {
        ecmaVersion: 2022,
        sourceType: 'module',
      },
    },
    plugins: {
      '@typescript-eslint': tseslint.plugin,
    },
    rules: {
      '@typescript-eslint/no-unused-vars': [
        'error',
        { argsIgnorePattern: '^_' },
      ],
      '@typescript-eslint/no-explicit-any': 'off',
      'no-console': 'off',
    },
  }
);
