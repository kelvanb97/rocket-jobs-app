import type { UserConfig } from "@commitlint/types"

const Configuration: UserConfig = {
	extends: ["@commitlint/config-conventional"],
	parserPreset: "conventional-changelog-atom",
}

export default Configuration
