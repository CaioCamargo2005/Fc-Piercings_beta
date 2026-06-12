/**
 * Tipos gerados manualmente para refletir o schema do banco.
 * Quando o banco estiver criado, você pode gerar isso automaticamente com:
 *   npx supabase gen types typescript --project-id SEU_PROJECT_ID > lib/supabase/database.types.ts
 */

export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export type Database = {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;                    // UUID — mesmo ID do auth.users
          email: string;
          name: string | null;
          phone: string | null;
          cpf: string | null;
          cnpj: string | null;
          account_type: "pessoa_fisica" | "pessoa_juridica";
          role: "customer" | "admin";    // admin inserido manualmente no painel
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id: string;
          email: string;
          name?: string | null;
          phone?: string | null;
          cpf?: string | null;
          cnpj?: string | null;
          account_type?: "pessoa_fisica" | "pessoa_juridica";
          role?: "customer" | "admin";
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          name?: string | null;
          phone?: string | null;
          cpf?: string | null;
          cnpj?: string | null;
          account_type?: "pessoa_fisica" | "pessoa_juridica";
          role?: "customer" | "admin";
          updated_at?: string;
        };
      };

      categories: {
        Row: {
          id: string;
          name: string;                  // ex: "Titânio Natural"
          slug: string;                  // ex: "titanio-natural"
          description: string | null;
          active: boolean;
          sort_order: number;
          created_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          slug: string;
          description?: string | null;
          active?: boolean;
          sort_order?: number;
          created_at?: string;
        };
        Update: {
          name?: string;
          slug?: string;
          description?: string | null;
          active?: boolean;
          sort_order?: number;
        };
      };

      products: {
        Row: {
          id: string;
          name: string;
          slug: string;
          description: string | null;
          price: number;                 // em reais (ex: 99.90)
          original_price: number | null; // preço antes do desconto
          category_id: string;           // FK → categories.id
          subcategory: string | null;
          material: string | null;
          stock: number;
          sizes: string[] | null;        // ex: ["6mm","8mm","10mm"]
          details: string[] | null;      // lista de características
          featured: boolean;
          is_new: boolean;
          on_sale: boolean;
          active: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          slug: string;
          description?: string | null;
          price: number;
          original_price?: number | null;
          category_id: string;
          subcategory?: string | null;
          material?: string | null;
          stock?: number;
          sizes?: string[] | null;
          details?: string[] | null;
          featured?: boolean;
          is_new?: boolean;
          on_sale?: boolean;
          active?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          name?: string;
          slug?: string;
          description?: string | null;
          price?: number;
          original_price?: number | null;
          category_id?: string;
          subcategory?: string | null;
          material?: string | null;
          stock?: number;
          sizes?: string[] | null;
          details?: string[] | null;
          featured?: boolean;
          is_new?: boolean;
          on_sale?: boolean;
          active?: boolean;
          updated_at?: string;
        };
      };

      product_images: {
        Row: {
          id: string;
          product_id: string;            // FK → products.id
          url: string;                   // URL pública no Supabase Storage
          sort_order: number;            // 0 = capa
          created_at: string;
        };
        Insert: {
          id?: string;
          product_id: string;
          url: string;
          sort_order?: number;
          created_at?: string;
        };
        Update: {
          url?: string;
          sort_order?: number;
        };
      };

      addresses: {
        Row: {
          id: string;
          user_id: string;               // FK → profiles.id
          label: string;                 // ex: "Casa", "Trabalho"
          cep: string;
          street: string;
          number: string;
          complement: string | null;
          neighborhood: string;
          city: string;
          state: string;
          is_primary: boolean;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          label?: string;
          cep: string;
          street: string;
          number: string;
          complement?: string | null;
          neighborhood: string;
          city: string;
          state: string;
          is_primary?: boolean;
          created_at?: string;
        };
        Update: {
          label?: string;
          cep?: string;
          street?: string;
          number?: string;
          complement?: string | null;
          neighborhood?: string;
          city?: string;
          state?: string;
          is_primary?: boolean;
        };
      };
    };

    Views: Record<string, never>;
    Functions: Record<string, never>;
    Enums: {
      user_role: "customer" | "admin";
      account_type: "pessoa_fisica" | "pessoa_juridica";
    };
  };
};
