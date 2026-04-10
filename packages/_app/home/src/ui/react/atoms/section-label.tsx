interface ISectionLabelProps {
	children: React.ReactNode
}

export function SectionLabel({ children }: ISectionLabelProps) {
	return (
		<span
			className="font-semibold text-muted-foreground uppercase"
			style={{ fontSize: "0.6875rem", letterSpacing: "0.08em" }}
		>
			{children}
		</span>
	)
}
