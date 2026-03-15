import { inter } from "#library/text/text"
import { cn } from "#utils/cn"

interface IInputProps extends React.ComponentProps<"input"> {
	leftAddon?: React.ReactNode
	rightAddon?: React.ReactNode
}

export function Input({
	className,
	type,
	leftAddon,
	rightAddon,
	...props
}: IInputProps) {
	const disableNativeNumberInputSpinnerClassName =
		"[appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"

	const baseInputClassName = cn(
		"file:text-foreground placeholder:text-muted-foreground selection:bg-primary selection:text-primary-foreground bg-background dark:bg-input/30 border-input flex h-9 w-full min-w-0 rounded-md border px-3 py-1 text-base shadow-xs transition-[color,box-shadow] outline-none file:inline-flex file:h-7 file:border-0 file:bg-transparent file:text-sm file:font-medium disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50 md:text-sm",
		"focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px]",
		"aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive",
		disableNativeNumberInputSpinnerClassName,
	)

	if (!leftAddon && !rightAddon) {
		return (
			<input
				type={type}
				data-slot="input"
				className={cn(baseInputClassName, inter.className, className)}
				{...props}
			/>
		)
	}

	return (
		<div className="relative w-full">
			{leftAddon && (
				<div className="absolute left-2 top-1/2 -translate-y-1/2 pointer-events-none flex items-center bg-muted-foreground/30 rounded-md">
					{leftAddon}
				</div>
			)}
			<input
				type={type}
				data-slot="input"
				className={cn(
					baseInputClassName,
					inter.className,
					leftAddon && "pl-10",
					rightAddon && "pr-10",
					className,
				)}
				{...props}
			/>
			{rightAddon && (
				<div className="absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none flex items-center bg-muted-foreground/30 rounded-md">
					{rightAddon}
				</div>
			)}
		</div>
	)
}
