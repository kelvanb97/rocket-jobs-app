import js from "@eslint/js"
import prettier from "eslint-config-prettier"
import reactPlugin from "eslint-plugin-react"
import reactHooksPlugin from "eslint-plugin-react-hooks"
import globals from "globals"
import ts from "typescript-eslint"
import { coreEslintConfig } from "./core.js"

export const eslintConfig = [
	...coreEslintConfig,
	js.configs.recommended,
	...ts.configs.recommended,
	prettier,
	reactPlugin.configs.flat.recommended,
	{
		languageOptions: {
			...reactPlugin.configs.flat.recommended.languageOptions,
			globals: {
				...globals.browser,
				...globals.serviceworker,
			},
		},
	},
	{
		plugins: {
			"react-hooks": reactHooksPlugin,
		},
		settings: {
			react: {
				version: "detect",
			},
		},
		rules: {
			...reactHooksPlugin.configs.recommended.rules,
			"react/react-in-jsx-scope": "off",
			"react/no-unescaped-entities": "off",
		},
	},
]
