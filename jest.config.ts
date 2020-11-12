import type { Config } from '@jest/types';

const config: Config.InitialOptions = {
    displayName: 'Testsuite for SwagAppSystemPackage',

    preset: 'ts-jest',

    clearMocks: true,
    restoreMocks: true,

    collectCoverage: true,
    coverageDirectory: '<rootDir>/artifacts',
    collectCoverageFrom: [
        '<rootDir>/src/**/*.ts'
    ],
    coverageReporters: ['lcov', 'clover', 'cobertura'],

    reporters: [
        'default',
        ['jest-junit', {
            suiteName: 'SwagAppSystemPackage Unit Tests',
            outputDirectory: '<rootDir>/artifacts/',
            outputName: 'swag-app-system-package.junit.xml'
        }]
    ],

    watchPathIgnorePatterns: ['node_modules'],

    moduleNameMapper: {
        '^@swag-app-system-package/(.*)': '<rootDir>/src/$1',
    },

    testMatch: [
        '<rootDir>/tests/__test__/**/*.test.ts',
    ],
};

export default config;
