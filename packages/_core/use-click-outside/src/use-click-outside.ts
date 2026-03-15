import { RefObject, useEffect, useState } from "react"

interface ClickOutsideOptions {
	ignoreMounted?: boolean
	eventType?: "click" | "pointerdown"
	isEnabled?: boolean
}

const defaultClickOutsideOptions: Required<ClickOutsideOptions> = {
	ignoreMounted: true,
	eventType: "click",
	isEnabled: true,
}

/**
 * NOTE: this needs to be used sparingly as it adds a global event listener and can cause performance issues
 * if used in a way that scales with the number of components that use it.
 *
 * At a high level this hook is safe to use for conditionally rendered components like modals, dropdowns, etc.
 */
export const useClickOutside = <T extends HTMLElement>(
	refList: RefObject<T>[],
	onClickOutside: () => void,
	{
		ignoreMounted = false,
		eventType = "click",
		isEnabled = true,
	}: ClickOutsideOptions = defaultClickOutsideOptions,
) => {
	const [isMounted, setIsMounted] = useState(false)

	useEffect(() => {
		if (!isEnabled) return

		const handleClickOutside = (event: MouseEvent) => {
			// Ignore the mounting click event
			if (!isMounted && !ignoreMounted) {
				return setIsMounted(true)
			}

			// Check if the click is outside all of the refs in the list
			const clickedOutsideAll = refList.every((ref) => {
				return (
					ref.current && !ref.current.contains(event.target as Node)
				)
			})

			if (clickedOutsideAll) {
				onClickOutside()
			}
		}

		document.addEventListener(eventType, handleClickOutside)

		return () => {
			document.removeEventListener(eventType, handleClickOutside)
		}
	}, [
		eventType,
		refList,
		onClickOutside,
		isMounted,
		ignoreMounted,
		isEnabled,
	])
}
