module.exports = ({ config }) => {
  const isRelease =
    process.env.APP_ENV === 'production' ||
    process.argv.some(arg => arg.toLowerCase().includes('release') || arg.toLowerCase().includes('production')) ||
    process.env.EAS_BUILD_PROFILE === 'production' ||
    process.env.EAS_BUILD_PROFILE === 'internal' ||
    process.env.EAS_BUILD_PROFILE === 'alpha' ||
    process.env.EAS_BUILD_PROFILE === 'beta';


  if (!isRelease) {
    // Append the .dev suffix for local debug builds to match gradle's applicationIdSuffix
    if (config.android) {
      config.android.package = 'com.grovkornet.app.dev';
    }
    config.scheme = 'grovkornet-dev';
  } else {
    config.scheme = 'grovkornet';
  }

  return config;
};
