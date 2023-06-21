// @ts-check

/** @type import('dts-bundle-generator/config-schema').BundlerConfig */
const config = {
  entries: [
    {
      filePath: './src/index.ts',
      outFile: './dist/index.d.ts',
    },
  ],
};

module.exports = config;
