/* eslint-env node */
module.exports = {
  parser: 'vue-eslint-parser',
  root: true,
  env: {
    'commonjs': true,
    'node': true
  },

  parserOptions: {
    ecmaVersion: 'latest',
    parser: '@typescript-eslint/parser'
  },

  plugins: [
    '@typescript-eslint',
    'unused-imports',
    'sort-imports-es6-autofix',
    'cypress'
  ],
  extends: [
    'eslint:recommended',
    'plugin:vue/vue3-essential',
    'plugin:@typescript-eslint/recommended'
  ],

  rules: {
    // don't care about const or not
    'prefer-const': 'off',
    // use var anyway
    'no-var': 'off',
    // allow empty function
    '@typescript-eslint/no-empty-function': 'off',
    '@typescript-eslint/no-loss-of-precision': 'warn',
    '@typescript-eslint/no-namespace': ['error', {
      allowDeclarations: true
    }],
    // custom unused vars rules (maybe names start with underscore can be ignored?)
    'no-unused-vars': 'off',
    '@typescript-eslint/no-unused-vars': 'off',
		'unused-imports/no-unused-vars': ['warn', {
      vars: 'all',
      varsIgnorePattern: '^_',
      args: 'after-used',
      argsIgnorePattern: '^_'
    }],
    // remove unused imports
    'unused-imports/no-unused-imports': 'error',
    // auto sort imports
    'sort-imports-es6-autofix/sort-imports-es6': ['error', {
      ignoreCase: false,
      ignoreMemberSort: false,
      typeSortStrategy: 'mixed',
      memberSyntaxSortOrder: ['all', 'none', 'single', 'multiple']
    }],
  },

  globals: {
    // prevent complains of "globalThis" undefined
    'globalThis': 'readonly'
  },

  overrides: [
    {
      // https://typescript-eslint.io/linting/troubleshooting#i-get-errors-from-the-no-undef-rule-about-global-variables-not-being-defined-even-though-there-are-no-typescript-errors
      files: ['*.ts', '*.vue'],
      rules: {
        'no-undef': 'off'
      }
    },
    {
      files: ['*.js', '*.cjs'],
      rules: {
        '@typescript-eslint/no-var-requires': 'off'
      }
    },
    {
      files: [
        '**/__tests__/*.{cy,spec}.{js,ts,jsx,tsx}',
        'cypress/e2e/**.{cy,spec}.{js,ts,jsx,tsx}'
      ],
      extends: [
        'plugin:cypress/recommended'
      ]
    }
  ]
}
