import { createSafeActionClient } from "next-safe-action"

const IS_DEBUG_MODE = process.env["NODE_ENV"] === "development"
export const DEFAULT_ERROR_MESSAGE =
	"Hmm... something went wrong. Please try again later."

export class SafeForClientError extends Error {
	constructor(message: string) {
		super(message)
		this.name = "SafeForClientError"
	}
}

export class UnknownServerError extends Error {
	constructor(callerDisplayName: string, error: string | Error) {
		super(
			`${callerDisplayName}: ${typeof error === "string" ? error : error.message}`,
		)
		this.name = "UnknownServerError"
	}
}

// DOCs: https://next-safe-action.dev/docs/define-actions/create-the-client
export const actionClient = createSafeActionClient({
	handleServerError(e, utils) {
		const { clientInput, bindArgsClientInputs, metadata, ctx } = utils

		if (IS_DEBUG_MODE) {
			console.info({
				clientInput,
				bindArgsClientInputs,
				metadata,
				ctx,
			})
			console.error("Action error:", e.message)
		}

		if (e instanceof SafeForClientError) {
			console.error("SafeForClientError:", e.message)
			return e.message
		}

		if (e instanceof UnknownServerError) {
			console.error("UnknownServerError:", e.message)
			// TODO: track with Sentry or similar
		}

		return DEFAULT_ERROR_MESSAGE
	},
})
