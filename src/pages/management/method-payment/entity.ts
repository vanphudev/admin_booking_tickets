export interface PaymentMethod {
   payment_method_id?: number;
   payment_method_code: string;
   payment_method_name: string;
   payment_method_avatar_url?: string;
   payment_method_avatar_public_id?: string;
   is_locked: number;
   last_lock_at?: string;
   payment_method_description?: string;
   payment_type_id?: number;
   created_at?: string;
   updated_at?: string;
}
