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
      bookings: {
        Row: {
          created_at: string
          id: string
          passenger_id: string
          payment_method: string | null
          payment_status: string
          seats_booked: number
          status: string
          total_price: number
          trip_id: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          id?: string
          passenger_id: string
          payment_method?: string | null
          payment_status?: string
          seats_booked: number
          status?: string
          total_price: number
          trip_id: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          id?: string
          passenger_id?: string
          payment_method?: string | null
          payment_status?: string
          seats_booked?: number
          status?: string
          total_price?: number
          trip_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "bookings_trip_id_fkey"
            columns: ["trip_id"]
            isOneToOne: false
            referencedRelation: "trips"
            referencedColumns: ["id"]
          },
        ]
      }
      identity_verification: {
        Row: {
          created_at: string
          document_type: string
          document_url: string
          id: string
          rejection_reason: string | null
          selfie_url: string | null
          status: string | null
          updated_at: string
          user_id: string
          verified_at: string | null
        }
        Insert: {
          created_at?: string
          document_type: string
          document_url: string
          id?: string
          rejection_reason?: string | null
          selfie_url?: string | null
          status?: string | null
          updated_at?: string
          user_id: string
          verified_at?: string | null
        }
        Update: {
          created_at?: string
          document_type?: string
          document_url?: string
          id?: string
          rejection_reason?: string | null
          selfie_url?: string | null
          status?: string | null
          updated_at?: string
          user_id?: string
          verified_at?: string | null
        }
        Relationships: []
      }
      messages: {
        Row: {
          booking_id: string
          content: string
          created_at: string
          id: string
          read_at: string | null
          sender_id: string
        }
        Insert: {
          booking_id: string
          content: string
          created_at?: string
          id?: string
          read_at?: string | null
          sender_id: string
        }
        Update: {
          booking_id?: string
          content?: string
          created_at?: string
          id?: string
          read_at?: string | null
          sender_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "messages_booking_id_fkey"
            columns: ["booking_id"]
            isOneToOne: false
            referencedRelation: "bookings"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          created_at: string
          full_name: string
          id: string
          is_admin: boolean | null
          phone: string | null
          photo_url: string | null
          rating: number | null
          total_trips: number | null
          updated_at: string
          user_id: string
          verified: boolean | null
        }
        Insert: {
          created_at?: string
          full_name: string
          id?: string
          is_admin?: boolean | null
          phone?: string | null
          photo_url?: string | null
          rating?: number | null
          total_trips?: number | null
          updated_at?: string
          user_id: string
          verified?: boolean | null
        }
        Update: {
          created_at?: string
          full_name?: string
          id?: string
          is_admin?: boolean | null
          phone?: string | null
          photo_url?: string | null
          rating?: number | null
          total_trips?: number | null
          updated_at?: string
          user_id?: string
          verified?: boolean | null
        }
        Relationships: []
      }
      ratings: {
        Row: {
          booking_id: string
          comment: string | null
          created_at: string
          id: string
          rated_user_id: string
          rater_id: string
          rating: number
        }
        Insert: {
          booking_id: string
          comment?: string | null
          created_at?: string
          id?: string
          rated_user_id: string
          rater_id: string
          rating: number
        }
        Update: {
          booking_id?: string
          comment?: string | null
          created_at?: string
          id?: string
          rated_user_id?: string
          rater_id?: string
          rating?: number
        }
        Relationships: [
          {
            foreignKeyName: "ratings_booking_id_fkey"
            columns: ["booking_id"]
            isOneToOne: false
            referencedRelation: "bookings"
            referencedColumns: ["id"]
          },
        ]
      }
      trips: {
        Row: {
          available_seats: number
          created_at: string
          departure: string
          departure_time: string
          description: string | null
          destination: string
          driver_id: string
          id: string
          price_per_seat: number
          status: string
          updated_at: string
          vehicle_color: string | null
          vehicle_model: string
          vehicle_plate: string | null
        }
        Insert: {
          available_seats: number
          created_at?: string
          departure: string
          departure_time: string
          description?: string | null
          destination: string
          driver_id: string
          id?: string
          price_per_seat: number
          status?: string
          updated_at?: string
          vehicle_color?: string | null
          vehicle_model: string
          vehicle_plate?: string | null
        }
        Update: {
          available_seats?: number
          created_at?: string
          departure?: string
          departure_time?: string
          description?: string | null
          destination?: string
          driver_id?: string
          id?: string
          price_per_seat?: number
          status?: string
          updated_at?: string
          vehicle_color?: string | null
          vehicle_model?: string
          vehicle_plate?: string | null
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      is_admin: { Args: { _user_id: string }; Returns: boolean }
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
