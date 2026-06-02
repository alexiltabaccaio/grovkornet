/**
 * Custom updater for commit-and-tag-version to bump the version in Expo's app.json.
 */
module.exports = {
  readVersion: function (contents) {
    const json = JSON.parse(contents);
    return json.expo.version;
  },
  writeVersion: function (contents, version) {
    const json = JSON.parse(contents);
    json.expo.version = version;
    
    // Automatically increment Android versionCode if it exists, otherwise initialize it to 1
    if (json.expo && json.expo.android) {
      if (typeof json.expo.android.versionCode === 'number') {
        json.expo.android.versionCode += 1;
      } else {
        json.expo.android.versionCode = 1;
      }
    }
    
    // Return formatted JSON with a trailing newline
    return JSON.stringify(json, null, 2) + '\n';
  }
};
