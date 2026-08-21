import js from '@eslint/js'
import globals from 'globals'
import reactHooks from 'eslint-plugin-react-hooks'
import reactRefresh from 'eslint-plugin-react-refresh'
import { defineConfig, globalIgnores } from 'eslint/config'

export default defineConfig([
  globalIgnores(['dist']),
  {
    files: ['**/*.{js,jsx}'],
    extends: [
      js.configs.recommended,
      reactHooks.configs.flat.recommended,
      reactRefresh.configs.vite,
    ],
    languageOptions: {
      globals: globals.browser,
      parserOptions: { ecmaFeatures: { jsx: true } },
    },
    rules: {
      // Flags the standard "fetch data in useEffect" pattern (services -> hooks -> pages)
      // that this project's module hooks rely on throughout. Data-fetching effects still
      // follow the ignore-flag cleanup pattern from react.dev; this rule just can't tell.
      'react-hooks/set-state-in-effect': 'off',
    },
  },
])
