export function toCurrency(value: number): string {
	const formatted = new Intl.NumberFormat("en-US", {
		notation: "compact",
		compactDisplay: "short",
		maximumFractionDigits: 1,
	})
		.format(value)
		.toLocaleLowerCase()
	return `$${formatted}`
}

export function toPercent(value: number, precision = 2): string {
	return `${value.toFixed(precision)}%`
}
