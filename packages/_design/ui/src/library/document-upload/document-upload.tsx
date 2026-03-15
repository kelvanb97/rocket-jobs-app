import { Button } from "#library/button/button"
import { Input } from "#library/input/input"
import { TextBody } from "#library/text/text"
import { YStack } from "#primitives/y-stack"
import { cn } from "#utils/cn"
import { FileUpIcon } from "lucide-react"
import { useCallback, useRef, useState } from "react"

interface IUploadDocumentProps {
	id: string
	cta: string
	selectedFile: File | null
	setSelectedFile: (file: File | null) => void
	incomingDocumentUrl: string | null
	accepts: string
	className?: string
}

export function DocumentUpload({
	id,
	cta,
	selectedFile,
	setSelectedFile,
	incomingDocumentUrl,
	accepts,
	className,
}: IUploadDocumentProps) {
	const ref = useRef<HTMLInputElement>(null)
	const [isDragging, setIsDragging] = useState(false)

	const handleFileChange = useCallback(
		(e: React.ChangeEvent<HTMLInputElement>) => {
			if (e.target.files?.[0]) {
				setSelectedFile(e.target.files[0])
			}
		},
		[setSelectedFile],
	)

	const handleBrowseClick = useCallback(() => {
		if (ref && "current" in ref && ref.current) {
			ref.current.click()
		}
	}, [ref])

	return (
		<>
			<YStack
				className={cn(
					"border-2 border-dashed rounded-lg p-6 items-center cursor-pointer hover:bg-accent-foreground/10 gap-6",
					isDragging && "bg-accent-foreground/10",
					className,
				)}
				onClick={handleBrowseClick}
				onDragOver={(e) => {
					e.preventDefault()
					if (!isDragging) setIsDragging(true)
				}}
				onDragEnter={(e) => {
					e.preventDefault()
					if (!isDragging) setIsDragging(true)
				}}
				onDragLeave={(e) => {
					e.preventDefault()
					setIsDragging(false)
				}}
				onDrop={(e) => {
					e.preventDefault()
					setIsDragging(false)
					const file = e.dataTransfer?.files?.[0]
					if (file) {
						setSelectedFile(file)
					}
				}}
			>
				<YStack className="text-center gap-2">
					<Button type="button" variant="outline">
						<FileUpIcon className="w-12 h-12" />
						{cta}
					</Button>
					<TextBody size="sm">or drag and drop</TextBody>
					<TextBody variant="muted-foreground" size="xs">
						accepted formats: {accepts.split(",").join(", ")}
					</TextBody>
				</YStack>

				{selectedFile && (
					<TextBody
						variant="accent-foreground"
						size="sm"
						className="text-center"
					>
						✅ Selected: {selectedFile.name}
					</TextBody>
				)}

				{incomingDocumentUrl && !selectedFile && (
					<a
						href={incomingDocumentUrl}
						target="_blank"
						rel="noopener noreferrer"
					>
						<TextBody
							variant="accent-foreground"
							size="sm"
							className="text-center"
						>
							✅{" "}
							<span className="underline">uploaded resume</span>
						</TextBody>
					</a>
				)}
			</YStack>
			<Input
				ref={ref}
				id={id}
				type="file"
				accept=".pdf,.doc,.docx"
				className="hidden"
				onChange={handleFileChange}
			/>
		</>
	)
}
