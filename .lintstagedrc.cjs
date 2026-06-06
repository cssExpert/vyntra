module.exports = {
  // Lint and auto-fix staged TypeScript/JS files in the web app
  "apps/web/**/*.{ts,tsx,js,jsx}": (filenames) =>
    `pnpm --filter @vyntra/web exec eslint --fix ${filenames.join(" ")}`,
};
