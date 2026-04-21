import Link from "next/link"
import { LockupHorizontal } from "./lockup-horizontal"

interface ILogoProps extends React.SVGProps<SVGSVGElement> {
	href?: string
}

export function Logo({ href, ...props }: ILogoProps) {
	if (!href) {
		return <LogoBody {...props} />
	}

	return (
		<Link href={href}>
			<LogoBody {...props} />
		</Link>
	)
}

function LogoBody(props: React.SVGProps<SVGSVGElement>) {
	return <LockupHorizontal {...props} />
}
