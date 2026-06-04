if (process.cwd() === __dirname) {
  console.error("\n❌ ERROR: Do not run 'npx expo' directly from the project root!");
  console.error("👉 To run the app locally, use:  npm run dev:android");
  console.error("👉 For generic Expo commands, go to: cd apps/mobile\n");
  process.exit(1);
}

module.exports = {
  expo: {
    name: "Grovkornet Root Guard",
    slug: "grovkornet-root-guard"
  }
};
