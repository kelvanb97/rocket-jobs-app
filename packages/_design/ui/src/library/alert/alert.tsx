import { cn } from "#utils/cn"
import { cva, type VariantProps } from "class-variance-authority"

const alertVariants = cva(
	"relative w-full rounded-lg border px-4 py-3 text-sm grid has-[>svg]:grid-cols-[calc(var(--spacing)*4)_1fr] grid-cols-[0_1fr] has-[>svg]:gap-x-3 gap-y-0.5 items-start [&>svg]:size-4 [&>svg]:translate-y-0.5 [&>svg]:text-current",
	{
		variants: {
			variant: {
				default: "bg-card text-card-foreground",
				success:
					"text-success bg-card border-success/80 [&>svg]:text-current *:data-[slot=alert-description]:text-success/90",
				error: "text-destructive bg-card [&>svg]:text-current *:data-[slot=alert-description]:text-destructive/90 border-destructive",
				info: "text-accent-foreground bg-card [&>svg]:text-current *:data-[slot=alert-description]:text-accent-foreground/90 border-input",
			},
		},
		defaultVariants: {
			variant: "default",
		},
	},
)

function AlertWrapper({
	className,
	variant,
	...props
}: React.ComponentProps<"div"> & VariantProps<typeof alertVariants>) {
	return (
		<div
			data-slot="alert"
			role="alert"
			className={cn(alertVariants({ variant }), className)}
			{...props}
		/>
	)
}

function AlertTitle({ className, ...props }: React.ComponentProps<"div">) {
	return (
		<div
			data-slot="alert-title"
			className={cn(
				"col-start-2 line-clamp-1 min-h-4 font-medium tracking-tight",
				className,
			)}
			{...props}
		/>
	)
}

function AlertDescription({
	className,
	...props
}: React.ComponentProps<"div">) {
	return (
		<div
			data-slot="alert-description"
			className={cn(
				"text-muted-foreground col-start-2 grid justify-items-start gap-1 text-sm [&_p]:leading-relaxed",
				className,
			)}
			{...props}
		/>
	)
}

type TAlertProps = React.ComponentProps<"div"> & {
	title?: React.ReactNode | string
	variant?: VariantProps<typeof alertVariants>["variant"]
	className?: string
}

export function Alert({
	title,
	variant,
	className,
	children,
	...props
}: TAlertProps) {
	return (
		<AlertWrapper className={className} variant={variant} {...props}>
			{title && (
				<AlertTitle className="text-lg font-semibold">
					{title}
				</AlertTitle>
			)}
			{children && (
				<AlertDescription className="text-sm">
					{children}
				</AlertDescription>
			)}
		</AlertWrapper>
	)
}
