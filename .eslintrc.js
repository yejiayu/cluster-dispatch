module.exports = {
  'parserOptions':false,
  'rules': {
    'strict': [2, 'global'],
    'no-use-before-define': ["error", { "functions": false, "classes": true }],
    'no-param-reassign': [0]
  },
  'extends': 'airbnb-base',
  'env': {
    'node': true,
    'mocha': true,
  },
}