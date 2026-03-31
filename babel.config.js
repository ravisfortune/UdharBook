module.exports = function (api) {
  api.cache(true);
  return {
    presets: ['babel-preset-expo'],
    plugins: [
      [
        'module-resolver',
        {
          root: ['./'],
          alias: {
            '@': './src',
            '@components': './src/components',
            '@screens': './src/screens',
            '@store': './src/store',
            '@db': './src/db',
            '@services': './src/services',
            '@theme': './src/theme',
            '@utils': './src/utils',
            '@i18n': './src/i18n',
          },
        },
      ],
      'react-native-reanimated/plugin', // Must be last
    ],
  };
};
