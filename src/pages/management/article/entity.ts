export interface Article {
   article_id: number;
   article_title: string;
   article_description?: string;
   article_content: string;
   article_slug: string;
   published_at?: string;
   is_priority?: 0 | 1;
   article_type_id: number;
   employee_id: number;
   thumbnail_img?: string;
   thumbnail_img_public_id?: string;
   created_at?: string;
   updated_at?: string;
   // Relationships
   article_belongto_employee?: {
      employee_id: number;
      employee_full_name: string;
      employee_email: string;
      employee_phone?: string;
   };
   article_belongto_articleType?: {
      article_type_id: number;
      article_title: string;
      article_field?: string;
      is_highlight?: 0 | 1;
   };
   article_to_imageArticle?: {
      image_article_id: number;
      image_url: string;
      public_id?: string;
      article_id: number;
   }[];
   article_to_tag?: {
      tag_id: number;
      tag_name: string;
      tag_description?: string;
   }[];
   images?: File[];
}