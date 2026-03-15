interface IFormErrorProps {
	content: string | null | undefined
}

export function ErrorMessage({ content }: IFormErrorProps) {
	return (
		<div className="text-error text-sm" aria-live="polite">
			{content}
		</div>
	)
}
