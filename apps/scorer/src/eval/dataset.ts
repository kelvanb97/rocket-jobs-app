import { mkdir, readFile, writeFile } from "node:fs/promises"
import { dirname, resolve } from "node:path"
import { fileURLToPath } from "node:url"

export type TLabeledRole = {
	roleId: string
	humanScore: number
	isTitleFit: boolean
	isSeniorityAppropriate: boolean
	doSkillsAlign: boolean
	isLocationAcceptable: boolean
	isSalaryAcceptable: boolean
	labeledAt: string
}

const __dirname = dirname(fileURLToPath(import.meta.url))
const DATA_PATH = resolve(__dirname, "../../data/labeled-roles.json")

export async function loadDataset(): Promise<TLabeledRole[]> {
	try {
		const raw = await readFile(DATA_PATH, "utf-8")
		return JSON.parse(raw) as TLabeledRole[]
	} catch {
		return []
	}
}

export async function saveLabel(label: TLabeledRole): Promise<void> {
	const dataset = await loadDataset()
	const existing = dataset.findIndex((l) => l.roleId === label.roleId)
	if (existing !== -1) {
		dataset[existing] = label
	} else {
		dataset.push(label)
	}
	await mkdir(dirname(DATA_PATH), { recursive: true })
	await writeFile(DATA_PATH, JSON.stringify(dataset, null, 2) + "\n")
}

export async function saveDataset(dataset: TLabeledRole[]): Promise<void> {
	await mkdir(dirname(DATA_PATH), { recursive: true })
	await writeFile(DATA_PATH, JSON.stringify(dataset, null, 2) + "\n")
}

const EVAL_SET_PATH = resolve(
	__dirname,
	"../../autoresearch/evals/eval_set.json",
)

export type TEvalExample = {
	roleId: string
	title: string
	userMessage: string
	humanScore: number
	isTitleFit: boolean
	isSeniorityAppropriate: boolean
	doSkillsAlign: boolean
	isLocationAcceptable: boolean
	isSalaryAcceptable: boolean
	labeledAt: string
}

export async function loadEvalSet(): Promise<TEvalExample[]> {
	try {
		const raw = await readFile(EVAL_SET_PATH, "utf-8")
		return JSON.parse(raw) as TEvalExample[]
	} catch {
		return []
	}
}

export async function saveEvalExample(example: TEvalExample): Promise<void> {
	const evalSet = await loadEvalSet()
	const existing = evalSet.findIndex((e) => e.roleId === example.roleId)
	if (existing !== -1) {
		evalSet[existing] = example
	} else {
		evalSet.push(example)
	}
	await mkdir(dirname(EVAL_SET_PATH), { recursive: true })
	await writeFile(EVAL_SET_PATH, JSON.stringify(evalSet, null, 2) + "\n")
}
