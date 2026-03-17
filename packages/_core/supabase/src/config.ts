import { z } from "zod"

const envSchema = z.object({
	SUPABASE_URL: z.string().trim().url(),
	SUPABASE_PUBLISHABLE_KEY: z.string().trim().min(1),
	SUPABASE_SECRET_KEY: z.string().trim().min(1),
})

type Config = {
	readonly supabase: {
		readonly url: string
		readonly publishableKey: string
		readonly secretKey: string
	}
}

const createConfig = (): Config => {
	const env = envSchema.parse(process.env)
	return {
		supabase: {
			url: env.SUPABASE_URL,
			publishableKey: env.SUPABASE_PUBLISHABLE_KEY,
			secretKey: env.SUPABASE_SECRET_KEY,
		},
	} as const
}

let _config: Config | null = null

export const config = () => {
	if (!_config) _config = createConfig()
	return _config
}
