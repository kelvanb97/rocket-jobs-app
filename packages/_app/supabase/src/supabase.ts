export type Json =
	| string
	| number
	| boolean
	| null
	| { [key: string]: Json | undefined }
	| Json[]

export type Database = {
	app: {
		Tables: {
			application: {
				Row: {
					cover_letter_path: string | null
					created_at: string | null
					id: string
					notes: string | null
					resume_path: string | null
					role_id: string | null
					status: string
					submitted_at: string | null
					updated_at: string | null
				}
				Insert: {
					cover_letter_path?: string | null
					created_at?: string | null
					id?: string
					notes?: string | null
					resume_path?: string | null
					role_id?: string | null
					status?: string
					submitted_at?: string | null
					updated_at?: string | null
				}
				Update: {
					cover_letter_path?: string | null
					created_at?: string | null
					id?: string
					notes?: string | null
					resume_path?: string | null
					role_id?: string | null
					status?: string
					submitted_at?: string | null
					updated_at?: string | null
				}
				Relationships: [
					{
						foreignKeyName: "application_role_id_fkey"
						columns: ["role_id"]
						isOneToOne: false
						referencedRelation: "role"
						referencedColumns: ["id"]
					},
				]
			}
			company: {
				Row: {
					created_at: string | null
					id: string
					industry: string | null
					linkedin_url: string | null
					name: string
					notes: string | null
					size: string | null
					stage: string | null
					updated_at: string | null
					website: string | null
				}
				Insert: {
					created_at?: string | null
					id?: string
					industry?: string | null
					linkedin_url?: string | null
					name: string
					notes?: string | null
					size?: string | null
					stage?: string | null
					updated_at?: string | null
					website?: string | null
				}
				Update: {
					created_at?: string | null
					id?: string
					industry?: string | null
					linkedin_url?: string | null
					name?: string
					notes?: string | null
					size?: string | null
					stage?: string | null
					updated_at?: string | null
					website?: string | null
				}
				Relationships: []
			}
			interaction: {
				Row: {
					created_at: string | null
					id: string
					notes: string | null
					person_id: string | null
					role_id: string | null
					type: string
					updated_at: string | null
				}
				Insert: {
					created_at?: string | null
					id?: string
					notes?: string | null
					person_id?: string | null
					role_id?: string | null
					type: string
					updated_at?: string | null
				}
				Update: {
					created_at?: string | null
					id?: string
					notes?: string | null
					person_id?: string | null
					role_id?: string | null
					type?: string
					updated_at?: string | null
				}
				Relationships: [
					{
						foreignKeyName: "interaction_person_id_fkey"
						columns: ["person_id"]
						isOneToOne: false
						referencedRelation: "person"
						referencedColumns: ["id"]
					},
					{
						foreignKeyName: "interaction_role_id_fkey"
						columns: ["role_id"]
						isOneToOne: false
						referencedRelation: "role"
						referencedColumns: ["id"]
					},
				]
			}
			person: {
				Row: {
					company_id: string | null
					created_at: string | null
					email: string | null
					id: string
					linkedin_url: string | null
					name: string
					notes: string | null
					title: string | null
					updated_at: string | null
				}
				Insert: {
					company_id?: string | null
					created_at?: string | null
					email?: string | null
					id?: string
					linkedin_url?: string | null
					name: string
					notes?: string | null
					title?: string | null
					updated_at?: string | null
				}
				Update: {
					company_id?: string | null
					created_at?: string | null
					email?: string | null
					id?: string
					linkedin_url?: string | null
					name?: string
					notes?: string | null
					title?: string | null
					updated_at?: string | null
				}
				Relationships: [
					{
						foreignKeyName: "person_company_id_fkey"
						columns: ["company_id"]
						isOneToOne: false
						referencedRelation: "company"
						referencedColumns: ["id"]
					},
				]
			}
			role: {
				Row: {
					application_url: string | null
					company_id: string | null
					created_at: string | null
					description: string | null
					id: string
					location: string | null
					location_type: string | null
					notes: string | null
					posted_at: string | null
					salary_max: number | null
					salary_min: number | null
					source: string | null
					source_url: string | null
					status: string
					title: string
					updated_at: string | null
					url: string | null
				}
				Insert: {
					application_url?: string | null
					company_id?: string | null
					created_at?: string | null
					description?: string | null
					id?: string
					location?: string | null
					location_type?: string | null
					notes?: string | null
					posted_at?: string | null
					salary_max?: number | null
					salary_min?: number | null
					source?: string | null
					source_url?: string | null
					status?: string
					title: string
					updated_at?: string | null
					url?: string | null
				}
				Update: {
					application_url?: string | null
					company_id?: string | null
					created_at?: string | null
					description?: string | null
					id?: string
					location?: string | null
					location_type?: string | null
					notes?: string | null
					posted_at?: string | null
					salary_max?: number | null
					salary_min?: number | null
					source?: string | null
					source_url?: string | null
					status?: string
					title?: string
					updated_at?: string | null
					url?: string | null
				}
				Relationships: [
					{
						foreignKeyName: "role_company_id_fkey"
						columns: ["company_id"]
						isOneToOne: false
						referencedRelation: "company"
						referencedColumns: ["id"]
					},
				]
			}
			role_person: {
				Row: {
					person_id: string
					relationship: string | null
					role_id: string
				}
				Insert: {
					person_id: string
					relationship?: string | null
					role_id: string
				}
				Update: {
					person_id?: string
					relationship?: string | null
					role_id?: string
				}
				Relationships: [
					{
						foreignKeyName: "role_person_person_id_fkey"
						columns: ["person_id"]
						isOneToOne: false
						referencedRelation: "person"
						referencedColumns: ["id"]
					},
					{
						foreignKeyName: "role_person_role_id_fkey"
						columns: ["role_id"]
						isOneToOne: false
						referencedRelation: "role"
						referencedColumns: ["id"]
					},
				]
			}
			score: {
				Row: {
					created_at: string | null
					id: string
					negative: string[] | null
					positive: string[] | null
					role_id: string | null
					score: number
					updated_at: string | null
				}
				Insert: {
					created_at?: string | null
					id?: string
					negative?: string[] | null
					positive?: string[] | null
					role_id?: string | null
					score: number
					updated_at?: string | null
				}
				Update: {
					created_at?: string | null
					id?: string
					negative?: string[] | null
					positive?: string[] | null
					role_id?: string | null
					score?: number
					updated_at?: string | null
				}
				Relationships: [
					{
						foreignKeyName: "score_role_id_fkey"
						columns: ["role_id"]
						isOneToOne: true
						referencedRelation: "role"
						referencedColumns: ["id"]
					},
				]
			}
		}
		Views: {
			[_ in never]: never
		}
		Functions: {
			[_ in never]: never
		}
		Enums: {
			[_ in never]: never
		}
		CompositeTypes: {
			[_ in never]: never
		}
	}
	public: {
		Tables: {
			[_ in never]: never
		}
		Views: {
			[_ in never]: never
		}
		Functions: {
			[_ in never]: never
		}
		Enums: {
			[_ in never]: never
		}
		CompositeTypes: {
			[_ in never]: never
		}
	}
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
	DefaultSchemaTableNameOrOptions extends
		| keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
		| { schema: keyof DatabaseWithoutInternals },
	TableName extends DefaultSchemaTableNameOrOptions extends {
		schema: keyof DatabaseWithoutInternals
	}
		? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
				DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
		: never = never,
> = DefaultSchemaTableNameOrOptions extends {
	schema: keyof DatabaseWithoutInternals
}
	? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
			DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
			Row: infer R
		}
		? R
		: never
	: DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
				DefaultSchema["Views"])
		? (DefaultSchema["Tables"] &
				DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
				Row: infer R
			}
			? R
			: never
		: never

export type TablesInsert<
	DefaultSchemaTableNameOrOptions extends
		| keyof DefaultSchema["Tables"]
		| { schema: keyof DatabaseWithoutInternals },
	TableName extends DefaultSchemaTableNameOrOptions extends {
		schema: keyof DatabaseWithoutInternals
	}
		? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
		: never = never,
> = DefaultSchemaTableNameOrOptions extends {
	schema: keyof DatabaseWithoutInternals
}
	? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
			Insert: infer I
		}
		? I
		: never
	: DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
		? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
				Insert: infer I
			}
			? I
			: never
		: never

export type TablesUpdate<
	DefaultSchemaTableNameOrOptions extends
		| keyof DefaultSchema["Tables"]
		| { schema: keyof DatabaseWithoutInternals },
	TableName extends DefaultSchemaTableNameOrOptions extends {
		schema: keyof DatabaseWithoutInternals
	}
		? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
		: never = never,
> = DefaultSchemaTableNameOrOptions extends {
	schema: keyof DatabaseWithoutInternals
}
	? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
			Update: infer U
		}
		? U
		: never
	: DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
		? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
				Update: infer U
			}
			? U
			: never
		: never

export type Enums<
	DefaultSchemaEnumNameOrOptions extends
		| keyof DefaultSchema["Enums"]
		| { schema: keyof DatabaseWithoutInternals },
	EnumName extends DefaultSchemaEnumNameOrOptions extends {
		schema: keyof DatabaseWithoutInternals
	}
		? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
		: never = never,
> = DefaultSchemaEnumNameOrOptions extends {
	schema: keyof DatabaseWithoutInternals
}
	? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
	: DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
		? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
		: never

export type CompositeTypes<
	PublicCompositeTypeNameOrOptions extends
		| keyof DefaultSchema["CompositeTypes"]
		| { schema: keyof DatabaseWithoutInternals },
	CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
		schema: keyof DatabaseWithoutInternals
	}
		? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
		: never = never,
> = PublicCompositeTypeNameOrOptions extends {
	schema: keyof DatabaseWithoutInternals
}
	? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
	: PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
		? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
		: never

export const Constants = {
	app: {
		Enums: {},
	},
	public: {
		Enums: {},
	},
} as const
