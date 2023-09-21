module.exports = {
  moduleFileExtensions: [
    'ts',
    'tsx',
    'js',
    'mjs',
    'jsx',
  ],
  transform: {
    '^.+\\.(t|j)sx?$': '@swc/jest',
  },
  extensionsToTreatAsEsm: ['.ts'],
};
