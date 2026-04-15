"use client"

import { Button } from "@rja-design/ui/library/button"
import {
	Card,
	CardContent,
	CardHeader,
	CardTitle,
} from "@rja-design/ui/library/card"
import { DocumentUpload } from "@rja-design/ui/library/document-upload"
import { InputLabelWrapper } from "@rja-design/ui/library/input-label-wrapper"
import { Label } from "@rja-design/ui/library/label"
import { Textarea } from "@rja-design/ui/library/text-area"
import { XStack } from "@rja-design/ui/primitives/x-stack"
import { YStack } from "@rja-design/ui/primitives/y-stack"
import { DocumentViewerDialog } from "#molecules/document-viewer-dialog"
import { useState } from "react"

interface IApplicationFieldsCardProps {
	resumeUrl: string | null
	coverLetterUrl: string | null
	screenshotUrl: string | null
	notes: string
	onNotesChange: (notes: string) => void
	onUpload: (fileType: "resume" | "cover_letter", file: File) => void
	onRemove: (fileType: "resume" | "cover_letter") => void
	uploadingType: "resume" | "cover_letter" | null
	removingType: "resume" | "cover_letter" | null
	onGenerate?: () => void
	isGenerating?: boolean
}

function FileSlot({
	label,
	fileType,
	url,
	onView,
	onUpload,
	onRemove,
	isUploading,
	isRemoving,
}: {
	label: string
	fileType: "resume" | "cover_letter"
	url: string | null
	onView: () => void
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
			<InputLabelWrapper>
				<Label>{label}</Label>
				<XStack className="items-center gap-2 rounded-md border px-3 py-2">
					<button
						type="button"
						onClick={onView}
						className="text-sm text-primary underline truncate flex-1 text-left cursor-pointer"
					>
						View {label}
					</button>
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
			</InputLabelWrapper>
		)
	}

	return (
		<InputLabelWrapper>
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
		</InputLabelWrapper>
	)
}

export function ApplicationFieldsCard({
	resumeUrl,
	coverLetterUrl,
	screenshotUrl,
	notes,
	onNotesChange,
	onUpload,
	onRemove,
	uploadingType,
	removingType,
	onGenerate,
	isGenerating,
}: IApplicationFieldsCardProps) {
	const [viewer, setViewer] = useState<{ url: string; title: string } | null>(
		null,
	)

	const openViewer = (url: string, title: string) => {
		setViewer({ url, title })
	}

	return (
		<Card>
			<CardHeader>
				<XStack className="items-center justify-between">
					<CardTitle>Application</CardTitle>
					{onGenerate && (
						<Button
							variant="outline"
							size="sm"
							onClick={onGenerate}
							disabled={isGenerating}
						>
							{isGenerating
								? "Generating..."
								: "Generate Resume & Cover Letter"}
						</Button>
					)}
				</XStack>
			</CardHeader>
			<CardContent>
				<YStack className="gap-4">
					<FileSlot
						label="Resume"
						fileType="resume"
						url={resumeUrl}
						onView={() =>
							resumeUrl && openViewer(resumeUrl, "Resume")
						}
						onUpload={(file) => onUpload("resume", file)}
						onRemove={() => onRemove("resume")}
						isUploading={uploadingType === "resume"}
						isRemoving={removingType === "resume"}
					/>

					<FileSlot
						label="Cover Letter"
						fileType="cover_letter"
						url={coverLetterUrl}
						onView={() =>
							coverLetterUrl &&
							openViewer(coverLetterUrl, "Cover Letter")
						}
						onUpload={(file) => onUpload("cover_letter", file)}
						onRemove={() => onRemove("cover_letter")}
						isUploading={uploadingType === "cover_letter"}
						isRemoving={removingType === "cover_letter"}
					/>

					{screenshotUrl && (
						<InputLabelWrapper>
							<Label>Screenshot</Label>
							<XStack className="items-center gap-2 rounded-md border px-3 py-2">
								<button
									type="button"
									onClick={() =>
										openViewer(screenshotUrl, "Screenshot")
									}
									className="text-sm text-primary underline truncate flex-1 text-left cursor-pointer"
								>
									View screenshot
								</button>
							</XStack>
						</InputLabelWrapper>
					)}

					<InputLabelWrapper>
						<Label htmlFor="app-notes">Notes</Label>
						<Textarea
							id="app-notes"
							value={notes}
							onChange={(
								e: React.ChangeEvent<HTMLTextAreaElement>,
							) => onNotesChange(e.target.value)}
							placeholder="Application notes..."
						/>
					</InputLabelWrapper>
				</YStack>
			</CardContent>
			<DocumentViewerDialog
				open={viewer !== null}
				onOpenChange={(o) => {
					if (!o) setViewer(null)
				}}
				url={viewer?.url ?? null}
				title={viewer?.title ?? ""}
			/>
		</Card>
	)
}
