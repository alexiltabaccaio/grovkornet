import tsPlugin from '@typescript-eslint/eslint-plugin';
import tsParser from '@typescript-eslint/parser';
import importPlugin from 'eslint-plugin-import';
import unusedImports from 'eslint-plugin-unused-imports';
import reactPlugin from 'eslint-plugin-react';
import reactHooksPlugin from 'eslint-plugin-react-hooks';
import reactNativePlugin from 'eslint-plugin-react-native';

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
        patterns: [
          {
            group: ['../*'],
            message: 'Relative parent imports (../) are not allowed. Please use path aliases (@features/, @shared/, etc.) instead.',
          }
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
            group: ['../*'],
            message: 'Relative parent imports (../) are not allowed. Please use path aliases (@features/, @shared/, etc.) instead.',
          }
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
            group: ['../*'],
            message: 'Relative parent imports (../) are not allowed. Please use path aliases (@features/, @shared/, etc.) instead.',
          }
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
            group: ['../*'],
            message: 'Relative parent imports (../) are not allowed. Please use path aliases (@features/, @shared/, etc.) instead.',
          }
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
            group: ['../*'],
            message: 'Relative parent imports (../) are not allowed. Please use path aliases (@features/, @shared/, etc.) instead.',
          }
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
            group: ['../*'],
            message: 'Relative parent imports (../) are not allowed. Please use path aliases (@features/, @shared/, etc.) instead.',
          }
        ]
      }],
    }
  },
  // --- FSD RULES: CROSS-IMPORT BOUNDARIES ---
  {
    files: ['src/features/lens-controls/**/*.{ts,tsx}'],
    rules: {
      'no-restricted-imports': ['error', {
        patterns: [{
          group: ['@features/body-controls/**', '@features/film-controls/**', '@features/system-settings/**', '@features/gallery/**'],
          message: 'Cross-imports between features are not allowed.'
        }]
      }]
    }
  },
  {
    files: ['src/features/body-controls/**/*.{ts,tsx}'],
    rules: {
      'no-restricted-imports': ['error', {
        patterns: [{
          group: ['@features/lens-controls/**', '@features/film-controls/**', '@features/system-settings/**', '@features/gallery/**'],
          message: 'Cross-imports between features are not allowed.'
        }]
      }]
    }
  },
  {
    files: ['src/features/film-controls/**/*.{ts,tsx}'],
    rules: {
      'no-restricted-imports': ['error', {
        patterns: [{
          group: ['@features/lens-controls/**', '@features/body-controls/**', '@features/system-settings/**', '@features/gallery/**'],
          message: 'Cross-imports between features are not allowed.'
        }]
      }]
    }
  },
  {
    files: ['src/features/system-settings/**/*.{ts,tsx}'],
    rules: {
      'no-restricted-imports': ['error', {
        patterns: [{
          group: ['@features/lens-controls/**', '@features/body-controls/**', '@features/film-controls/**', '@features/gallery/**'],
          message: 'Cross-imports between features are not allowed.'
        }]
      }]
    }
  },
  {
    files: ['src/features/gallery/**/*.{ts,tsx}'],
    rules: {
      'no-restricted-imports': ['error', {
        patterns: [{
          group: ['@features/lens-controls/**', '@features/body-controls/**', '@features/film-controls/**', '@features/system-settings/**'],
          message: 'Cross-imports between features are not allowed.'
        }]
      }]
    }
  },
  {
    files: ['src/entities/lens/**/*.{ts,tsx}'],
    rules: {
      'no-restricted-imports': ['error', {
        patterns: [{
          group: ['@entities/body/**', '@entities/film/**', '@entities/system/**', '@entities/camera/**'],
          message: 'Cross-imports between entities are not allowed.'
        }]
      }]
    }
  },
  {
    files: ['src/entities/body/**/*.{ts,tsx}'],
    rules: {
      'no-restricted-imports': ['error', {
        patterns: [{
          group: ['@entities/lens/**', '@entities/film/**', '@entities/system/**', '@entities/camera/**'],
          message: 'Cross-imports between entities are not allowed.'
        }]
      }]
    }
  },
  {
    files: ['src/entities/film/**/*.{ts,tsx}'],
    rules: {
      'no-restricted-imports': ['error', {
        patterns: [{
          group: ['@entities/lens/**', '@entities/body/**', '@entities/system/**', '@entities/camera/**'],
          message: 'Cross-imports between entities are not allowed.'
        }]
      }]
    }
  },
  {
    files: ['src/entities/system/**/*.{ts,tsx}'],
    rules: {
      'no-restricted-imports': ['error', {
        patterns: [{
          group: ['@entities/lens/**', '@entities/body/**', '@entities/film/**', '@entities/camera/**'],
          message: 'Cross-imports between entities are not allowed.'
        }]
      }]
    }
  },
  {
    files: ['src/entities/camera/**/*.{ts,tsx}'],
    rules: {
      'no-restricted-imports': ['error', {
        patterns: [{
          group: ['@entities/lens/**', '@entities/body/**', '@entities/film/**', '@entities/system/**'],
          message: 'Cross-imports between entities are not allowed.'
        }]
      }]
    }
  },
  // --- TEST FILES: RELAXED TYPE CHECKING FOR MOCKS ---
  {
    files: ['**/*.test.{ts,tsx}', '**/__tests__/**', '**/__mocks__/**'],
    rules: {
      '@typescript-eslint/no-unsafe-assignment': 'warn',
      '@typescript-eslint/no-unsafe-member-access': 'warn',
      '@typescript-eslint/no-unsafe-call': 'warn',
      '@typescript-eslint/no-unsafe-return': 'warn',
      '@typescript-eslint/no-explicit-any': 'warn',
      '@typescript-eslint/no-unsafe-argument': 'warn',
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
    },
  },
];
