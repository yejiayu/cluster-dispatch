module.exports = {
  "parser": "babel-eslint",
  'parserOptions': {
    'sourceType': 'script',
  },
  "plugins": [
    "babel"
  ],
  'rules': {
    "import/no-extraneous-dependencies": ["error", {"devDependencies": true, "optionalDependencies": false, "peerDependencies": false}],
    'strict': [2, 'global'],
    'global-strict': [0, 'always'],
    'no-underscore-dangle': ["error", { "allowAfterThis": true }],
    'no-use-before-define': ["error", { "functions": false, "classes": true }],
    "generator-star-spacing": 0,
    "func-names": [0]
  },
  'extends': 'airbnb-base',
  'env': {
    'node': true,
    'mocha': true,
    "es6": true,
  },
}
