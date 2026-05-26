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
    
    // Return formatted JSON with a trailing newline
    return JSON.stringify(json, null, 2) + '\n';
  }
};
