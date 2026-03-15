type TLocalStorageKey = "theme"

export function getLocalStorageItem(key: TLocalStorageKey): string | null {
	try {
		return localStorage.getItem(key)
	} catch {
		return null
	}
}

export function setLocalStorageItem(
	key: TLocalStorageKey,
	value: string,
): void {
	try {
		localStorage.setItem(key, value)
	} catch {
		// no op
	}
}
