
module.exports = {
  "extends": "oclif",
  "rules": {
    "semi": ["error", "always"],
    "arrow-parens": ["error", "always"],
    "no-else-return": 0,
    "comma-dangle": ["error", "never"],
    //-- @TODO: unable to correctly exclude tests
    "node/no-unpublished-require": 0,
    "indent": ["error", 2, { "MemberExpression": 1, "SwitchCase": 0 }],
    "no-trailing-spaces": 0,
    "no-unused-expressions": 0,
    "spaced-comment": ["error", "always", { "markers": ["--"]}],
    "no-unneeded-ternary": 0
  }
};
