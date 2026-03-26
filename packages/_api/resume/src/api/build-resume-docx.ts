import type { TResumeResponse } from "#schema/resume-schema"
import {
	AlignmentType,
	Document,
	HeadingLevel,
	Packer,
	Paragraph,
	TabStopPosition,
	TabStopType,
	TextRun,
} from "docx"

type TContactInfo = {
	email?: string
	phone?: string
	linkedIn?: string
	github?: string
	personalWebsite?: string
	location?: string
}

export async function buildResumeDocx(
	name: string,
	resume: TResumeResponse,
	contactInfo?: TContactInfo,
): Promise<Buffer> {
	const children: Paragraph[] = []

	// Name header
	children.push(
		new Paragraph({
			alignment: AlignmentType.CENTER,
			spacing: { after: 100 },
			children: [
				new TextRun({
					text: name,
					bold: true,
					size: 32,
					font: "Calibri",
				}),
			],
		}),
	)

	// Contact info
	if (contactInfo) {
		const parts = [
			contactInfo.email,
			contactInfo.phone,
			contactInfo.linkedIn,
			contactInfo.github,
			contactInfo.personalWebsite,
			contactInfo.location,
		].filter(Boolean)
		if (parts.length > 0) {
			children.push(
				new Paragraph({
					alignment: AlignmentType.CENTER,
					spacing: { after: 100 },
					children: [
						new TextRun({
							text: parts.join("  |  "),
							size: 20,
							font: "Calibri",
							color: "555555",
						}),
					],
				}),
			)
		}
	}

	// Summary section
	children.push(sectionHeading("Professional Summary"))
	children.push(
		new Paragraph({
			spacing: { after: 200 },
			children: [
				new TextRun({
					text: resume.summary,
					size: 22,
					font: "Calibri",
				}),
			],
		}),
	)

	// Skills section
	children.push(sectionHeading("Skills"))
	for (const group of resume.skills) {
		children.push(
			new Paragraph({
				spacing: { after: 40 },
				children: [
					new TextRun({
						text: `${group.category}: `,
						bold: true,
						size: 22,
						font: "Calibri",
					}),
					new TextRun({
						text: group.items.join(", "),
						size: 22,
						font: "Calibri",
					}),
				],
			}),
		)
	}

	// Work Experience section
	children.push(sectionHeading("Experience"))
	for (const job of resume.workExperience) {
		// Company and title line
		children.push(
			new Paragraph({
				tabStops: [
					{
						type: TabStopType.RIGHT,
						position: TabStopPosition.MAX,
					},
				],
				spacing: { before: 120 },
				children: [
					new TextRun({
						text: job.title,
						bold: true,
						size: 22,
						font: "Calibri",
					}),
					new TextRun({
						text: ` — ${job.company}`,
						size: 22,
						font: "Calibri",
					}),
					new TextRun({
						text: `\t${job.startDate} – ${job.endDate}`,
						size: 22,
						font: "Calibri",
					}),
				],
			}),
		)

		// Highlights as bullet points
		for (const highlight of job.highlights) {
			children.push(
				new Paragraph({
					bullet: { level: 0 },
					spacing: { after: 40 },
					children: [
						new TextRun({
							text: highlight,
							size: 22,
							font: "Calibri",
						}),
					],
				}),
			)
		}
	}

	// Education section
	children.push(sectionHeading("Education"))
	for (const edu of resume.education) {
		children.push(
			new Paragraph({
				spacing: { after: 40 },
				children: [
					new TextRun({
						text: `${edu.degree} in ${edu.field}`,
						bold: true,
						size: 22,
						font: "Calibri",
					}),
					new TextRun({
						text: ` — ${edu.institution}`,
						size: 22,
						font: "Calibri",
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
						margin: {
							top: 720,
							right: 720,
							bottom: 720,
							left: 720,
						},
					},
				},
				children,
			},
		],
	})

	return Buffer.from(await Packer.toBuffer(doc))
}

function sectionHeading(text: string): Paragraph {
	return new Paragraph({
		heading: HeadingLevel.HEADING_2,
		spacing: { before: 240, after: 80 },
		border: {
			bottom: { style: "single" as const, size: 1, color: "999999" },
		},
		children: [
			new TextRun({
				text: text.toUpperCase(),
				bold: true,
				size: 24,
				font: "Calibri",
				color: "333333",
			}),
		],
	})
}
