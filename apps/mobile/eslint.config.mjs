import tsPlugin from '@typescript-eslint/eslint-plugin';
import tsParser from '@typescript-eslint/parser';
import importPlugin from 'eslint-plugin-import';
import unusedImports from 'eslint-plugin-unused-imports';
import reactPlugin from 'eslint-plugin-react';
import reactHooksPlugin from 'eslint-plugin-react-hooks';
import reactNativePlugin from 'eslint-plugin-react-native';
import i18nextPlugin from 'eslint-plugin-i18next';
import conartiFsdPlugin from '@conarti/eslint-plugin-feature-sliced';
import zustandPlugin from 'eslint-plugin-zustand';

const fsdDeepImportRestrictions = {
  group: [
    '@entities/*/**',
    '@features/camera/**',
    '@features/gallery/**',
    '@features/presets/**',
    '@features/sections/*/**',
    '@widgets/*/**',
    '@screens/*/**',
  ],
  message: 'Import from the slice public API (e.g. "@entities/lens") instead of deep paths, or use relative paths for internal files.',
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
    ignores: ['dist/**', 'node_modules/**', 'coverage/**', '.expo/**', 'android/**', 'ios/**'],
  },
  {
    files: ['**/*.{ts,tsx}'],
    plugins: {
      '@typescript-eslint': tsPlugin,
      'import': importPlugin,
      'unused-imports': unusedImports,
      'react': reactPlugin,
      'react-hooks': reactHooksPlugin,
      'react-native': reactNativePlugin,
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
      'react/react-in-jsx-scope': 'off', // Not needed in modern React
      'react/prop-types': 'off', // We use TypeScript
      'react-native/no-unused-styles': 'warn',
      'react-native/no-single-element-style-arrays': 'warn',
      'no-restricted-imports': ['error', {
        paths: [
          {
            name: 'react-native-vision-camera',
            message: 'Do not reintroduce react-native-vision-camera. Use custom native NativeFilmCamera.'
          },
          {
            name: '@shopify/react-native-skia',
            message: 'Do not reintroduce react-native-skia. Use native multi-pass rendering pipeline.'
          }
        ],
        patterns: [
          {
            group: ['../../../**'],
            message: 'Relative imports going up 3 or more levels are not allowed. Please use path aliases (@features/, @shared/, etc.) instead.',
          },
          fsdDeepImportRestrictions
        ]
      }],
      'i18next/no-literal-string': ['warn', {
        markupOnly: true,
        ignoreCallees: ['t', 'i18n.t', 'require'],
        ignoreAttribute: ['style', 'className', 'testID', 'accessibilityLabel', 'id'],
      }],
      '@conarti/feature-sliced/layers-slices': ['error', {
        ignoreInFilesPatterns: ['**/*.test.{ts,tsx}', '**/__tests__/**', '**/__mocks__/**', '**/jest.setup.ts']
      }],
      '@conarti/feature-sliced/absolute-relative': ['error', {
        ignoreInFilesPatterns: ['**/*.test.{ts,tsx}', '**/__tests__/**', '**/__mocks__/**', '**/jest.setup.ts']
      }],
      '@conarti/feature-sliced/public-api': ['error', {
        ignoreInFilesPatterns: ['**/*.test.{ts,tsx}', '**/__tests__/**', '**/__mocks__/**', '**/jest.setup.ts', '**/app/index.tsx']
      }],
      'zustand/no-destructure': ['warn', {
        hooks: [
          'useBodyStore',
          'useLensStore',
          'useFilmStore',
          'useCameraStore',
          'useGalleryStore',
          'useVerificationStore',
          'usePreferencesStore',
          'usePresetsStore'
        ]
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
  // --- FSD RULES: CROSS-IMPORT BOUNDARIES ---
  {
    files: ['src/features/sections/lens/**/*.{ts,tsx}'],
    rules: {
      'no-restricted-imports': ['error', {
        patterns: [
          fsdLayerRestrictions.features,

          {
            group: ['@features/sections/body/**', '@features/sections/film/**', '@features/sections/system/**', '@features/gallery/**'],
            message: 'Cross-imports between features are not allowed.'
          },
          fsdDeepImportRestrictions
        ]
      }]
    }
  },
  {
    files: ['src/features/sections/body/**/*.{ts,tsx}'],
    rules: {
      'no-restricted-imports': ['error', {
        patterns: [
          fsdLayerRestrictions.features,

          {
            group: ['@features/sections/lens/**', '@features/sections/film/**', '@features/sections/system/**', '@features/gallery/**'],
            message: 'Cross-imports between features are not allowed.'
          },
          fsdDeepImportRestrictions
        ]
      }]
    }
  },
  {
    files: ['src/features/sections/film/**/*.{ts,tsx}'],
    rules: {
      'no-restricted-imports': ['error', {
        patterns: [
          fsdLayerRestrictions.features,

          {
            group: ['@features/sections/lens/**', '@features/sections/body/**', '@features/sections/system/**', '@features/gallery/**'],
            message: 'Cross-imports between features are not allowed.'
          },
          fsdDeepImportRestrictions
        ]
      }]
    }
  },
  {
    files: ['src/features/sections/system/**/*.{ts,tsx}'],
    rules: {
      'no-restricted-imports': ['error', {
        patterns: [
          fsdLayerRestrictions.features,

          {
            group: ['@features/sections/lens/**', '@features/sections/body/**', '@features/sections/film/**', '@features/gallery/**'],
            message: 'Cross-imports between features are not allowed.'
          },
          fsdDeepImportRestrictions
        ]
      }]
    }
  },
  {
    files: ['src/features/gallery/**/*.{ts,tsx}'],
    rules: {
      'no-restricted-imports': ['error', {
        patterns: [
          fsdLayerRestrictions.features,

          {
            group: ['@features/sections/lens/**', '@features/sections/body/**', '@features/sections/film/**', '@features/sections/system/**'],
            message: 'Cross-imports between features are not allowed.'
          },
          fsdDeepImportRestrictions
        ]
      }]
    }
  },
  {
    files: ['src/entities/lens/**/*.{ts,tsx}'],
    rules: {
      'no-restricted-imports': ['error', {
        patterns: [
          fsdLayerRestrictions.entities,

          {
            group: ['@entities/body/**', '@entities/film/**', '@entities/system/**', '@entities/camera/**'],
            message: 'Cross-imports between entities are not allowed.'
          },
          fsdDeepImportRestrictions
        ]
      }]
    }
  },
  {
    files: ['src/entities/body/**/*.{ts,tsx}'],
    rules: {
      'no-restricted-imports': ['error', {
        patterns: [
          fsdLayerRestrictions.entities,

          {
            group: ['@entities/lens/**', '@entities/film/**', '@entities/system/**', '@entities/camera/**'],
            message: 'Cross-imports between entities are not allowed.'
          },
          fsdDeepImportRestrictions
        ]
      }]
    }
  },
  {
    files: ['src/entities/film/**/*.{ts,tsx}'],
    rules: {
      'no-restricted-imports': ['error', {
        patterns: [
          fsdLayerRestrictions.entities,

          {
            group: ['@entities/lens/**', '@entities/body/**', '@entities/system/**', '@entities/camera/**'],
            message: 'Cross-imports between entities are not allowed.'
          },
          fsdDeepImportRestrictions
        ]
      }]
    }
  },
  {
    files: ['src/entities/system/**/*.{ts,tsx}'],
    rules: {
      'no-restricted-imports': ['error', {
        patterns: [
          fsdLayerRestrictions.entities,

          {
            group: ['@entities/lens/**', '@entities/body/**', '@entities/film/**', '@entities/camera/**'],
            message: 'Cross-imports between entities are not allowed.'
          },
          fsdDeepImportRestrictions
        ]
      }]
    }
  },
  {
    files: ['src/entities/camera/**/*.{ts,tsx}'],
    rules: {
      'no-restricted-imports': ['error', {
        patterns: [
          fsdLayerRestrictions.entities,

          {
            group: ['@entities/lens/**', '@entities/body/**', '@entities/film/**', '@entities/system/**'],
            message: 'Cross-imports between entities are not allowed.'
          },
          fsdDeepImportRestrictions
        ]
      }]
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
  {
    files: ['jest.setup.ts'],
    rules: {
      '@typescript-eslint/no-unsafe-assignment': 'off',
      '@typescript-eslint/no-unsafe-member-access': 'off',
      '@typescript-eslint/no-unsafe-call': 'off',
      '@typescript-eslint/no-unsafe-return': 'off',
      '@typescript-eslint/no-explicit-any': 'off',
      '@typescript-eslint/no-unsafe-argument': 'off',
      'unused-imports/no-unused-vars': 'off',
      '@typescript-eslint/no-require-imports': 'off',
      'i18next/no-literal-string': 'off',
    },
  },
];
