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
      battle_passes: {
        Row: {
          created_at: string
          experience_points: number
          expires_at: string | null
          id: string
          is_premium: boolean
          level: number
          premium_purchased_at: string | null
          rewards_claimed: Json | null
          season_name: string
          tier: string
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          experience_points?: number
          expires_at?: string | null
          id?: string
          is_premium?: boolean
          level?: number
          premium_purchased_at?: string | null
          rewards_claimed?: Json | null
          season_name: string
          tier?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          experience_points?: number
          expires_at?: string | null
          id?: string
          is_premium?: boolean
          level?: number
          premium_purchased_at?: string | null
          rewards_claimed?: Json | null
          season_name?: string
          tier?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      chat_messages: {
        Row: {
          created_at: string
          id: string
          message: string
          user_id: string
          username: string
        }
        Insert: {
          created_at?: string
          id?: string
          message: string
          user_id: string
          username: string
        }
        Update: {
          created_at?: string
          id?: string
          message?: string
          user_id?: string
          username?: string
        }
        Relationships: []
      }
      coin_purchases: {
        Row: {
          amount_deadspot: number
          amount_usd: number
          created_at: string
          currency: string
          exchange_rate: number
          id: string
          payeer_account: string | null
          status: string
          transaction_id: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          amount_deadspot: number
          amount_usd: number
          created_at?: string
          currency?: string
          exchange_rate?: number
          id?: string
          payeer_account?: string | null
          status?: string
          transaction_id?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          amount_deadspot?: number
          amount_usd?: number
          created_at?: string
          currency?: string
          exchange_rate?: number
          id?: string
          payeer_account?: string | null
          status?: string
          transaction_id?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
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
      events: {
        Row: {
          created_at: string
          description: string
          end_date: string
          event_type: string
          id: string
          is_active: boolean | null
          multiplier: number | null
          start_date: string
          title: string
        }
        Insert: {
          created_at?: string
          description: string
          end_date: string
          event_type: string
          id?: string
          is_active?: boolean | null
          multiplier?: number | null
          start_date: string
          title: string
        }
        Update: {
          created_at?: string
          description?: string
          end_date?: string
          event_type?: string
          id?: string
          is_active?: boolean | null
          multiplier?: number | null
          start_date?: string
          title?: string
        }
        Relationships: []
      }
      farming_data: {
        Row: {
          created_at: string
          deadspot_coins: number
          id: string
          updated_at: string
          user_id: string
          zero_tokens: number
        }
        Insert: {
          created_at?: string
          deadspot_coins?: number
          id?: string
          updated_at?: string
          user_id: string
          zero_tokens?: number
        }
        Update: {
          created_at?: string
          deadspot_coins?: number
          id?: string
          updated_at?: string
          user_id?: string
          zero_tokens?: number
        }
        Relationships: []
      }
      farming_inventory: {
        Row: {
          created_at: string
          id: string
          quantity: number
          seed_id: string
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          quantity?: number
          seed_id: string
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          quantity?: number
          seed_id?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      farming_slots: {
        Row: {
          created_at: string
          id: string
          is_growing: boolean
          is_unlocked: boolean
          planted_at: string | null
          planted_seed_id: string | null
          slot_id: number
          unlock_price: number
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          is_growing?: boolean
          is_unlocked?: boolean
          planted_at?: string | null
          planted_seed_id?: string | null
          slot_id: number
          unlock_price?: number
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          is_growing?: boolean
          is_unlocked?: boolean
          planted_at?: string | null
          planted_seed_id?: string | null
          slot_id?: number
          unlock_price?: number
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      faucet_claims: {
        Row: {
          amount_claimed: number
          claimed_at: string
          created_at: string
          id: string
          next_claim_at: string
          user_id: string
        }
        Insert: {
          amount_claimed?: number
          claimed_at?: string
          created_at?: string
          id?: string
          next_claim_at?: string
          user_id: string
        }
        Update: {
          amount_claimed?: number
          claimed_at?: string
          created_at?: string
          id?: string
          next_claim_at?: string
          user_id?: string
        }
        Relationships: []
      }
      leaderboard_entries: {
        Row: {
          created_at: string
          id: string
          leaderboard_type: string
          period_end: string
          period_start: string
          rank_position: number | null
          score: number
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          leaderboard_type: string
          period_end: string
          period_start: string
          rank_position?: number | null
          score?: number
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          leaderboard_type?: string
          period_end?: string
          period_start?: string
          rank_position?: number | null
          score?: number
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "leaderboard_entries_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["user_id"]
          },
        ]
      }
      loot_box_rewards: {
        Row: {
          created_at: string
          drop_chance: number
          id: string
          loot_box_id: string
          rarity: string
          reward_amount: number
          reward_name: string
          reward_type: string
        }
        Insert: {
          created_at?: string
          drop_chance: number
          id?: string
          loot_box_id: string
          rarity: string
          reward_amount: number
          reward_name: string
          reward_type: string
        }
        Update: {
          created_at?: string
          drop_chance?: number
          id?: string
          loot_box_id?: string
          rarity?: string
          reward_amount?: number
          reward_name?: string
          reward_type?: string
        }
        Relationships: [
          {
            foreignKeyName: "loot_box_rewards_loot_box_id_fkey"
            columns: ["loot_box_id"]
            isOneToOne: false
            referencedRelation: "loot_boxes"
            referencedColumns: ["id"]
          },
        ]
      }
      loot_boxes: {
        Row: {
          cost_deadspot: number
          created_at: string
          description: string
          id: string
          image_url: string | null
          is_available: boolean | null
          name: string
          rarity: string
        }
        Insert: {
          cost_deadspot: number
          created_at?: string
          description: string
          id?: string
          image_url?: string | null
          is_available?: boolean | null
          name: string
          rarity: string
        }
        Update: {
          cost_deadspot?: number
          created_at?: string
          description?: string
          id?: string
          image_url?: string | null
          is_available?: boolean | null
          name?: string
          rarity?: string
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
      missions: {
        Row: {
          created_at: string
          description: string
          duration_hours: number | null
          id: string
          is_active: boolean | null
          is_daily: boolean | null
          mission_type: string
          reward_amount: number
          reward_type: string
          target_amount: number
          title: string
        }
        Insert: {
          created_at?: string
          description: string
          duration_hours?: number | null
          id?: string
          is_active?: boolean | null
          is_daily?: boolean | null
          mission_type: string
          reward_amount: number
          reward_type: string
          target_amount: number
          title: string
        }
        Update: {
          created_at?: string
          description?: string
          duration_hours?: number | null
          id?: string
          is_active?: boolean | null
          is_daily?: boolean | null
          mission_type?: string
          reward_amount?: number
          reward_type?: string
          target_amount?: number
          title?: string
        }
        Relationships: []
      }
      platform_stats: {
        Row: {
          created_at: string
          display_format: string
          id: string
          stat_name: string
          stat_value: number
          updated_at: string
        }
        Insert: {
          created_at?: string
          display_format?: string
          id?: string
          stat_name: string
          stat_value?: number
          updated_at?: string
        }
        Update: {
          created_at?: string
          display_format?: string
          id?: string
          stat_name?: string
          stat_value?: number
          updated_at?: string
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
      rpg_equipment: {
        Row: {
          amulet: Json | null
          armor: Json | null
          created_at: string
          id: string
          ring: Json | null
          updated_at: string
          user_id: string
          weapon: Json | null
        }
        Insert: {
          amulet?: Json | null
          armor?: Json | null
          created_at?: string
          id?: string
          ring?: Json | null
          updated_at?: string
          user_id: string
          weapon?: Json | null
        }
        Update: {
          amulet?: Json | null
          armor?: Json | null
          created_at?: string
          id?: string
          ring?: Json | null
          updated_at?: string
          user_id?: string
          weapon?: Json | null
        }
        Relationships: []
      }
      rpg_inventory: {
        Row: {
          created_at: string
          equipment_data: Json
          id: string
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          equipment_data: Json
          id?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          equipment_data?: Json
          id?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      rpg_players: {
        Row: {
          base_stats: Json
          class_id: string
          created_at: string
          current_stats: Json
          enemies_defeated: number
          experience: number
          experience_to_next: number
          gold: number
          id: string
          level: number
          player_name: string
          stat_points: number
          updated_at: string
          user_id: string
          zero_coins: number
        }
        Insert: {
          base_stats?: Json
          class_id: string
          created_at?: string
          current_stats?: Json
          enemies_defeated?: number
          experience?: number
          experience_to_next?: number
          gold?: number
          id?: string
          level?: number
          player_name: string
          stat_points?: number
          updated_at?: string
          user_id: string
          zero_coins?: number
        }
        Update: {
          base_stats?: Json
          class_id?: string
          created_at?: string
          current_stats?: Json
          enemies_defeated?: number
          experience?: number
          experience_to_next?: number
          gold?: number
          id?: string
          level?: number
          player_name?: string
          stat_points?: number
          updated_at?: string
          user_id?: string
          zero_coins?: number
        }
        Relationships: []
      }
      skins: {
        Row: {
          cost_deadspot: number | null
          created_at: string
          description: string
          id: string
          image_url: string | null
          is_premium: boolean | null
          name: string
          rarity: string
          skin_type: string
          unlocked_by: string | null
        }
        Insert: {
          cost_deadspot?: number | null
          created_at?: string
          description: string
          id?: string
          image_url?: string | null
          is_premium?: boolean | null
          name: string
          rarity: string
          skin_type: string
          unlocked_by?: string | null
        }
        Update: {
          cost_deadspot?: number | null
          created_at?: string
          description?: string
          id?: string
          image_url?: string | null
          is_premium?: boolean | null
          name?: string
          rarity?: string
          skin_type?: string
          unlocked_by?: string | null
        }
        Relationships: []
      }
      spin_results: {
        Row: {
          created_at: string
          id: string
          is_free_spin: boolean
          prize_amount: number
          prize_type: string
          transaction_id: string | null
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          is_free_spin?: boolean
          prize_amount: number
          prize_type: string
          transaction_id?: string | null
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          is_free_spin?: boolean
          prize_amount?: number
          prize_type?: string
          transaction_id?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "spin_results_transaction_id_fkey"
            columns: ["transaction_id"]
            isOneToOne: false
            referencedRelation: "spin_transactions"
            referencedColumns: ["id"]
          },
        ]
      }
      spin_transactions: {
        Row: {
          amount_paid: number
          created_at: string
          currency_paid: string
          id: string
          payeer_account: string
          payment_method: string
          spins_purchased: number
          status: string
          transaction_id: string
          updated_at: string
          user_id: string
          verified_at: string | null
        }
        Insert: {
          amount_paid?: number
          created_at?: string
          currency_paid: string
          id?: string
          payeer_account?: string
          payment_method: string
          spins_purchased?: number
          status?: string
          transaction_id: string
          updated_at?: string
          user_id: string
          verified_at?: string | null
        }
        Update: {
          amount_paid?: number
          created_at?: string
          currency_paid?: string
          id?: string
          payeer_account?: string
          payment_method?: string
          spins_purchased?: number
          status?: string
          transaction_id?: string
          updated_at?: string
          user_id?: string
          verified_at?: string | null
        }
        Relationships: []
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
      user_loot_box_openings: {
        Row: {
          id: string
          loot_box_id: string
          opened_at: string
          reward_id: string
          user_id: string
        }
        Insert: {
          id?: string
          loot_box_id: string
          opened_at?: string
          reward_id: string
          user_id: string
        }
        Update: {
          id?: string
          loot_box_id?: string
          opened_at?: string
          reward_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_loot_box_openings_loot_box_id_fkey"
            columns: ["loot_box_id"]
            isOneToOne: false
            referencedRelation: "loot_boxes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "user_loot_box_openings_reward_id_fkey"
            columns: ["reward_id"]
            isOneToOne: false
            referencedRelation: "loot_box_rewards"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "user_loot_box_openings_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["user_id"]
          },
        ]
      }
      user_missions: {
        Row: {
          completed_at: string | null
          current_progress: number | null
          expires_at: string
          id: string
          is_claimed: boolean | null
          is_completed: boolean | null
          mission_id: string
          started_at: string
          target_amount: number
          user_id: string
        }
        Insert: {
          completed_at?: string | null
          current_progress?: number | null
          expires_at: string
          id?: string
          is_claimed?: boolean | null
          is_completed?: boolean | null
          mission_id: string
          started_at?: string
          target_amount: number
          user_id: string
        }
        Update: {
          completed_at?: string | null
          current_progress?: number | null
          expires_at?: string
          id?: string
          is_claimed?: boolean | null
          is_completed?: boolean | null
          mission_id?: string
          started_at?: string
          target_amount?: number
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_missions_mission_id_fkey"
            columns: ["mission_id"]
            isOneToOne: false
            referencedRelation: "missions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "user_missions_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["user_id"]
          },
        ]
      }
      user_skins: {
        Row: {
          acquired_at: string
          id: string
          is_equipped: boolean | null
          skin_id: string
          user_id: string
        }
        Insert: {
          acquired_at?: string
          id?: string
          is_equipped?: boolean | null
          skin_id: string
          user_id: string
        }
        Update: {
          acquired_at?: string
          id?: string
          is_equipped?: boolean | null
          skin_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_skins_skin_id_fkey"
            columns: ["skin_id"]
            isOneToOne: false
            referencedRelation: "skins"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "user_skins_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["user_id"]
          },
        ]
      }
      user_spin_status: {
        Row: {
          created_at: string
          id: string
          last_free_spin: string | null
          purchased_spins: number
          total_dogecoin_won: number
          total_spins: number
          total_usdt_won: number
          total_zero_won: number
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          last_free_spin?: string | null
          purchased_spins?: number
          total_dogecoin_won?: number
          total_spins?: number
          total_usdt_won?: number
          total_zero_won?: number
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          last_free_spin?: string | null
          purchased_spins?: number
          total_dogecoin_won?: number
          total_spins?: number
          total_usdt_won?: number
          total_zero_won?: number
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      vip_accounts: {
        Row: {
          bonus_click_multiplier: number | null
          bonus_mining_rate: number | null
          bonus_staking_apy: number | null
          created_at: string
          deposit_amount: number
          expires_at: string | null
          id: string
          payeer_account: string | null
          status: string
          tier: string
          transaction_id: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          bonus_click_multiplier?: number | null
          bonus_mining_rate?: number | null
          bonus_staking_apy?: number | null
          created_at?: string
          deposit_amount?: number
          expires_at?: string | null
          id?: string
          payeer_account?: string | null
          status?: string
          tier?: string
          transaction_id?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          bonus_click_multiplier?: number | null
          bonus_mining_rate?: number | null
          bonus_staking_apy?: number | null
          created_at?: string
          deposit_amount?: number
          expires_at?: string | null
          id?: string
          payeer_account?: string | null
          status?: string
          tier?: string
          transaction_id?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      withdrawal_requests: {
        Row: {
          amount: number
          created_at: string
          currency: string
          description: string | null
          id: string
          processed_at: string | null
          status: string
          updated_at: string
          user_id: string
        }
        Insert: {
          amount: number
          created_at?: string
          currency: string
          description?: string | null
          id?: string
          processed_at?: string | null
          status?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          amount?: number
          created_at?: string
          currency?: string
          description?: string | null
          id?: string
          processed_at?: string | null
          status?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      zero_withdrawals: {
        Row: {
          amount: number
          created_at: string
          estimated_completion: string
          id: string
          processing_time_hours: number
          status: string
          updated_at: string
          user_id: string
          wallet_address: string
        }
        Insert: {
          amount: number
          created_at?: string
          estimated_completion: string
          id?: string
          processing_time_hours?: number
          status?: string
          updated_at?: string
          user_id: string
          wallet_address: string
        }
        Update: {
          amount?: number
          created_at?: string
          estimated_completion?: string
          id?: string
          processing_time_hours?: number
          status?: string
          updated_at?: string
          user_id?: string
          wallet_address?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      create_faucet_claim: {
        Args: { p_amount: number; p_user_id: string }
        Returns: Json
      }
      generate_referral_code: {
        Args: Record<PropertyKey, never>
        Returns: string
      }
      get_latest_faucet_claim: {
        Args: { p_user_id: string }
        Returns: {
          amount_claimed: number
          claimed_at: string
          id: string
          next_claim_at: string
          user_id: string
        }[]
      }
      get_public_chat_messages: {
        Args: Record<PropertyKey, never>
        Returns: {
          created_at: string
          id: string
          is_own_message: boolean
          message: string
          username: string
        }[]
      }
      get_referral_stats: {
        Args: { p_user_id: string }
        Returns: Json
      }
      get_total_faucet_claims: {
        Args: { p_user_id: string }
        Returns: number
      }
      increment_deadspot: {
        Args: { amount: number }
        Returns: number
      }
      process_referral: {
        Args: { p_referred_user_id: string; p_referrer_code: string }
        Returns: Json
      }
      update_platform_stat: {
        Args: { increment_value: number; stat_name_param: string }
        Returns: undefined
      }
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
