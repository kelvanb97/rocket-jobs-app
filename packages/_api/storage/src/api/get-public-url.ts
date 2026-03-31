import { ok, type TResult } from "@rja-core/result"

export function getPublicUrl(bucket: string, path: string): TResult<string> {
	return ok(`/api/files/${bucket}/${path}`)
}
