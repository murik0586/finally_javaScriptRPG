module.exports = {
    env: {
        node: true,
        es2021: true
    },
    extends: ['eslint:recommended', 'plugin:jest/recommended'],
    parserOptions: {
        ecmaVersion: 2021,
        sourceType: 'script'
    },
    plugins: ['jest'],
    rules: {
        'global-require': 'off',
        'no-undef': 'off'
    },
    overrides: [
        {
            files: ['tests/**/*.js', '**/*.test.js', '**/*.spec.js'],
            env: {
                'jest/globals': true  // ✅ Это решает проблему
            }
        }
    ]
};