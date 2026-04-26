type TPdfParseModule = typeof import("pdf-parse")

const loadPdfParse = async (): Promise<TPdfParseModule> => {
	const runtimeImport = new Function(
		"specifier",
		"return import(specifier)",
	) as (specifier: string) => Promise<TPdfParseModule>

	return runtimeImport("pdf-parse")
}

export async function extractTextFromPdf(buffer: Buffer): Promise<string> {
	const { PDFParse } = await loadPdfParse()
	const parser = new PDFParse({ data: buffer })
	try {
		const result = await parser.getText()
		return result.text
	} finally {
		await parser.destroy()
	}
}
