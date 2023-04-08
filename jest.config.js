/** @type {import('ts-jest/dist/types').InitialOptionsTsJest} */
module.exports = {
    preset: 'ts-jest',
    testEnvironment: 'node',
    transform: {
        '^.+\\.tsx?$': ['@swc/jest'],
    },
    setupFilesAfterEnv: ['<rootDir>/tests/jest.setup.ts'],
    modulePathIgnorePatterns: [
        '<rootDir>/.next/'
    ],
    moduleNameMapper: {
        "\\.(css|less|scss|sass)$": "identity-obj-proxy"
    },
    testTimeout: 60000
};
