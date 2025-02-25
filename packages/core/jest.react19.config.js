const config = {
  testEnvironment: "jsdom",
  moduleNameMapper: {
    "^react$": "react19",
    "^react-dom$": "react-dom19",
    "^react/(.*)$": "react19/$1",
    "^react-dom/(.*)$": "react-dom19/$1",
    "^@testing-library/react$": "@testing-library/react16",
  },
};

module.exports = config;
