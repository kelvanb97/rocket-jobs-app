type TSuccess<T> = { ok: true; data: T }
type TError<E = Error> = { ok: false; error: E }
export type TResult<T, E = Error> = TSuccess<T> | TError<E>

export const ok = <T>(data: T): TSuccess<T> => ({ ok: true, data })

export const err = <E = Error>(error: E): TError<E> => ({ ok: false, error })

export const errFrom = (message: string): TError<Error> => ({
	ok: false,
	error: new Error(message),
})
