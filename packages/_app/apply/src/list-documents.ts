import { listFiles } from "@aja-api/storage/api/list-files"
import type { TResult } from "@aja-core/result"

export function listDocuments(
	roleId: number,
): TResult<Array<{ name: string }>> {
	return listFiles("applications", String(roleId))
}
