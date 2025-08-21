export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "12.2.12 (cd3cf9e)"
  }
  public: {
    Tables: {
      deposits: {
        Row: {
          amount: number
          created_at: string
          crypto_type: string
          id: string
          status: string
          transaction_id: string | null
          updated_at: string
          user_id: string
          verified_at: string | null
          wallet_address: string
        }
        Insert: {
          amount: number
          created_at?: string
          crypto_type: string
          id?: string
          status?: string
          transaction_id?: string | null
          updated_at?: string
          user_id: string
          verified_at?: string | null
          wallet_address: string
        }
        Update: {
          amount?: number
          created_at?: string
          crypto_type?: string
          id?: string
          status?: string
          transaction_id?: string | null
          updated_at?: string
          user_id?: string
          verified_at?: string | null
          wallet_address?: string
        }
        Relationships: []
      }
      mining_sessions: {
        Row: {
          amount_mined: number
          crypto_type: string
          experience_gained: number
          hashrate_used: number
          id: string
          session_end: string | null
          session_start: string
          status: string
          user_id: string
        }
        Insert: {
          amount_mined?: number
          crypto_type?: string
          experience_gained?: number
          hashrate_used?: number
          id?: string
          session_end?: string | null
          session_start?: string
          status?: string
          user_id: string
        }
        Update: {
          amount_mined?: number
          crypto_type?: string
          experience_gained?: number
          hashrate_used?: number
          id?: string
          session_end?: string | null
          session_start?: string
          status?: string
          user_id?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          created_at: string
          deadspot_tokens: number | null
          experience_points: number | null
          hashrate_level: number | null
          id: string
          last_active: string | null
          loyalty_days: number | null
          monthly_referral_earnings: number | null
          referral_code: string
          referred_by: string | null
          total_earnings: number | null
          total_referral_earnings: number | null
          total_referrals: number | null
          updated_at: string
          user_id: string
          username: string | null
        }
        Insert: {
          created_at?: string
          deadspot_tokens?: number | null
          experience_points?: number | null
          hashrate_level?: number | null
          id?: string
          last_active?: string | null
          loyalty_days?: number | null
          monthly_referral_earnings?: number | null
          referral_code?: string
          referred_by?: string | null
          total_earnings?: number | null
          total_referral_earnings?: number | null
          total_referrals?: number | null
          updated_at?: string
          user_id: string
          username?: string | null
        }
        Update: {
          created_at?: string
          deadspot_tokens?: number | null
          experience_points?: number | null
          hashrate_level?: number | null
          id?: string
          last_active?: string | null
          loyalty_days?: number | null
          monthly_referral_earnings?: number | null
          referral_code?: string
          referred_by?: string | null
          total_earnings?: number | null
          total_referral_earnings?: number | null
          total_referrals?: number | null
          updated_at?: string
          user_id?: string
          username?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "profiles_referred_by_fkey"
            columns: ["referred_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["user_id"]
          },
        ]
      }
      referrals: {
        Row: {
          created_at: string
          earnings_generated: number | null
          id: string
          referral_code: string
          referred_id: string
          referrer_id: string
          status: string | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          earnings_generated?: number | null
          id?: string
          referral_code: string
          referred_id: string
          referrer_id: string
          status?: string | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          earnings_generated?: number | null
          id?: string
          referral_code?: string
          referred_id?: string
          referrer_id?: string
          status?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "referrals_referred_id_fkey"
            columns: ["referred_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["user_id"]
          },
          {
            foreignKeyName: "referrals_referrer_id_fkey"
            columns: ["referrer_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["user_id"]
          },
        ]
      }
      staking_positions: {
        Row: {
          amount_staked: number
          apy: number
          created_at: string
          crypto_type: string
          duration_days: number | null
          end_date: string | null
          id: string
          last_reward_at: string | null
          memo: string | null
          started_at: string
          total_rewards: number
          updated_at: string
          user_id: string
          wallet_address: string | null
        }
        Insert: {
          amount_staked?: number
          apy: number
          created_at?: string
          crypto_type: string
          duration_days?: number | null
          end_date?: string | null
          id?: string
          last_reward_at?: string | null
          memo?: string | null
          started_at?: string
          total_rewards?: number
          updated_at?: string
          user_id: string
          wallet_address?: string | null
        }
        Update: {
          amount_staked?: number
          apy?: number
          created_at?: string
          crypto_type?: string
          duration_days?: number | null
          end_date?: string | null
          id?: string
          last_reward_at?: string | null
          memo?: string | null
          started_at?: string
          total_rewards?: number
          updated_at?: string
          user_id?: string
          wallet_address?: string | null
        }
        Relationships: []
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
  public: {
    Enums: {},
  },
} as const
