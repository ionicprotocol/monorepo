const nextJest = require('next/jest');

const createJestConfig = nextJest({
  dir: './',
});

const customJestConfig = {
  moduleDirectories: ['node_modules', '<rootDir>/'],
  testEnvironment: 'jest-environment-jsdom',
  moduleNameMapper: {
    '@ui/test(.*)$': '<rootDir>/test/$1',
  },
};

module.exports = createJestConfig(customJestConfig);
