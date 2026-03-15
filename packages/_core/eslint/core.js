import jsPlugin from "@eslint/js"
import prettierConfig from "eslint-config-prettier"
import turbo from "eslint-plugin-turbo"
import tsPlugin from "typescript-eslint"

export const coreEslintConfig = [
	jsPlugin.configs.recommended,
	...tsPlugin.configs.recommended,
	prettierConfig,
	{
		plugins: {
			turbo,
		},
		rules: {
			"turbo/no-undeclared-env-vars": "warn",
		},
	},
]
