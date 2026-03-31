import { listFiles } from "@rja-api/storage/api/list-files"
import type { TResult } from "@rja-core/result"

export function listDocuments(
	roleId: number,
): TResult<Array<{ name: string }>> {
	return listFiles("applications", String(roleId))
}
