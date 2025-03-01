const config = {
  testEnvironment: "jsdom",
  moduleNameMapper: {
    "^react$": "react18",
    "^react-dom$": "react-dom18",
    "^react/(.*)$": "react18/$1",
    "^react-dom/(.*)$": "react-dom18/$1",
    "^@testing-library/react$": "@testing-library/react16",
  },
};

module.exports = config;
