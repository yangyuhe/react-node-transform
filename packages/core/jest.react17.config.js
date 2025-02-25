const config = {
  testEnvironment: "jsdom",
  moduleNameMapper: {
    "^react$": "react17",
    "^react-dom$": "react-dom17",
    "^react/(.*)$": "react17/$1",
    "^react-dom/(.*)$": "react-dom17/$1",
    "^@testing-library/react$": "@testing-library/react12",
  },
};

module.exports = config;
