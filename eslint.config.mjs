import { configs as nxConfigs } from '@nx/eslint-plugin';
import eslintConfigPrettier from 'eslint-config-prettier/flat';
import { importX } from 'eslint-plugin-import-x';
import tsParser from '@typescript-eslint/parser';
import eslintPluginUnicorn from 'eslint-plugin-unicorn';
import globals from 'globals';

const importXFiles = ['**/*.ts', '**/*.tsx', '**/*.cts', '**/*.mts', '**/*.js', '**/*.jsx', '**/*.cjs', '**/*.mjs'];

export default [
  ...nxConfigs['flat/base'],
  ...nxConfigs['flat/typescript'],
  ...nxConfigs['flat/javascript'],
  eslintConfigPrettier,

  {
    ...importX.flatConfigs.recommended,
    files: importXFiles,
  },
  {
    ...importX.flatConfigs.typescript,
    files: importXFiles,
  },

  {
    ignores: [
      '**/dist',
      '**/vite.config.*.timestamp*',
      '**/vitest.config.*.timestamp*',
      '**/node_modules',
      '**/legacy',
      '**/examples',
    ],
  },

  {
    files: ['**/*.ts', '**/*.tsx', '**/*.js', '**/*.jsx'],
    rules: {
      '@nx/enforce-module-boundaries': [
        'error',
        {
          enforceBuildableLibDependency: true,
          allow: ['^.*/eslint(\\.base)?\\.config\\.[cm]?[jt]s$'],
          depConstraints: [
            {
              sourceTag: '*',
              onlyDependOnLibsWithTags: ['*'],
            },
          ],
        },
      ],
    },
  },

  {
    files: importXFiles,
    languageOptions: {
      parser: tsParser,
      ecmaVersion: 'latest',
      sourceType: 'module',
      globals: globals.builtin,
    },
    plugins: {
      unicorn: eslintPluginUnicorn,
    },
    rules: {
      '@typescript-eslint/consistent-type-definitions': ['error', 'type'],
      '@typescript-eslint/no-unused-vars': [
        'error',
        {
          args: 'all',
          argsIgnorePattern: '^_',
          caughtErrors: 'all',
          caughtErrorsIgnorePattern: '^_',
          destructuredArrayIgnorePattern: '^_',
          varsIgnorePattern: '^_',
          ignoreRestSiblings: true,
        },
      ],
      '@typescript-eslint/no-non-null-assertion': 'off',

      'import-x/order': ['error', { 'newlines-between': 'always' }],
      'import-x/no-named-as-default': ['off'],
      'import-x/no-unresolved': ['error', { ignore: ['pixora'] }],

      'unicorn/filename-case': [
        'error',
        {
          case: 'kebabCase',
        },
      ],
      'unicorn/no-null': 'off',
    },
  },
];
