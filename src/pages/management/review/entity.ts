export interface Review {
   review_id: number;
   review_rating: string;
   review_date?: string;
   review_comment?: string;
   is_locked?: 0 | 1;
   last_lock_at?: string | null;
   route_id?: number;
   customer_id?: number;
   createdAt?: string;
   updatedAt?: string;
   review_belongto_route?: {
      route_id?: number;
      route_name: string;
      route_duration?: number;
      route_distance?: number;
      route_url_gps: string;
      route_price?: number;
      origin_office_id?: number;
      destination_office_id?: number;
      is_default: 0 | 1;
      is_locked?: 0 | 1;
      last_lock_at?: string | null;
      way_id: string;
   };
   review_belongto_customer?: {
      customer_id?: number;
      customer_full_name: string;
      customer_phone?: string;
      customer_email?: string;
      customer_gender: 0 | 1;
      customer_birthday?: string;
      customer_avatar_url?: string;
      customer_avatar_public_id?: string;
      customer_destination_address: string;
      customer_password?: string;
      is_disabled?: 0 | 1;
      last_login_at: string;
      customer_type_id: number;
   };
   review_to_reviewImage?: {
      review_image_id?: number;
      review_id?: number;
      review_image_url?: string;
      review_image_public_id?: string;
   };
   images?: File[];
}
