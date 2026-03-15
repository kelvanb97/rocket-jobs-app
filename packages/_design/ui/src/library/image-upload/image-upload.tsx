"use client"

import { Avatar } from "#library/avatar/avatar"
import { Button } from "#library/button/button"
import { Input } from "#library/input/input"
import { TextBody } from "#library/text/text"
import { toast } from "#library/toast/toast"
import { XStack } from "#primitives/x-stack"
import { YStack } from "#primitives/y-stack"
import { cn } from "#utils/cn"
import compressImage, {
	type Options as CompressionOptions,
} from "browser-image-compression"
import { ImageUpIcon } from "lucide-react"
import { useCallback, useRef, useState } from "react"

interface IImageUploadProps {
	id: string
	cta: string
	selectedFile: File | null
	setSelectedFile: (file: File | null) => void
	incomingImageUrl: string | null
	setIncomingImageUrl?: (url: string | null) => void
	alt: string
	accepts: string
	required?: boolean
	maxSizeMB?: number
	maxWidthOrHeightPx?: number
	className?: string
}

export function ImageUpload({
	id,
	cta,
	selectedFile,
	setSelectedFile,
	incomingImageUrl,
	setIncomingImageUrl,
	alt,
	accepts,
	required = true,
	maxSizeMB = 0.5,
	maxWidthOrHeightPx = 512,
	className,
}: IImageUploadProps) {
	const ref = useRef<HTMLInputElement>(null)
	const [isDragging, setIsDragging] = useState(false)

	const handleFileChange = useCallback(
		async (e: React.ChangeEvent<HTMLInputElement>) => {
			const imageFile = e.target.files?.[0]
			if (!imageFile) return

			const maxSizeBytes = maxSizeMB * 1024 * 1024
			const isFileSizeTooLarge = imageFile.size > maxSizeBytes
			if (isFileSizeTooLarge) {
				try {
					const compressionOptions: CompressionOptions = {
						maxSizeMB,
						maxWidthOrHeight: maxWidthOrHeightPx,
						useWebWorker: true,
					}
					const compressedFile = await compressImage(
						imageFile,
						compressionOptions,
					)
					setSelectedFile(compressedFile)
				} catch (error) {
					console.error("Error compressing image:", error)
					toast.error(
						`File was unable to be compressed to the required size of ${maxSizeMB}MB. Please try a smaller image.`,
					)
				}
			} else {
				setSelectedFile(imageFile)
			}
		},
		[setSelectedFile, maxSizeMB, maxWidthOrHeightPx],
	)

	const handleBrowseClick = useCallback(() => {
		if (ref && "current" in ref && ref.current) {
			ref.current.click()
		}
	}, [ref])

	const handleClearClick = useCallback(
		(e: React.MouseEvent) => {
			e.preventDefault()
			e.stopPropagation()
			setSelectedFile(null)
			setIncomingImageUrl?.(null)
			if (ref && "current" in ref && ref.current) {
				ref.current.value = ""
			}
		},
		[setSelectedFile, setIncomingImageUrl],
	)

	return (
		<>
			<div
				className={cn(
					"border-2 border-dashed rounded-lg p-6 items-center cursor-pointer hover:bg-accent-foreground/10",
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
				<XStack className="gap-6 items-center justify-center">
					{selectedFile && (
						<YStack className="items-center">
							<Avatar
								size="preview-lg"
								src={URL.createObjectURL(selectedFile)}
								alt={alt}
							/>
							{!required && (
								<Button
									type="button"
									variant="link"
									onClick={handleClearClick}
								>
									clear
								</Button>
							)}
						</YStack>
					)}

					{incomingImageUrl && !selectedFile && (
						<YStack className="items-center">
							<Avatar
								size="preview-lg"
								src={incomingImageUrl}
								alt={alt}
							/>
							{!required && (
								<Button
									type="button"
									variant="link"
									onClick={handleClearClick}
								>
									clear
								</Button>
							)}
						</YStack>
					)}

					<YStack className="text-center gap-2">
						<Button
							type="button"
							variant="outline"
							className="self-center"
						>
							<ImageUpIcon className="w-4 h-4" />
							{cta}
						</Button>
						<TextBody size="sm">or drag and drop</TextBody>
						<TextBody variant="muted-foreground" size="xs">
							accepted formats: {accepts.split(",").join(", ")}
						</TextBody>
					</YStack>
				</XStack>
			</div>
			<Input
				ref={ref}
				id={id}
				type="file"
				accept={accepts}
				className="hidden"
				onChange={async (e) => await handleFileChange(e)}
			/>
		</>
	)
}
