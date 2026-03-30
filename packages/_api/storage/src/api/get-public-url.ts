import { ok, type TResult } from "@aja-core/result"

export function getPublicUrl(bucket: string, path: string): TResult<string> {
	return ok(`/api/files/${bucket}/${path}`)
}
