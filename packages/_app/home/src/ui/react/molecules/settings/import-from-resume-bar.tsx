"use client"

import type { TExtractedResume } from "@rja-api/settings/schema/extracted-resume-schema"
import type { TUserProfileFull } from "@rja-api/settings/schema/user-profile-schema"
import {
	useAction,
	useActionError,
	useIsLoading,
	useToastOnError,
} from "@rja-core/next-safe-action/hooks"
import { Sparkles } from "@rja-design/ui/assets/lucide"
import { Button } from "@rja-design/ui/library/button"
import { XStack } from "@rja-design/ui/primitives/x-stack"
import { YStack } from "@rja-design/ui/primitives/y-stack"
import { extractResumeAction } from "#actions/settings-actions"
import { ImportResumePreviewModal } from "#molecules/settings/import-resume-preview-modal"
import { useRef, useState } from "react"

interface IImportFromResumeBarProps {
	profile: TUserProfileFull | null
	onImported: (profile: TUserProfileFull) => void
}

export function ImportFromResumeBar({
	profile,
	onImported,
}: IImportFromResumeBarProps) {
	const fileInputRef = useRef<HTMLInputElement>(null)
	const [extracted, setExtracted] = useState<TExtractedResume | null>(null)

	const { execute, result, status } = useAction(extractResumeAction, {
		onSuccess: ({ data }) => {
			if (data) setExtracted(data)
		},
	})
	const error = useActionError(result)
	useToastOnError(error, status)
	const isLoading = useIsLoading(status)

	const isDisabled = isLoading

	const helperText = !profile
		? "Upload your resume to create your profile in one step. PDF or DOCX."
		: "PDF or DOCX. We'll extract your contact info, work experience, and education for review."

	const handleClick = () => {
		fileInputRef.current?.click()
	}

	const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
		const file = e.target.files?.[0]
		if (!file) return

		const arrayBuffer = await file.arrayBuffer()
		const bytes = new Uint8Array(arrayBuffer)
		let binary = ""
		for (let i = 0; i < bytes.byteLength; i++) {
			binary += String.fromCharCode(bytes[i] ?? 0)
		}
		const base64 = btoa(binary)

		execute({ fileName: file.name, fileBase64: base64 })

		// Reset the input so picking the same file twice still triggers onChange.
		e.target.value = ""
	}

	return (
		<>
			<YStack className="border-b border-border bg-muted/30 px-6 py-3">
				<XStack className="items-center justify-between gap-4">
					<XStack className="items-center gap-3">
						<Sparkles className="size-5 text-primary" />
						<YStack className="gap-0.5">
							<span className="text-sm font-medium">
								Import from Resume
							</span>
							<span className="text-xs text-muted-foreground">
								{helperText}
							</span>
						</YStack>
					</XStack>
					<Button
						type="button"
						size="sm"
						disabled={isDisabled}
						onClick={handleClick}
					>
						{isLoading ? "Extracting..." : "Upload Resume"}
					</Button>
					<input
						ref={fileInputRef}
						type="file"
						accept=".pdf,.docx"
						className="hidden"
						onChange={handleFileChange}
					/>
				</XStack>
			</YStack>

			{extracted && (
				<ImportResumePreviewModal
					profile={profile}
					extracted={extracted}
					open={!!extracted}
					onClose={() => setExtracted(null)}
					onApplied={(freshProfile) => {
						setExtracted(null)
						onImported(freshProfile)
					}}
				/>
			)}
		</>
	)
}
