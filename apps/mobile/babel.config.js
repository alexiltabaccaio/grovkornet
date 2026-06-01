module.exports = function(api) {
  api.cache(true);
  const isProduction = process.env.NODE_ENV === 'production' || process.env.BABEL_ENV === 'production';
  return {
    presets: [['babel-preset-expo', { jsxRuntime: 'classic' }]],
    plugins: [
      'react-native-reanimated/plugin',
      ...(isProduction ? ['transform-remove-console'] : []),
    ],
  };
};
