// ESLint flat config (ESLint 9) baseado no preset oficial do Expo.
// `eslint-config-prettier` desliga regras de formatação que conflitam com
// o Prettier, que é a fonte de verdade para estilo (ver .prettierrc.json).
const expoConfig = require('eslint-config-expo/flat');
const prettierConfig = require('eslint-config-prettier');

module.exports = [
  ...expoConfig,
  prettierConfig,
  {
    ignores: ['dist/*', 'node_modules/*', 'specs/*', '.expo/*'],
  },
  {
    rules: {
      'no-console': ['warn', { allow: ['warn', 'error'] }],
    },
  },
];
