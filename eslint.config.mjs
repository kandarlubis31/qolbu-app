import js from '@eslint/js';
import tseslint from 'typescript-eslint';
import astroParser from 'astro-eslint-parser';
import pluginAstro from 'eslint-plugin-astro';
import pluginTailwind from 'eslint-plugin-tailwindcss';

export default tseslint.config(
  { ignores: ['dist/', 'node_modules/', '.astro/', '*.config.*', 'src/**/*.d.ts', 'e2e/', 'playwright.config.ts', 'vitest.setup.ts'] },

  {
    files: ['**/*.astro'],
    languageOptions: {
      parser: astroParser,
      parserOptions: {
        extraFileExtensions: ['.astro'],
        ecmaVersion: 'latest',
        sourceType: 'module',
        parser: tseslint.parser,
      },
    },
    settings: {
      'astro/typescript-enable': true,
    },
    plugins: {
      astro: pluginAstro,
      tailwindcss: pluginTailwind,
    },
    rules: {
      ...pluginAstro.configs.recommended.rules,
    },
  },

  {
    files: ['**/*.ts', '**/*.mjs'],
    languageOptions: {
      ecmaVersion: 'latest',
      sourceType: 'module',
      parser: tseslint.parser,
      parserOptions: {
        ecmaVersion: 'latest',
        sourceType: 'module',
      },
    },
    plugins: {
      '@typescript-eslint': tseslint.plugin,
      tailwindcss: pluginTailwind,
    },
    rules: {
      ...js.configs.recommended.rules,
      ...tseslint.configs.recommended.rules,
      '@typescript-eslint/no-explicit-any': 'warn',
      '@typescript-eslint/no-unused-vars': ['warn', { argsIgnorePattern: '^_' }],
      '@typescript-eslint/consistent-type-imports': 'warn',
    },
  },

  {
    files: ['**/*.js'],
    languageOptions: {
      ecmaVersion: 'latest',
      sourceType: 'module',
      globals: {
        self: 'readonly',
        caches: 'readonly',
        fetch: 'readonly',
        URL: 'readonly',
        console: 'readonly',
      },
    },
    plugins: {
      tailwindcss: pluginTailwind,
    },
    rules: {
      ...js.configs.recommended.rules,
    },
  }
);