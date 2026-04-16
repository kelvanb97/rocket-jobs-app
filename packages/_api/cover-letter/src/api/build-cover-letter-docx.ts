import type { TCoverLetterResponse } from "#schema/cover-letter-schema"
import { AlignmentType, Document, Packer, Paragraph, TextRun } from "docx"

type TContactInfo = {
	email?: string
	phone?: string
	links?: string[]
	location?: string
}

const FONT = "Times New Roman"
const BODY_SIZE = 22 // 11pt in half-points
const NAME_SIZE = 48 // 24pt in half-points
const CONTACT_SIZE = 26 // 13pt in half-points
const SPACING = { after: 0, line: 276, lineRule: "auto" as const }

export async function buildCoverLetterDocx(
	name: string,
	coverLetter: TCoverLetterResponse,
	contactInfo?: TContactInfo,
): Promise<Buffer> {
	const children: Paragraph[] = []

	// Name header
	children.push(
		new Paragraph({
			alignment: AlignmentType.CENTER,
			spacing: SPACING,
			children: [
				new TextRun({
					text: name,
					bold: true,
					size: NAME_SIZE,
					font: FONT,
				}),
			],
		}),
	)

	// Contact info
	if (contactInfo) {
		const parts = [
			contactInfo.phone,
			contactInfo.email,
			...(contactInfo.links ?? []),
			contactInfo.location,
		].filter(Boolean)
		if (parts.length > 0) {
			children.push(
				new Paragraph({
					alignment: AlignmentType.CENTER,
					spacing: SPACING,
					children: [
						new TextRun({
							text: parts.join("  |  "),
							size: CONTACT_SIZE,
							font: FONT,
						}),
					],
				}),
			)
		}
	}

	// Blank line after header
	children.push(new Paragraph({ spacing: SPACING }))

	// Date
	children.push(
		new Paragraph({
			spacing: SPACING,
			children: [
				new TextRun({
					text: new Date().toLocaleDateString("en-US", {
						year: "numeric",
						month: "long",
						day: "numeric",
					}),
					size: BODY_SIZE,
					font: FONT,
				}),
			],
		}),
	)

	// Blank line after date
	children.push(new Paragraph({ spacing: SPACING }))

	// Greeting
	children.push(
		new Paragraph({
			spacing: SPACING,
			children: [
				new TextRun({
					text: coverLetter.greeting,
					size: BODY_SIZE,
					font: FONT,
				}),
			],
		}),
	)

	// Blank line after greeting
	children.push(new Paragraph({ spacing: SPACING }))

	// Body paragraphs (split on double newline)
	const paragraphs = coverLetter.body.split("\n\n")
	for (const [i, para] of paragraphs.entries()) {
		children.push(
			new Paragraph({
				spacing: SPACING,
				children: [
					new TextRun({
						text: para.trim(),
						size: BODY_SIZE,
						font: FONT,
					}),
				],
			}),
		)
		if (i < paragraphs.length - 1) {
			children.push(new Paragraph({ spacing: SPACING }))
		}
	}

	// Blank line before sign-off
	children.push(new Paragraph({ spacing: SPACING }))

	// Sign-off (e.g. "Sincerely,")
	const signoffLines = coverLetter.signoff.split("\n")
	for (const line of signoffLines) {
		children.push(
			new Paragraph({
				spacing: SPACING,
				children: [
					new TextRun({
						text: line.trim(),
						size: BODY_SIZE,
						font: FONT,
					}),
				],
			}),
		)
	}

	const doc = new Document({
		sections: [
			{
				properties: {
					page: {
						size: {
							width: 12240,
							height: 15840,
						},
						margin: {
							top: 1190,
							right: 1440,
							bottom: 1190,
							left: 1440,
						},
					},
				},
				children,
			},
		],
	})

	return Buffer.from(await Packer.toBuffer(doc))
}
