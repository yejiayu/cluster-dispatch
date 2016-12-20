module.exports = {
  'parserOptions':false,
  'rules': {
    "import/no-extraneous-dependencies": ["error", {"devDependencies": true, "optionalDependencies": false, "peerDependencies": false}],
    'strict': [2, 'global'],
    'no-use-before-define': ["error", { "functions": false, "classes": true }],
    'no-param-reassign': [0],
  },
  'extends': 'airbnb-base',
  'env': {
    'node': true,
    'mocha': true,
  },
}
