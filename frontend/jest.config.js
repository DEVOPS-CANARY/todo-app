/** Unit tests for the plain TypeScript parts (src/lib). UI is covered by typecheck + build. */
module.exports = {
  testEnvironment: "node",
  testMatch: ["**/src/**/*.test.ts"],
  transform: {
    "^.+[.]ts$": ["ts-jest", { tsconfig: { module: "commonjs", jsx: "react-jsx" } }]
  }
};
