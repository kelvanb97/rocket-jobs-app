import { SectionLabel } from "#atoms/section-label"
import { StepCard } from "#molecules/step-card"
import { WorkflowCard } from "#molecules/workflow-card"

const GRADIENT = "linear-gradient(135deg, var(--primary), #a78bfa)"

export function HomeTemplate() {
	return (
		<div className="flex flex-col gap-8">
			<div>
				<h1
					className="font-bold bg-clip-text"
					style={{
						fontSize: "1.625rem",
						background: GRADIENT,
						WebkitBackgroundClip: "text",
						WebkitTextFillColor: "transparent",
						marginBottom: "0.375rem",
					}}
				>
					Rocket Jobs
				</h1>
				<p
					className="text-muted-foreground"
					style={{ fontSize: "0.9375rem" }}
				>
					Run these skills from your AI assistant to get started.
					Click a chip to copy the invocation for your harness —
					Claude Code uses <code>/skill-name</code>, Codex uses{" "}
					<code>$skill-name</code>.
				</p>
			</div>

			<div className="flex flex-col gap-3">
				<SectionLabel>Getting Started</SectionLabel>
				<div
					className="grid gap-3"
					style={{
						gridTemplateColumns: "repeat(3, 1fr)",
						maxWidth: "56rem",
					}}
				>
					<StepCard
						skill="rj-help"
						title="Help"
						description="Shows you a list of what the app can do."
						iconName="FileText"
						step={1}
					/>
					<StepCard
						skill="rj-install"
						title="Install"
						description="Handles installing and updating the app on your computer. Works on Mac, Linux, and Windows."
						iconName="Play"
						step={2}
					/>
					<StepCard
						skill="rj-setup"
						title="Setup"
						description="Walks you through telling the app about yourself — your background, job preferences, and what you're looking for."
						iconName="User"
						step={3}
					/>
				</div>
			</div>

			<div className="flex flex-col gap-3">
				<SectionLabel>Daily Workflow</SectionLabel>
				<div
					className="grid gap-4"
					style={{
						gridTemplateColumns: "repeat(2, 1fr)",
						maxWidth: "40rem",
					}}
				>
					<WorkflowCard
						skill="rj-scrape"
						title="Scrape Jobs"
						description="Finds new job listings that match what you're looking for and adds them to your dashboard."
						iconName="Search"
					/>
					<WorkflowCard
						skill="rj-auto-apply"
						title="Apply to Jobs"
						description="Picks the best-matching job, writes a tailored resume and cover letter, and fills out the application."
						iconName="Sparkles"
					/>
				</div>
			</div>
		</div>
	)
}
