const nextJest = require('next/jest')

const createJestConfig = nextJest({
  dir: './',
})

const customJestConfig = {
  testEnvironment: 'jest-environment-jsdom',
  setupFilesAfterEnv: ['<rootDir>/jest.setup.js'],
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/$1',
  },
  testMatch: ['**/?(*.)+(spec|test).tsx'],
  collectCoverageFrom: [
    'components/**/*.tsx',
    'lib/**/*.ts',
    '!**/*.d.ts',
  ],
}

module.exports = createJestConfig(customJestConfig)


