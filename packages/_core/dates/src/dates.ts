// returns a date formatted as "Month DayOrdinal, Year", e.g., "January 1st, 2023"
export function formatDateWithOrdinal(dateString: string): string {
	const date = new Date(dateString)
	const day = date.getDate()
	const month = date.toLocaleString("en-US", { month: "long" })
	const year = date.getFullYear()

	const ordinal =
		day % 10 === 1 && day !== 11
			? "st"
			: day % 10 === 2 && day !== 12
				? "nd"
				: day % 10 === 3 && day !== 13
					? "rd"
					: "th"

	return `${month} ${day}${ordinal}, ${year}`
}

export function timeAgo(isoString: string): string {
	const now = new Date()
	const then = new Date(isoString)
	const diffSeconds = Math.floor((now.getTime() - then.getTime()) / 1000)

	if (diffSeconds < 60) {
		return `${diffSeconds}s ago`
	}

	const diffMinutes = Math.floor(diffSeconds / 60)
	if (diffMinutes < 60) {
		return `${diffMinutes}min ago`
	}

	const diffHours = Math.floor(diffMinutes / 60)
	if (diffHours < 24) {
		return `${diffHours}h ago`
	}

	const diffDays = Math.floor(diffHours / 24)
	if (diffDays < 7) {
		return `${diffDays}d ago`
	}

	const diffWeeks = Math.floor(diffDays / 7)
	if (diffWeeks < 4) {
		return `${diffWeeks}w ago`
	}

	const diffMonths = Math.floor(diffDays / 30)
	if (diffMonths < 12) {
		return `${diffMonths}mo ago`
	}

	const diffYears = Math.floor(diffDays / 365)
	return `${diffYears}y ago`
}

export function formatInterval(interval: string | null | undefined): string {
	if (!interval) return "N/A"
	interval = interval.trim()

	// Case 1: "[D day(s) ]HH:MM:SS[.fraction]"
	const match = interval.match(
		/^(?:(\d+)\s+day(?:s)?\s+)?(\d{1,2}):([0-5]\d):([0-5]\d)(?:\.\d+)?$/,
	)

	if (!match) return interval // fallback to raw string if format unexpected

	const [, daysStr, hoursStr, minsStr, secsStr] = match
	const days = parseInt(daysStr || "0", 10)
	const hours = parseInt(hoursStr || "0", 10)
	const minutes = parseInt(minsStr || "0", 10)
	const seconds = parseInt(secsStr || "0", 10)

	if (days > 0) {
		if (days < 7) return `${days}d`
		const weeks = Math.floor(days / 7)
		if (weeks < 4) return `${weeks}w`
		const months = Math.floor(days / 30)
		if (months < 12) return `${months}mo`
		const years = Math.floor(days / 365)
		return `${years}y`
	}

	if (hours > 0) return `${hours}h`
	if (minutes > 0) return `${minutes}min`
	return `${seconds}s`
}
