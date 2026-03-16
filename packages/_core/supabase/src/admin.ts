import { createClient } from "@supabase/supabase-js"
import { config } from "./config"

export const supabaseAdminClient = <Database>() =>
	createClient<Database>(config().supabase.url, config().supabase.secretKey)
