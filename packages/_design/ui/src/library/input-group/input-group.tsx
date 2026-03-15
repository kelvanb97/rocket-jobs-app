import { cn } from "#utils/cn"

interface IInputGroupProps {
	className?: string
	children: React.ReactNode
}

export function InputGroup({ children, className }: IInputGroupProps) {
	return <div className={cn("grid gap-1", className)}>{children}</div>
}
