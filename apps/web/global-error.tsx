"use client"

import NextError from "next/error"
import { useEffect } from "react"

interface IGlobalErrorProps {
	error: Error & { digest?: string }
}

//https://nextjs.org/docs/app/getting-started/error-handling#global-errors
export default function GlobalError({ error }: IGlobalErrorProps) {
	useEffect(() => {
		// TODO: Log the error to an error reporting service
		console.error("Global error:", error)
	}, [error])

	return (
		<html>
			<body>
				<NextError statusCode={0} />
			</body>
		</html>
	)
}
