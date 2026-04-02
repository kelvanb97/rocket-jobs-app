"use client"

import { Button } from "@rja-design/ui/library/button"
import {
	Card,
	CardContent,
	CardHeader,
	CardTitle,
} from "@rja-design/ui/library/card"
import { CopyPrompt } from "@rja-design/ui/library/copy-prompt"
import { DocumentUpload } from "@rja-design/ui/library/document-upload"
import { InputGroup } from "@rja-design/ui/library/input-group"
import { Label } from "@rja-design/ui/library/label"
import { Textarea } from "@rja-design/ui/library/text-area"
import { XStack } from "@rja-design/ui/primitives/x-stack"
import { YStack } from "@rja-design/ui/primitives/y-stack"
import { useState } from "react"

interface IApplicationFieldsCardProps {
	roleId: number
	resumeUrl: string | null
	coverLetterUrl: string | null
	screenshotUrl: string | null
	notes: string
	onNotesChange: (notes: string) => void
	onUpload: (fileType: "resume" | "cover_letter", file: File) => void
	onRemove: (fileType: "resume" | "cover_letter") => void
	uploadingType: "resume" | "cover_letter" | null
	removingType: "resume" | "cover_letter" | null
}

function FileSlot({
	label,
	fileType,
	url,
	onUpload,
	onRemove,
	isUploading,
	isRemoving,
}: {
	label: string
	fileType: "resume" | "cover_letter"
	url: string | null
	onUpload: (file: File) => void
	onRemove: () => void
	isUploading: boolean
	isRemoving: boolean
}) {
	const [selectedFile, setSelectedFile] = useState<File | null>(null)

	const handleFileSelect = (file: File | null) => {
		setSelectedFile(file)
		if (file) {
			onUpload(file)
		}
	}

	if (url && !selectedFile) {
		return (
			<InputGroup>
				<Label>{label}</Label>
				<XStack className="items-center gap-2 rounded-md border px-3 py-2">
					<a
						href={url}
						target="_blank"
						rel="noopener noreferrer"
						className="text-sm text-primary underline truncate flex-1"
					>
						{label} uploaded
					</a>
					<Button
						variant="ghost"
						size="sm"
						className="text-destructive shrink-0"
						onClick={onRemove}
						disabled={isRemoving}
					>
						{isRemoving ? "Removing..." : "Remove"}
					</Button>
				</XStack>
			</InputGroup>
		)
	}

	return (
		<InputGroup>
			<Label>{label}</Label>
			{isUploading ? (
				<div className="border-2 border-dashed rounded-lg p-6 text-center text-sm text-muted-foreground">
					Uploading...
				</div>
			) : (
				<DocumentUpload
					id={`app-${fileType}`}
					cta={`Upload ${label}`}
					selectedFile={selectedFile}
					setSelectedFile={handleFileSelect}
					incomingDocumentUrl={null}
					accepts=".pdf,.doc,.docx"
				/>
			)}
		</InputGroup>
	)
}

export function ApplicationFieldsCard({
	roleId,
	resumeUrl,
	coverLetterUrl,
	screenshotUrl,
	notes,
	onNotesChange,
	onUpload,
	onRemove,
	uploadingType,
	removingType,
}: IApplicationFieldsCardProps) {
	return (
		<Card>
			<CardHeader>
				<XStack className="items-center justify-between">
					<CardTitle>Application</CardTitle>
					<CopyPrompt value={`/generate-docs ${roleId}`} />
				</XStack>
			</CardHeader>
			<CardContent>
				<YStack className="gap-4">
					<FileSlot
						label="Resume"
						fileType="resume"
						url={resumeUrl}
						onUpload={(file) => onUpload("resume", file)}
						onRemove={() => onRemove("resume")}
						isUploading={uploadingType === "resume"}
						isRemoving={removingType === "resume"}
					/>

					<FileSlot
						label="Cover Letter"
						fileType="cover_letter"
						url={coverLetterUrl}
						onUpload={(file) => onUpload("cover_letter", file)}
						onRemove={() => onRemove("cover_letter")}
						isUploading={uploadingType === "cover_letter"}
						isRemoving={removingType === "cover_letter"}
					/>

					{screenshotUrl && (
						<InputGroup>
							<Label>Screenshot</Label>
							<XStack className="items-center gap-2 rounded-md border px-3 py-2">
								<a
									href={screenshotUrl}
									target="_blank"
									rel="noopener noreferrer"
									className="text-sm text-primary underline truncate flex-1"
								>
									View screenshot
								</a>
							</XStack>
						</InputGroup>
					)}

					<InputGroup>
						<Label htmlFor="app-notes">Notes</Label>
						<Textarea
							id="app-notes"
							value={notes}
							onChange={(
								e: React.ChangeEvent<HTMLTextAreaElement>,
							) => onNotesChange(e.target.value)}
							placeholder="Application notes..."
						/>
					</InputGroup>
				</YStack>
			</CardContent>
		</Card>
	)
}
