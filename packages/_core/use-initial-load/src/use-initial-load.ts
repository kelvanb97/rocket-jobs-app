import { useEffect, useRef } from "react"

// This hook is used to run a callback function only once when the component mounts.
export function useInitialLoad(callback: () => void) {
	const hasRun = useRef(false)

	useEffect(() => {
		if (!hasRun.current) {
			hasRun.current = true
			callback()
		}
		// NOTE: disable exhaustive-deps rule to ensure this effect runs only once
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [])
}
