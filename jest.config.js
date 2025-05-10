export default {
    preset: 'ts-jest',
    testEnvironment: 'jsdom',
    moduleNameMapper: {
        '^@/(.*)$': '<rootDir>/src/$1',
        '\\.(css|less|scss|sass)$': 'identity-obj-proxy',
        '\\.(jpg|jpeg|png|gif|eot|otf|webp|svg|ttf|woff|woff2|mp4|webm|wav|mp3|m4a|aac|oga)$':
            '<rootDir>/src/__mocks__/fileMock.js',
        'roundware-web-framework': '<rootDir>/node_modules/roundware-web-framework/dist/index.js'
    },
    setupFilesAfterEnv: ['<rootDir>/src/setupTests.ts'],
    transform: {
        '^.+\\.(ts|tsx)$': ['ts-jest', {
            useESM: true,
            tsconfig: 'tsconfig.json'
        }],
        '^.+\\.js$': ['babel-jest', {
            presets: [['@babel/preset-env', { targets: { node: 'current' } }]]
        }]
    },
    testMatch: ['**/__smoke__testing__/**/*.test.(ts|tsx)'],
    moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx', 'json', 'node'],
    extensionsToTreatAsEsm: ['.ts', '.tsx'],
    transformIgnorePatterns: ['node_modules/(?!(.*\\.mjs$|@testing-library|@emotion|roundware-web-framework))'],
    globals: {
        'ts-jest': {
            useESM: true,
            tsconfig: 'tsconfig.json'
        },
    },
}; 