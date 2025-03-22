
import configs from '@wsh-2025/configs/eslint.config.mjs';

export default [
  ...configs,
  {
    ignores: ['dist/*', '.wireit/*'],
    rules: {
      "import/order": "off",
      "@typescript-eslint/no-explicit-any": "off",
      "@typescript-eslint/no-unsafe-assignment": "off",
      "@typescript-eslint/no-unsafe-return": "off",
      "@typescript-eslint/no-unsafe-argument": "off",
      "@typescript-eslint/no-unsafe-member-access": "off",
      "@typescript-eslint/no-unnecessary-condition": "off",
      "@typescript-eslint/ban-ts-comment": "off",
      "import/no-unresolved": "warn",
      "sort/object-properties": "off"
    }
  },
];
