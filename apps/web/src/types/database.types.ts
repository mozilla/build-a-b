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
    PostgrestVersion: "13.0.5"
  }
  public: {
    Tables: {
      avatars: {
        Row: {
          asset_instagram: string | null
          asset_landscape: string | null
          asset_riding: string | null
          asset_share: string | null
          asset_standing: string | null
          asset_stories: string | null
          character_story: string | null
          combination_key: string | null
          core_drive: string | null
          created_at: string
          first_name: string | null
          id: number
          last_name: string | null
          legacy_plan: string | null
          meta_data: Json | null
          name: string | null
          origin_story: string | null
          parsed_successfully: boolean | null
          pose: string | null
          power_play: string | null
          public_persona: string | null
          seed: number | null
          updated_at: string | null
          uploaded_at: string | null
        }
        Insert: {
          asset_instagram?: string | null
          asset_landscape?: string | null
          asset_riding?: string | null
          asset_share?: string | null
          asset_standing?: string | null
          asset_stories?: string | null
          character_story?: string | null
          combination_key?: string | null
          core_drive?: string | null
          created_at?: string
          first_name?: string | null
          id?: number
          last_name?: string | null
          legacy_plan?: string | null
          meta_data?: Json | null
          name?: string | null
          origin_story?: string | null
          parsed_successfully?: boolean | null
          pose?: string | null
          power_play?: string | null
          public_persona?: string | null
          seed?: number | null
          updated_at?: string | null
          uploaded_at?: string | null
        }
        Update: {
          asset_instagram?: string | null
          asset_landscape?: string | null
          asset_riding?: string | null
          asset_share?: string | null
          asset_standing?: string | null
          asset_stories?: string | null
          character_story?: string | null
          combination_key?: string | null
          core_drive?: string | null
          created_at?: string
          first_name?: string | null
          id?: number
          last_name?: string | null
          legacy_plan?: string | null
          meta_data?: Json | null
          name?: string | null
          origin_story?: string | null
          parsed_successfully?: boolean | null
          pose?: string | null
          power_play?: string | null
          public_persona?: string | null
          seed?: number | null
          updated_at?: string | null
          uploaded_at?: string | null
        }
        Relationships: []
      }
      selfies: {
        Row: {
          asset: string | null
          avatar_id: number | null
          created_at: string
          id: number
          user_id: number | null
        }
        Insert: {
          asset?: string | null
          avatar_id?: number | null
          created_at?: string
          id?: number
          user_id?: number | null
        }
        Update: {
          asset?: string | null
          avatar_id?: number | null
          created_at?: string
          id?: number
          user_id?: number | null
        }
        Relationships: []
      }
      tiktok: {
        Row: {
          asset: string | null
          avatar_id: number | null
          created_at: string
          id: number
          user_id: number | null
        }
        Insert: {
          asset?: string | null
          avatar_id?: number | null
          created_at?: string
          id?: number
          user_id?: number | null
        }
        Update: {
          asset?: string | null
          avatar_id?: number | null
          created_at?: string
          id?: number
          user_id?: number | null
        }
        Relationships: []
      }
      users: {
        Row: {
          avatar_id: number
          created_at: string
          id: number
          uuid: string
        }
        Insert: {
          avatar_id: number
          created_at?: string
          id?: number
          uuid?: string
        }
        Update: {
          avatar_id?: number
          created_at?: string
          id?: number
          uuid?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      get_random_avatar: {
        Args: { search_pattern: string }
        Returns: {
          asset_riding: string
          character_story: string
          combination_key: string
          first_name: string
          id: number
          last_name: string
        }[]
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
