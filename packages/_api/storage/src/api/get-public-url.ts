export function getPublicUrl(bucket: "applications", path: string): string {
	return `/api/files/${bucket}/${path}`
}
