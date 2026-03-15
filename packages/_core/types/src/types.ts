export type Nullable<T> = {
	[K in keyof T]: T[K] | null
}

export const isNumber = (value: unknown): value is number => {
	return typeof value === "number" && !isNaN(value)
}
