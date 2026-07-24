export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string
          full_name: string | null
          email: string
          avatar_url: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          full_name?: string | null
          email: string
          avatar_url?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          full_name?: string | null
          email?: string
          avatar_url?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      organizations: {
        Row: {
          id: string
          name: string
          slug: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          name: string
          slug: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          name?: string
          slug?: string
          created_at?: string
          updated_at?: string
        }
      }
      organization_members: {
        Row: {
          organization_id: string
          user_id: string
          role: 'owner' | 'admin' | 'member'
          created_at: string
        }
        Insert: {
          organization_id: string
          user_id: string
          role: 'owner' | 'admin' | 'member'
          created_at?: string
        }
        Update: {
          organization_id?: string
          user_id?: string
          role?: 'owner' | 'admin' | 'member'
          created_at?: string
        }
      }
      projects: {
        Row: {
          id: string
          organization_id: string
          name: string
          slug: string
          status: 'active' | 'archived'
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          organization_id: string
          name: string
          slug: string
          status?: 'active' | 'archived'
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          organization_id?: string
          name?: string
          slug?: string
          status?: 'active' | 'archived'
          created_at?: string
          updated_at?: string
        }
      }
      project_members: {
        Row: {
          project_id: string
          user_id: string
          role: 'admin' | 'editor' | 'marketing_manager' | 'viewer'
          created_at: string
        }
        Insert: {
          project_id: string
          user_id: string
          role: 'admin' | 'editor' | 'marketing_manager' | 'viewer'
          created_at?: string
        }
        Update: {
          project_id?: string
          user_id?: string
          role?: 'admin' | 'editor' | 'marketing_manager' | 'viewer'
          created_at?: string
        }
      }
    }
  }
}
