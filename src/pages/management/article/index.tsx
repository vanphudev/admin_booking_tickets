import { Button, Card, Popconfirm, Image } from 'antd';
import Table, { ColumnsType } from 'antd/es/table';
import { useState, useEffect } from 'react';
import { useDispatch } from 'react-redux';
import dayjs from 'dayjs';

import { IconButton, Iconify } from '@/components/icon';
import articleAPI from '@/redux/api/services/articleAPI';
import { fetchArticleTypes } from '@/redux/slices/articleTypeSlice';
import ProTag from '@/theme/antd/components/tag';

import { Article } from './entity';
import { ArticleModal, ArticleModalProps } from './articleModal';

const formatDateTime = (value?: string): string => {
   if (!value) return '';
   return dayjs(value).format('DD/MM/YYYY HH:mm');
};

const DEFAULT_ARTICLE_VALUE: Article = {
   article_id: 0,
   article_title: '',
   article_description: '',
   article_content: '',
   article_slug: '',
   article_type_id: 0,
   employee_id: 0,
   thumbnail_img: '',
   is_priority: 0,
   published_at: '',
   created_at: '',
   updated_at: '',
   article_belongto_articleType: {
      article_type_id: 0,
      article_title: '',
      article_field: '',
      is_highlight: 0,
   },
   article_belongto_employee: {
      employee_id: 0,
      employee_full_name: '',
      employee_email: '',
      employee_phone: '',
   },
};

function transformApiResponseToArticle(apiResponse: any): Article {
   return {
      article_id: apiResponse.article_id,
      article_title: apiResponse.article_title,
      article_description: apiResponse.article_description,
      article_content: apiResponse.article_content,
      article_slug: apiResponse.article_slug,
      article_type_id: apiResponse.article_type_id,
      employee_id: apiResponse.employee_id,
      thumbnail_img: apiResponse.thumbnail_img,
      is_priority: apiResponse.is_priority,
      published_at: apiResponse.published_at,
      created_at: apiResponse.created_at,
      updated_at: apiResponse.updated_at,
      article_belongto_articleType: {
         article_type_id: apiResponse.article_belongto_articleType?.article_type_id,
         article_title: apiResponse.article_belongto_articleType?.article_title,
         article_field: apiResponse.article_belongto_articleType?.article_field,
         is_highlight: apiResponse.article_belongto_articleType?.is_highlight || 0,
      },
      article_belongto_employee: {
         employee_id: apiResponse.article_belongto_employee?.employee_id,
         employee_full_name: apiResponse.article_belongto_employee?.employee_full_name,
         employee_email: apiResponse.article_belongto_employee?.employee_email,
         employee_phone: apiResponse.article_belongto_employee?.employee_phone,
      },
   };
}

export default function ArticlePage() {
   const dispatch = useDispatch();
   const [loading, setLoading] = useState(true);
   const [error, setError] = useState(null);
   const [articles, setArticles] = useState<Article[]>([]);

   useEffect(() => {
      dispatch(fetchArticleTypes());
   }, [dispatch]);

   useEffect(() => {
      articleAPI
         .getArticles()
         .then((res: any) => {
            setArticles(res.data?.metadata?.articles.map(transformApiResponseToArticle));
            setLoading(false);
            console.log(res.data?.metadata?.articles);
         })
         .catch((error) => {
            setError(error);
            setLoading(false);
         });
   }, []);

   const [articleModalProps, setArticleModalProps] = useState<ArticleModalProps>({
      formValue: DEFAULT_ARTICLE_VALUE,
      title: 'Bài viết mới',
      show: false,
      isCreate: true,
      onOk: () => {
         setArticleModalProps((prev) => ({ ...prev, show: false }));
      },
      onCancel: () => {
         setArticleModalProps((prev) => ({ ...prev, show: false }));
      },
   });

   const columns: ColumnsType<Article> = [
      {
         title: 'Tiêu đề',
         dataIndex: 'article_title',
         fixed: 'left',
         width: 300,
      },
      {
         title: 'Ảnh',
         dataIndex: 'thumbnail_img',
         width: 120,
         render: (thumbnail) =>
            thumbnail ? (
               <Image src={thumbnail} alt="Thumbnail" style={{ width: 100, height: 60, objectFit: 'cover' }} />
            ) : (
               <ProTag color="default">Không có ảnh</ProTag>
            ),
      },
      {
         title: 'Loại bài viết',
         dataIndex: ['article_belongto_articleType', 'article_title'],
         width: 150,
      },
      {
         title: 'Lĩnh vực',
         dataIndex: ['article_belongto_articleType', 'article_field'],
         width: 150,
      },
      {
         title: 'Người tạo',
         dataIndex: ['article_belongto_employee', 'employee_full_name'],
         width: 150,
      },
      {
         title: 'Ưu tiên',
         dataIndex: 'is_priority',
         width: 100,
         render: (priority) => (
            <ProTag color={priority === 1 ? 'success' : 'default'}>{priority === 1 ? 'Có' : 'Không'}</ProTag>
         ),
      },
      {
         title: 'Ngày đăng',
         dataIndex: 'published_at',
         width: 150,
         render: (date) => (date ? formatDateTime(date) : 'Chưa đăng'),
      },
      {
         title: 'Ngày tạo',
         dataIndex: 'created_at',
         width: 150,
         render: (date) => formatDateTime(date),
      },
      {
         title: 'Ngày cập nhật',
         dataIndex: 'updated_at',
         width: 150,
         render: (date) => formatDateTime(date),
      },
      {
         title: 'Thao tác',
         key: 'operation',
         fixed: 'right',
         width: 120,
         render: (_, record) => (
            <div className="flex w-full justify-center gap-2">
               <IconButton onClick={() => onEdit(record)}>
                  <Iconify icon="solar:pen-bold-duotone" size={18} />
               </IconButton>
               <Popconfirm
                  title="Xóa bài viết?"
                  description="Bạn có chắc chắn muốn xóa bài viết này?"
                  okText="Xóa"
                  cancelText="Hủy"
                  placement="left"
                  onConfirm={() => handleDelete(record.article_id)}
               >
                  <IconButton>
                     <Iconify icon="mingcute:delete-2-fill" size={18} className="text-error" />
                  </IconButton>
               </Popconfirm>
            </div>
         ),
      },
   ];

   const handleDelete = async (id: number) => {
      try {
         setLoading(true);
         await articleAPI.deleteArticle(id);
         setArticles(articles.filter((article) => article.article_id !== id));
      } catch (error) {
         console.error('Lỗi khi xóa bài viết:', error);
      } finally {
         setLoading(false);
      }
   };

   const onCreate = () => {
      setArticleModalProps((prev) => ({
         ...prev,
         show: true,
         title: 'Tạo bài viết mới',
         isCreate: true,
         formValue: DEFAULT_ARTICLE_VALUE,
      }));
   };

   const onEdit = (formValue: Article) => {
      setArticleModalProps((prev) => ({
         ...prev,
         show: true,
         title: 'Chỉnh sửa bài viết',
         isCreate: false,
         formValue,
      }));
   };

   return (
      <Card
         title="Danh sách bài viết"
         extra={
            <Button type="primary" onClick={onCreate}>
               Thêm mới
            </Button>
         }
      >
         <Table
            rowKey="article_id"
            size="small"
            scroll={{ x: 'max-content' }}
            pagination={{
               size: 'default',
               total: articles?.length || 0,
               showSizeChanger: true,
               showQuickJumper: true,
               showTotal: (total) => `Tổng ${total} bài viết`,
            }}
            columns={columns}
            dataSource={error ? [] : articles}
            loading={loading}
         />
         <ArticleModal {...articleModalProps} />
      </Card>
   );
}
