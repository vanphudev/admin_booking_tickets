import { Article } from '@/pages/management/article/entity';
import apiClient from '../apiClient';

export enum ArticleApi {
   GetArticles = 'private/article/getall',
   CreateArticle = 'private/article/create',
   UpdateArticle = 'private/article/update',
   DeleteArticle = 'private/articleimage/delete',
   UploadImage = 'private/articleimage/create/',
}

const getArticles = (): Promise<any> => {
   return apiClient
      .get({ url: ArticleApi.GetArticles })
      .then((res: any) => {
         if (res) {
            return res.data?.metadata?.articles;
         }
         return null;
      })
      .catch((error) => {
         console.log('Lỗi getArticles', error);
         return error;
      });
};

const createArticle = (data: Article): Promise<any> => {
   return apiClient
      .post({ url: ArticleApi.CreateArticle, data })
      .then((res: any) => {
         if (res && (res.status === 201 || res.status === 200)) {
            const id = res.data.metadata?.article.article_id;
            const articleTitle = res.data.metadata?.article.article_title;
            if (data.images && data.images.length > 0) {
               const formData = new FormData();
               const images = data.images.filter(
                  (image) => typeof image === 'object' && image instanceof File,
               ) as File[];
               images.forEach((image: File) => {
                  formData.append('images', image);
               });
               formData.append('articleTitle', articleTitle);
               formData.append('articleId', id);
               apiClient
                  .post({
                     url: `${ArticleApi.UploadImage}${id}`,
                     data: formData,
                     headers: { 'Content-Type': 'multipart/form-data' },
                  })
                  .then((res: any) => {
                     return res;
                  })
                  .catch((error) => {
                     console.error('Error uploading images', error);
                     return error;
                  });
            }
            return res;
         }
         return res;
      })
      .catch((error) => {
         return error;
      });
};

const updateArticle = (data: Article): Promise<any> => {
   return apiClient
      .put({ url: ArticleApi.UpdateArticle, data })
      .then((res: any) => {
         return res;
      })
      .catch((error) => {
         return error;
      });
};

const deleteArticle = (image_article_id: string): Promise<any> => {
   return apiClient
      .delete({ url: `${ArticleApi.DeleteArticle}/${image_article_id}` })
      .then((res: any) => {
         return res;
      })
      .catch((error) => {
         return error;
      });
};

const uploadImage = (id: string, file: File): Promise<any> => {
   const formData = new FormData();
   formData.append('image', file);
   return apiClient
      .post({
         url: `${ArticleApi.UploadImage}${id}`,
         data: formData,
         headers: { 'Content-Type': 'multipart/form-data' },
      })
      .then((res: any) => {
         return res;
      })
      .catch((error) => {
         return error;
      });
};

export default {
   getArticles,
   createArticle,
   updateArticle,
   deleteArticle,
   uploadImage,
};