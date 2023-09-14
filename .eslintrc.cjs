// eslint-disable-next-line @typescript-eslint/no-var-requires
const { typescript, ...restDprintOptions } = require('./dprint.json');

module.exports = {
  extends: [
    'plugin:perfectionist/recommended-natural',
    'plugin:@typescript-eslint/recommended',
  ],
  parser: '@typescript-eslint/parser',
  plugins: ['@typescript-eslint', 'dprint-integration'],
  root: true,
  rules: {
    '@typescript-eslint/ban-ts-comment': 'off',
    '@typescript-eslint/no-explicit-any': 'off',
    'dprint-integration/dprint': [
      'error',
      restDprintOptions,
      { typescript },
    ],
    'no-multiple-empty-lines': ['error', { max: 2, maxBOF: 0, maxEOF: 0 }],
  },
};
