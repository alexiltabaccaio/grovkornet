import tsPlugin from '@typescript-eslint/eslint-plugin';
import tsParser from '@typescript-eslint/parser';
import importPlugin from 'eslint-plugin-import';
import unusedImports from 'eslint-plugin-unused-imports';
import reactPlugin from 'eslint-plugin-react';
import reactHooksPlugin from 'eslint-plugin-react-hooks';
import i18nextPlugin from 'eslint-plugin-i18next';
import conartiFsdPlugin from '@conarti/eslint-plugin-feature-sliced';
import zustandPlugin from 'eslint-plugin-zustand';

const fsdDeepImportRestrictions = {
  group: [
    '@entities/*/**',
    '@features/*/**',
    '@widgets/*/**',
    '@screens/*/**',
  ],
  message: 'Import from the slice public API (e.g. "@entities/code-snippet") instead of deep paths, or use relative paths for internal files.',
};

const fsdLayerRestrictions = {
  shared: {
    group: ['@app/**', '@screens/**', '@widgets/**', '@features/**', '@entities/**'],
    message: 'The "shared" layer cannot import from higher layers.',
  },
  entities: {
    group: ['@app/**', '@screens/**', '@widgets/**', '@features/**'],
    message: 'The "entities" layer cannot import from higher layers.',
  },
  features: {
    group: ['@app/**', '@screens/**', '@widgets/**'],
    message: 'The "features" layer cannot import from higher layers.',
  },
  widgets: {
    group: ['@app/**', '@screens/**'],
    message: 'The "widgets" layer cannot import from higher layers.',
  },
  screens: {
    group: ['@app/**'],
    message: 'The "screens" layer cannot import from higher layers.',
  }
};

export default [
  {
    ignores: ['dist/**', 'node_modules/**', 'coverage/**', 'vite.config.ts', 'vite-plugin-local-fs.ts'],
  },
  {
    files: ['**/*.{ts,tsx}'],
    plugins: {
      '@typescript-eslint': tsPlugin,
      'import': importPlugin,
      'unused-imports': unusedImports,
      'react': reactPlugin,
      'react-hooks': reactHooksPlugin,
      'i18next': i18nextPlugin,
      '@conarti/feature-sliced': conartiFsdPlugin,
      'zustand': zustandPlugin,
    },
    languageOptions: {
      parser: tsParser,
      parserOptions: {
        project: './tsconfig.json',
        ecmaVersion: 'latest',
        sourceType: 'module',
        ecmaFeatures: {
          jsx: true,
        },
      },
    },
    rules: {
      ...tsPlugin.configs.recommended.rules,
      ...tsPlugin.configs['recommended-requiring-type-checking'].rules,
      ...reactPlugin.configs.recommended.rules,
      ...reactHooksPlugin.configs.recommended.rules,
      'react-hooks/immutability': 'off',
      '@typescript-eslint/no-explicit-any': 'error',
      'require-await': 'off',
      '@typescript-eslint/require-await': 'error',
      '@typescript-eslint/no-floating-promises': ['error', {
        ignoreVoid: true,
        ignoreIIFE: false,
      }],
      '@typescript-eslint/no-misused-promises': [
        'error',
        {
          checksVoidReturn: true,
          checksConditionals: true,
        },
      ],
      '@typescript-eslint/no-unused-vars': 'off',
      'unused-imports/no-unused-imports': 'error',
      'unused-imports/no-unused-vars': [
        'warn',
        {
          'vars': 'all',
          'varsIgnorePattern': '^_',
          'args': 'after-used',
          'argsIgnorePattern': '^_',
        },
      ],
      'no-console': ['warn', { allow: ['warn', 'error'] }],
      'eqeqeq': ['error', 'always'],
      'react/react-in-jsx-scope': 'off',
      'react/prop-types': 'off',
      'no-restricted-imports': ['error', {
        patterns: [
          {
            group: ['../../../**'],
            message: 'Relative imports going up 3 or more levels are not allowed. Please use path aliases (@features/, @shared/, etc.) instead.',
          },
          fsdDeepImportRestrictions
        ]
      }],
      'i18next/no-literal-string': 'off',
      '@conarti/feature-sliced/layers-slices': ['error', {
        ignoreInFilesPatterns: ['**/*.test.{ts,tsx}', '**/__tests__/**', '**/__mocks__/**', '**/jest.setup.ts']
      }],
      '@conarti/feature-sliced/absolute-relative': ['error', {
        ignoreInFilesPatterns: ['**/*.test.{ts,tsx}', '**/__tests__/**', '**/__mocks__/**', '**/jest.setup.ts']
      }],
      '@conarti/feature-sliced/public-api': ['error', {
        ignoreInFilesPatterns: ['**/*.test.{ts,tsx}', '**/__tests__/**', '**/__mocks__/**', '**/jest.setup.ts']
      }],
    },
    settings: {
      react: {
        version: 'detect',
      },
      'import/resolver': {
        typescript: {
          alwaysTryTypes: true,
          project: './tsconfig.json',
        },
      },
    },
  },
  // --- FSD RULES: LAYER BOUNDARIES ---
  {
    files: ['src/shared/**/*.{ts,tsx}'],
    rules: {
      'no-restricted-imports': ['error', {
        patterns: [
          {
            group: ['@app/**', '@screens/**', '@widgets/**', '@features/**', '@entities/**'],
            message: 'The "shared" layer cannot import from higher layers.',
          },
          {
            group: ['../../../**'],
            message: 'Relative imports going up 3 or more levels are not allowed. Please use path aliases (@features/, @shared/, etc.) instead.',
          },
          fsdDeepImportRestrictions
        ]
      }],
    }
  },
  {
    files: ['src/entities/**/*.{ts,tsx}'],
    rules: {
      'no-restricted-imports': ['error', {
        patterns: [
          {
            group: ['@app/**', '@screens/**', '@widgets/**', '@features/**'],
            message: 'The "entities" layer cannot import from higher layers.',
          },
          {
            group: ['../../../**'],
            message: 'Relative imports going up 3 or more levels are not allowed. Please use path aliases (@features/, @shared/, etc.) instead.',
          },
          fsdDeepImportRestrictions
        ]
      }],
    }
  },
  {
    files: ['src/features/**/*.{ts,tsx}'],
    rules: {
      'no-restricted-imports': ['error', {
        patterns: [
          {
            group: ['@app/**', '@screens/**', '@widgets/**'],
            message: 'The "features" layer cannot import from higher layers.',
          },
          {
            group: ['../../../**'],
            message: 'Relative imports going up 3 or more levels are not allowed. Please use path aliases (@features/, @shared/, etc.) instead.',
          },
          fsdDeepImportRestrictions
        ]
      }],
    }
  },
  {
    files: ['src/widgets/**/*.{ts,tsx}'],
    rules: {
      'no-restricted-imports': ['error', {
        patterns: [
          {
            group: ['@app/**', '@screens/**'],
            message: 'The "widgets" layer cannot import from higher layers.',
          },
          {
            group: ['../../../**'],
            message: 'Relative imports going up 3 or more levels are not allowed. Please use path aliases (@features/, @shared/, etc.) instead.',
          },
          fsdDeepImportRestrictions
        ]
      }],
    }
  },
  {
    files: ['src/screens/**/*.{ts,tsx}'],
    rules: {
      'no-restricted-imports': ['error', {
        patterns: [
          {
            group: ['@app/**'],
            message: 'The "screens" layer cannot import from higher layers.',
          },
          {
            group: ['../../../**'],
            message: 'Relative imports going up 3 or more levels are not allowed. Please use path aliases (@features/, @shared/, etc.) instead.',
          },
          fsdDeepImportRestrictions
        ]
      }],
    }
  },
  // --- TEST FILES: RELAXED TYPE CHECKING FOR MOCKS ---
  {
    files: ['**/*.test.{ts,tsx}', '**/__tests__/**', '**/__mocks__/**'],
    rules: {
      '@typescript-eslint/no-unsafe-assignment': 'off',
      '@typescript-eslint/no-unsafe-member-access': 'off',
      '@typescript-eslint/no-unsafe-call': 'off',
      '@typescript-eslint/no-unsafe-return': 'off',
      '@typescript-eslint/no-explicit-any': 'off',
      '@typescript-eslint/no-unsafe-argument': 'off',
      '@typescript-eslint/no-require-imports': 'off',
      '@typescript-eslint/no-unsafe-function-type': 'off',
      '@typescript-eslint/unbound-method': 'off',
      'react/display-name': 'off',
      'i18next/no-literal-string': 'off',
    },
  },
];
