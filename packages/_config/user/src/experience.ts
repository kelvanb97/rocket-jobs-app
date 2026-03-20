// ---------------------------------------------------------------------------
// @aja-config/user — experience.ts
// ---------------------------------------------------------------------------
// Canonical source of truth for the candidate profile. Used by:
// - Scoring prompt (condensed view of experience for role matching)
// - Resume generator (cherry-picks relevant highlights per application)
// - Cover letter generator (narrative context for storytelling)
// ---------------------------------------------------------------------------

export type TWorkExperience = {
	company: string
	title: string
	startDate: string
	endDate: string | "Current"
	type: "full-time" | "contract" | "founder"
	platforms: string[]
	techStack: string[]
	summary: string
	highlights: string[]
}

export type TEducation = {
	degree: string
	field: string
	institution: string
}

export type TUserProfile = {
	name: string
	jobTitle: string
	seniority: "junior" | "mid" | "senior" | "staff" | "principal" | "director"
	yearsOfExperience: number
	summary: string
	skills: string[]
	preferredSkills: string[]
	preferredLocationTypes: ("remote" | "hybrid" | "on-site")[]
	preferredLocations: string[]
	salaryMin: number
	salaryMax: number
	industries: string[]
	dealbreakers: string[]
	notes: string
	domainExpertise: string[]
	workExperience: TWorkExperience[]
	education: TEducation[]
}

export const USER_PROFILE: TUserProfile = {
	name: "Kelvan Brandt",
	jobTitle: "Senior Software Engineer",
	seniority: "senior",
	yearsOfExperience: 5,
	summary: [
		"Senior software engineer specializing in building and scaling early-stage products.",
		"5+ years working directly with founders and small teams as a technical lead and consultant,",
		"shipping production systems across web, mobile, and data-intensive platforms.",
		"Track record of diagnosing deep performance problems (57x canvas rendering throughput, 8x API latency,",
		"13x build speed, 6x page load), designing distributed infrastructure at scale (30M+ items/day, 500+ concurrent containers),",
		"and delivering cross-platform MVPs under tight timelines.",
		"Strongest in TypeScript/React/Next.js/Node.js/PostgreSQL with deep AWS and Supabase experience.",
		"AI-augmented development workflow using Claude Code with autoresearch and RALPH loops.",
	].join(" "),

	skills: [
		// Languages
		"TypeScript",
		"JavaScript",
		"Python",
		"HTML",
		"CSS",
		// Frontend frameworks
		"React",
		"Next.js",
		"React Native",
		"Expo",
		"Tamagui",
		"Tailwind CSS",
		"Radix UI",
		"React Flow",
		"D3",
		"React Native SVG",
		// Backend
		"Node.js",
		"Express.js",
		"REST APIs",
		"Supabase Edge Functions",
		// Databases
		"PostgreSQL",
		"Supabase",
		"DynamoDB",
		"MongoDB",
		// AI / ML
		"OpenAI API",
		"Anthropic API",
		"Claude Code",
		"TensorFlow",
		"Fal.ai",
		"RAG",
		"LLM prompt engineering",
		// AWS
		"AWS Fargate",
		"AWS Lambda",
		"AWS SQS",
		"AWS SNS",
		"AWS EC2",
		"AWS S3",
		"AWS API Gateway",
		"AWS CDK",
		"AWS CloudFormation",
		// Infrastructure / DevOps
		"Docker",
		"Vercel",
		"Digital Ocean",
		"CI/CD",
		"Sentry",
		"Feature flags",
		"Webpack",
		// Scraping / Automation
		"Puppeteer",
		"Patchright",
		"ScraperAPI",
		"Bot detection avoidance",
		// CMS / Third-party
		"Sanity CMS",
		"Klaviyo",
		"Stripe",
		"Keepa API",
		// Tooling
		"Zod",
		"ESLint",
		"Prettier",
		"Turborepo",
		"pnpm",
		"Git",
		// Testing
		"Jest",
		"Cypress",
		"Vitest",
		// Practices
		"Agile",
		"Onion architecture",
		"Facade pattern",
		"Event-driven architecture",
		"Atomic design (Brad Frost)",
	],

	preferredSkills: [
		"TypeScript",
		"React",
		"Next.js",
		"Node.js",
		"PostgreSQL",
		"Tailwind CSS",
		"Supabase",
	],

	preferredLocationTypes: ["remote"],
	preferredLocations: [],
	salaryMin: 150_000,
	salaryMax: 200_000,
	industries: [],

	dealbreakers: ["Java", "Java/Spring Boot"],

	notes: [
		"AI-augmented development workflow: uses Claude Code with autoresearch and RALPH loops daily.",
		"Operates as a consultant under Kelvco LLC — all contract roles are through this entity.",
		"Strongest fit is early-stage startups where breadth and speed matter more than deep specialization in one layer.",
	].join(" "),

	domainExpertise: [
		"Performance optimization — canvas rendering throughput, API latency, build tooling, memory profiling, page load speed, webpack tuning",
		"Distributed systems — event-driven architectures, queue-based pipelines, high-volume scraping infrastructure, container orchestration at scale",
		"Early-stage product development — zero-to-one MVPs, rapid prototyping, architecture decisions under uncertainty, solo full-stack builds",
		"Cross-platform development — unified Next.js + Expo codebases, shared component libraries, Tamagui design token systems",
		"Technical leadership — hiring, interviewing, sprint planning, mentoring engineers, aligning engineering with business goals, SDLC process improvement",
		"AI/ML integration — LLM-powered chat interfaces with RAG, AI media generation workflows, TensorFlow-based product matching, prompt engineering",
		"Cost and unit-economics analysis — infrastructure cost reduction, identifying product-level financial risks, v1→v2 architecture migrations for cost savings",
		"Developer experience — linting, formatting, CI/CD, error monitoring, dev environment standardization, fast feedback loops, code review standards",
		"Design systems — atomic design token systems, unifying design teams around shared standards, cross-platform token sharing",
		"Scraping and data engineering — large-scale web scraping, bot detection avoidance, ETL pipelines, data matching and normalization",
	],

	workExperience: [
		{
			company: "SurePeople",
			title: "Senior Software Engineer",
			startDate: "Mar 2025",
			endDate: "Jul 2025",
			type: "contract",
			platforms: ["web"],
			techStack: [
				"React",
				"TypeScript",
				"Next.js",
				"Node.js",
				"Supabase",
				"Tamagui",
				"OpenAI API",
				"Sentry",
				"Zod",
				"Turborepo",
			],
			summary:
				"Legacy enterprise modernization. Rebuilt a decade-old Java Spring Boot personality assessment platform from the ground up as a modern TypeScript stack. Product serves tens of thousands of users in production. Contracted through LightStrike LLC.",
			highlights: [
				"Led ground-up rebuild of a legacy Java Spring Boot application into a modern TypeScript/Next.js/Supabase stack, now in production with tens of thousands of users.",
				"Architected assessment scoring engine using onion architecture, cleanly separating domain logic from infrastructure concerns.",
				"Used decision tree analysis to exhaustively enumerate all possible assessment answer paths and discovered that certain score combinations mapped to no valid personality — fixed the mapping and eliminated a persistent production bug entirely.",
				"Built an LLM-powered chat interface using OpenAI where the user's personality profile was injected into the system prompt via RAG, enabling personalized conversational guidance.",
				"Created an atomic design (Brad Frost) token system in Tamagui — a novel approach in the Tamagui ecosystem — including subatomic tokens, unifying a design team that had zero prior standards.",
				"Applied facade pattern across external dependencies to minimize vendor lock-in and simplify future migration paths.",
				"Managed one junior engineer, established code review standards, and enforced engineering quality across the engagement.",
			],
		},
		{
			company: "Kaiber",
			title: "Senior Software Engineer",
			startDate: "Oct 2024",
			endDate: "Mar 2025",
			type: "contract",
			platforms: ["web"],
			techStack: [
				"React",
				"TypeScript",
				"React Flow",
				"Canvas API",
				"Fal.ai",
				"Sentry",
				"ESLint",
				"Prettier",
				"Webpack",
				"Vercel",
				"Digital Ocean",
			],
			summary:
				"AI-powered creative studio — a Photoshop-style infinite canvas web application for generating and manipulating text, image, video, audio, and LoRA media using AI. Also featured agentic workflows where users could describe a creative goal and the app would build the node flow automatically. Team of ~30, reported to head of engineering.",
			highlights: [
				"Owned the node workflow system — built executable pipelines connecting heterogeneous AI model nodes (text, image, video, audio, LoRA) into executable pipelines. Integrated with Fal.ai across models with varying API signatures, handled MIME type transforms between media types (video→image, video→audio), and managed complex source handle (many-to-one) and target handle (many-to-many) connection logic. Shipped incrementally behind feature flags.",
				"Improved core canvas rendering throughput 57× (35 → ~2,000 nodes) by diagnosing and fixing memoization failures in React Flow's rendering pipeline. Nested state updates without full canvas rerenders were critical in the infinite canvas context.",
				"Overhauled the entire SDLC: established linting (uncovered ~4,100 hidden errors from missing dependency declarations), formatting, TypeScript strictness, and code review standards for a ~30 person team. Reduced crash reports by 85% after linting resolution.",
				"Optimized hot module reload from 6.7s to 0.5s (13× improvement) and reduced First Contentful Paint from ~9s to 1.5s (6× improvement) by fixing Webpack configuration issues.",
				"Fixed broken dev environments for 10+ engineers and taught React performance patterns specific to infinite canvas applications where typical shortcuts cause cascading lag.",
				"Integrated Sentry with anonymized user tracking so support could locate issues for specific authorized users. Built a hidden internal tool for viewing feature flag states in production, reducing QA thrashing.",
				"Helped stabilize the agentic workflow feature by cleaning up the codebase to support reliable JSON diffing on potentially massive canvas state objects.",
				"Migrated frontend hosting from Digital Ocean to Vercel and migrated DNS records. Wrote an EDD for a full Next.js migration (deprioritized by leadership).",
				"Identified a critical free-trial unit-economics flaw that was costing Kaiber over $40k/month, leading to an immediate product change.",
			],
		},
		{
			company: "STAR/CHILD",
			title: "Senior Software Engineer",
			startDate: "Oct 2023",
			endDate: "Oct 2024",
			type: "contract",
			platforms: ["web", "iOS", "Android"],
			techStack: [
				"Next.js",
				"React Native",
				"Expo",
				"TypeScript",
				"Tamagui",
				"Supabase",
				"Sanity CMS",
				"Klaviyo",
				"React Native SVG",
				"Node.js",
			],
			summary:
				"Cross-platform astrology entertainment app built from zero to production across web, iOS, and Android. Contracted through LightStrike LLC. Reported to consultancy CTO, managed a mixed-seniority team of 4 (2 junior engineers, 1 senior part-time, consultancy founder).",
			highlights: [
				"Recruited (conducted interviews and hiring decisions) and led a 4-engineer team, tripling sprint velocity and delivering a full cross-platform MVP (web, iOS, Android) in 5 months.",
				"Built an interactive natal chart renderer using React Native SVG with complex overlap/collision detection algorithms — entities positioned too closely within chart slices required dynamic repositioning without exceeding slice boundaries, handling edge cases of 8+ entities per slice.",
				"Created an automated pipeline to render user-specific natal charts as PNG images for marketing email sequences — required building a standalone rendering environment to handle React Native SVG→PNG conversion, separate sub-asset conversion, and font loading in an isolated context.",
				"Built a standalone astronomical calculation service for moon position computation using Julian calendar math after discovering the third-party Astrology API calculated positions incorrectly.",
				"Built an ETL pipeline with a facade pattern around the Astrology API and a bulk GROQ query layer for Sanity CMS, reducing API latency 8× (6s → 0.75s) while isolating the app from vendor-specific data formats.",
				"Architected the Sanity CMS content model powering all app content — daily universal insights, personalized insights, natal chart interpretations, and daily podcast episodes.",
				"Implemented Klaviyo for analytics, email sequences, and push notifications — forked and fixed Klaviyo's beta Expo packages to support React Native push notifications.",
				"Built app versioning and forced update system with a separate database schema and modal — supported graceful degradation for older app versions while force-updating on major releases.",
				"Implemented Sentry, deep linking, auth flow with birth data collection, privacy settings, and multi-person profile support (view insights for added people).",
				"Learned React Native from scratch for this engagement — first mobile project, shipped production cross-platform apps within the engagement timeline.",
			],
		},
		{
			company: "Flip Sourcer",
			title: "Senior Software Engineer",
			startDate: "Jan 2022",
			endDate: "Sep 2023",
			type: "founder",
			platforms: ["web", "Chrome extension"],
			techStack: [
				"React",
				"TypeScript",
				"Next.js",
				"Node.js",
				"Express.js",
				"PostgreSQL",
				"AWS Fargate",
				"AWS Lambda",
				"AWS SQS",
				"AWS SNS",
				"AWS EC2",
				"AWS S3",
				"AWS API Gateway",
				"AWS CDK",
				"AWS CloudFormation",
				"Docker",
				"Puppeteer",
				"ScraperAPI",
				"TensorFlow",
				"Python",
				"Keepa API",
				"Stripe",
				"D3",
			],
			summary:
				"Solo-built SaaS platform helping Amazon resellers identify profitable products using large-scale ecommerce data. Started as a Chrome extension (peaked ~80 users, $20/mo), evolved into a full automated scraping and product matching platform. Peak MRR $12k. Shut down due to marketplace dynamics — power users buying out profitable inventory devalued the product for other subscribers.",
			highlights: [
				"Designed and scaled distributed scraping infrastructure processing 30M+ products/day across 17 ecommerce sites (Best Buy, GameStop, Walgreens, Macy's, Kohls, etc.) using up to ~500 concurrent Fargate containers per scrape cycle.",
				"Built a product matching pipeline using TensorFlow (Python) with pre-trained embeddings for title comparison and image normalization/comparison — matched scraped products to Amazon listings with three confidence tiers (no match, maybe match, probably match) used for prioritized data hydration.",
				"Re-architected from monolith (Fargate owns everything end-to-end) to event-driven microservices (Fargate handles scraping only, row triggers fire Lambdas for match scoring via SQS/SNS), cutting infrastructure costs 50% (~$10k/month) by eliminating idle container time during I/O-bound matching work.",
				"Built infrastructure-as-code deployment using AWS CDK with an always-on EC2 orchestrator that spawned and managed Fargate scraping instances on a nightly schedule using site-specific config files and sitemap-based bookmark tracking.",
				"Implemented resilient scraping with automatic bot detection recovery — flagged Fargate instances would terminate, blacklist their IP, spawn a replacement, and failover to ScraperAPI. Bookmark table tracked error rates per catalog with a 3-strike dead threshold per run.",
				"Reverse-engineered bot detection systems across 17 ecommerce platforms using headless Puppeteer, with site-specific scraping configs that adapted to DOM changes.",
				"Built rate-limited queue systems integrating Keepa API's token-based billing model for cost-efficient data hydration of high-confidence product matches.",
				"Built the full consumer-facing product solo: Next.js frontend with Stripe billing, D3 charts, filtering/sorting by match confidence, ecommerce provider, and product metadata.",
				"Grew the business from a free Chrome extension to $12k MRR as a solo technical founder handling all engineering, infrastructure, product, and business operations.",
			],
		},
		{
			company: "GrowthBook",
			title: "Senior Software Engineer",
			startDate: "Jun 2022",
			endDate: "Nov 2022",
			type: "full-time",
			platforms: ["web"],
			techStack: ["React", "TypeScript", "Node.js", "MongoDB"],
			summary:
				"Open-source feature flagging and A/B testing platform. Contributed enterprise-tier features that unblocked adoption by larger organizations.",
			highlights: [
				"Built enterprise RBAC permissioning system — custom role definitions, project-scoped and org-scoped permissions, with both frontend enforcement and backend authorization to prevent privilege escalation.",
				"Developed integrations enabling developers to deploy GrowthBook projects through Vercel.",
			],
		},
		{
			company: "Mend Together",
			title: "Software Engineer",
			startDate: "Aug 2021",
			endDate: "Jun 2022",
			type: "contract",
			platforms: ["web"],
			techStack: ["React", "TypeScript", "Node.js"],
			summary:
				"Social platform supporting cancer patients and their families — combined social networking features with GoFundMe-style fundraising and a gift registry. Privacy and anonymization were core requirements because cancer patients risk employment discrimination.",
			highlights: [
				"Built authentication flows and progressive user onboarding with evolving data collection requirements.",
				"Implemented privacy and anonymization features to protect users from potential employment discrimination based on health status.",
			],
		},
		{
			company: "Third Floor Tech",
			title: "Senior Software Engineer",
			startDate: "Dec 2020",
			endDate: "Jul 2021",
			type: "contract",
			platforms: ["web"],
			techStack: [
				"React",
				"JavaScript",
				"AWS Lambda",
				"AWS API Gateway",
				"AWS S3",
				"AWS CloudFormation",
				"DynamoDB",
			],
			summary:
				"AI-powered mortgage CRM and loan officer productivity platform — full replacement for Jungo. Solo-built the entire application as founding engineer. Engagement ended when the founder pivoted back to his real estate business after failing to land a target enterprise contract.",
			highlights: [
				"Solo-built an entire loan officer CRM platform from scratch as founding engineer — auth, dashboard, client management, communication tools, and financial calculators.",
				"Built amortization calculators, integrated email and SMS communication features, and consolidated the fragmented toolset loan officers used daily into a single application.",
				"Deployed full serverless architecture on AWS: S3-hosted React SPA via CloudFormation, API Gateway, Lambda functions, and DynamoDB.",
			],
		},
	],

	education: [
		{
			degree: "Bachelor of Science",
			field: "Computer Science",
			institution: "Western Washington University",
		},
	],
}
