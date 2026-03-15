import { cn } from "#utils/cn"

interface NavbarContainerProps {
	className?: string
	children: React.ReactNode
}

export function NavbarContainer({ className, children }: NavbarContainerProps) {
	return (
		<div className={cn("w-full py-1.5 px-6", className)}>
			<nav className="flex justify-between">{children}</nav>
		</div>
	)
}
