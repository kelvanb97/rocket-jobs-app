"use client"

import { toast } from "@rja-design/ui/library/toast"
import type { HookActionStatus } from "next-safe-action/hooks"
import { useCallback, useEffect, useMemo } from "react"
import { DEFAULT_ERROR_MESSAGE } from "./action-client"

export { useAction } from "next-safe-action/hooks"

const errorToString = (error: unknown): string => {
	if (error instanceof Error) {
		return error.message
	} else if (typeof error === "string") {
		return error
	} else if (Array.isArray(error)) {
		return error.map((e) => errorToString(e)).join(", ")
	} else if (typeof error === "object" && error !== null) {
		return JSON.stringify(error)
	} else {
		return String(error)
	}
}

export function useActionError<
	T extends {
		serverError?: string
		validationErrors?: {
			_errors?: unknown
		}
	},
>(result: T | null): string | null {
	return useMemo(() => {
		if (!result) return null

		if (result.serverError) return result.serverError

		if (!result.validationErrors) return null

		for (const [k, v] of Object.entries(result.validationErrors)) {
			if (k === "_errors") return errorToString(v)
			else {
				// @ts-expect-error _errors is not a known property
				return errorToString(v?._errors ?? DEFAULT_ERROR_MESSAGE)
			}
		}

		return null
	}, [result])
}

export function useIsLoading(
	status: HookActionStatus[] | HookActionStatus,
): boolean {
	return useMemo(() => {
		if (Array.isArray(status)) {
			return status.some(
				(status) =>
					status === "executing" || status === "transitioning",
			)
		}
		return status === "executing" || status === "transitioning"
	}, [status])
}

export function useToastOnError(
	errorMessage: string | null,
	status: HookActionStatus,
) {
	const showErrorToast = useCallback(() => {
		if (errorMessage && status === "hasErrored") {
			toast.error(errorMessage)
		}
	}, [status, errorMessage])

	useEffect(() => {
		showErrorToast()
	}, [showErrorToast])
}
