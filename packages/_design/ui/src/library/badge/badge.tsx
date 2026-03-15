import { Slot } from "@radix-ui/react-slot"
import { cn } from "#utils/cn"
import { cva, type VariantProps } from "class-variance-authority"

const badgeVariants = cva(
	"inline-flex items-center justify-center rounded-[3px] border px-2 py-0.5 text-xs font-medium w-fit whitespace-nowrap shrink-0 [&>svg]:size-3 gap-1 [&>svg]:pointer-events-none focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px] aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive transition-[color,box-shadow] overflow-hidden",
	{
		variants: {
			variant: {
				default:
					"border-transparent bg-primary text-primary-foreground [a&]:hover:bg-primary/90",
				secondary:
					"border-transparent bg-secondary text-secondary-foreground [a&]:hover:bg-secondary/90",
				destructive:
					"border-transparent bg-destructive text-white [a&]:hover:bg-destructive/90 focus-visible:ring-destructive/20 dark:focus-visible:ring-destructive/40 dark:bg-destructive/60",
				outline:
					"text-foreground [a&]:hover:bg-accent [a&]:hover:text-accent-foreground",
				"outline-destructive":
					"border-destructive bg-transparent text-destructive [a&]:hover:bg-destructive/10 [a&]:hover:text-destructive-foreground focus-visible:ring-destructive/20 dark:focus-visible:ring-destructive/40",
				"outline-success":
					"border-success bg-transparent text-success [a&]:hover:bg-success/10 [a&]:hover:text-success-foreground focus-visible:ring-success/20 dark:focus-visible:ring-success/40",
			},
			size: {
				sm: "px-1.5 py-0.5 text-xs",
				md: "px-2 py-0.5 text-sm",
				lg: "px-2.5 py-1 text-md",
			},
		},
		defaultVariants: {
			variant: "default",
			size: "sm",
		},
	},
)

function Badge({
	className,
	variant,
	asChild = false,
	...props
}: React.ComponentProps<"span"> &
	VariantProps<typeof badgeVariants> & { asChild?: boolean }) {
	const Comp = asChild ? Slot : "span"

	return (
		<Comp
			data-slot="badge"
			className={cn(badgeVariants({ variant }), className)}
			{...props}
		/>
	)
}

export { Badge, badgeVariants }
