import { Button, Card, Spin, Popconfirm, Image, Empty, Avatar, Tooltip, InputRef, TableColumnType, App } from 'antd';
import { Space, Input, Alert } from 'antd/lib';
import Table, { ColumnsType } from 'antd/es/table';
import { useRef, useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import dayjs from 'dayjs';
import type { FilterDropdownProps } from 'antd/es/table/interface';
import { useCopyToClipboard } from '@/hooks/event/use-copy-to-clipboard';
import { IconButton, Iconify } from '@/components/icon';
import articleAPI from '@/redux/api/services/articleAPI';
import Highlighter from 'react-highlight-words';
import getArticles from '@api/articleAPI';
import ProTag from '@/theme/antd/components/tag';
import { createStyles } from 'antd-style';
import { Article } from './entity';
import { ArticleModal, ArticleModalProps } from './articleModal';
import { setArticlesSlice } from '@/redux/slices/articleSlice';
import { RootState } from '@/redux/stores/store';
import { SearchOutlined } from '@ant-design/icons';
const formatDateTime = (value?: string): string => {
   if (!value) return '';
   return dayjs(value).format('DD/MM/YYYY HH:mm');
};
const useStyle = createStyles(({ css }) => ({
   customTable: css`
      .ant-table {
         .ant-table-container {
            .ant-table-body,
            .ant-table-content {
               scrollbar-width: thin;
               scrollbar-color: #939393 transparent;
               scrollbar-gutter: stable;
            }
         }
      }
   `,
}));
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
      // images: apiResponse?.article_to_imageArticle.map((image: any) => image.image_article_url),
   };
}
type DataIndex = keyof Article;
function CopyButton({ value }: { value: string }) {
   const { copyFn } = useCopyToClipboard();
   return (
      <Tooltip title="Copy">
         <IconButton className="text-gray" onClick={() => copyFn(value)}>
            <Iconify icon="eva:copy-fill" size={20} />
         </IconButton>
      </Tooltip>
   );
}

export default function ArticlePage() {
   const dispatch = useDispatch();
   const [loading, setLoading] = useState(true);
   const [error, setError] = useState(null);
   const [articles, setArticles] = useState<Article[]>([]);

   const searchInput = useRef<InputRef>(null);
   const [searchText, setSearchText] = useState('');
   const [searchedColumn, setSearchedColumn] = useState('');
   const { notification } = App.useApp();
   const handleSearch = (selectedKeys: string[], confirm: FilterDropdownProps['confirm'], dataIndex: DataIndex) => {
      confirm();
      setSearchText(selectedKeys[0]);
      setSearchedColumn(dataIndex);
   };
   const handleReset = (clearFilters: () => void) => {
      clearFilters();
      setSearchText('');
   };

   const getColumnSearchProps = (dataIndex: DataIndex): TableColumnType<Article> => ({
      // eslint-disable-next-line react/no-unstable-nested-components
      filterDropdown: ({ setSelectedKeys, selectedKeys, confirm, clearFilters, close }) => (
         <div style={{ padding: 8 }} onKeyDown={(e) => e.stopPropagation()}>
            <Input
               ref={searchInput}
               placeholder={`Search ${dataIndex}`}
               value={selectedKeys[0]}
               onChange={(e) => setSelectedKeys(e.target.value ? [e.target.value] : [])}
               onPressEnter={() => handleSearch(selectedKeys as string[], confirm, dataIndex)}
               style={{ marginBottom: 8, display: 'block' }}
            />
            <Space>
               <Button
                  type="primary"
                  onClick={() => handleSearch(selectedKeys as string[], confirm, dataIndex)}
                  icon={<SearchOutlined />}
                  size="small"
                  style={{ width: 90 }}
               >
                  Search
               </Button>
               <Button onClick={() => clearFilters && handleReset(clearFilters)} size="small" style={{ width: 90 }}>
                  Reset
               </Button>
               <Button
                  type="link"
                  size="small"
                  onClick={() => {
                     confirm({ closeDropdown: false });
                     setSearchText((selectedKeys as string[])[0]);
                     setSearchedColumn(dataIndex);
                  }}
               >
                  Filter
               </Button>
               <Button
                  type="link"
                  size="small"
                  onClick={() => {
                     close();
                  }}
               >
                  close
               </Button>
            </Space>
         </div>
      ),
      // eslint-disable-next-line react/no-unstable-nested-components
      filterIcon: (filtered: boolean) => <SearchOutlined style={{ color: filtered ? '#1677ff' : undefined }} />,
      onFilter: (value, record) => {
         const text = record[dataIndex]?.toString().toLowerCase();
         return text ? text.includes((value as string).toLowerCase()) : false;
      },
      onFilterDropdownOpenChange: (visible) => {
         if (visible) {
            setTimeout(() => searchInput.current?.select(), 100);
         }
      },
      render: (text) =>
         searchedColumn === dataIndex ? (
            <Highlighter
               highlightStyle={{ backgroundColor: '#ffc069', padding: 0 }}
               searchWords={[searchText]}
               autoEscape
               textToHighlight={text ? text.toString() : ''}
            />
         ) : (
            text
         ),
   });

   useEffect(() => {
      setLoading(true);
      getArticles
         .getArticles()
         .then((res: any) => {
            dispatch(setArticlesSlice(res.map(transformApiResponseToArticle)));
         })
         .catch((error) => {
            setError(error);
         })
         .finally(() => {
            setLoading(false);
         });
   }, [dispatch]);

   const refreshData = async () => {
      try {
         const res = await getArticles.getArticles();
         dispatch(setArticlesSlice(res.map(transformApiResponseToArticle)));
      } catch (error) {
         setError(error);
      }
   };
   const { styles } = useStyle();
   const [loadingDelete, setLoadingDelete] = useState(false);

   const articlesSlice = useSelector((state: RootState) => state.article.articles);

   const handleDelete = (image_article_id: number) => {
      setLoadingDelete(true);
      getArticles
         .deleteArticle(image_article_id.toString())
         .then((res) => {
            if (res && res.status === 200) {
               refreshData();
               notification.success({
                  message: `Delete Office Success by Id ${image_article_id} !`,
                  duration: 3,
               });
            }
            if (res && (res.status === 400 || res.error === true)) {
               notification.error({
                  message: `Delete Article Failed by Id ${image_article_id} !`,
                  duration: 3,
                  description: res.message,
               });
            }
         })
         .catch((error) => {
            notification.error({
               message: `Delete Office Failed by Id ${image_article_id} !`,
               duration: 3,
               description: error.message,
            });
         })
         .finally(() => {
            setLoadingDelete(false);
         });
   };

   // useEffect(() => {
   //    articleAPI
   //       .getArticles()
   //       .then((res: any) => {
   //          setArticles(res.data?.metadata?.articles.map(transformApiResponseToArticle));
   //          setLoading(false);
   //          console.log(res.data?.metadata?.articles);
   //       })
   //       .catch((error) => {
   //          setError(error);
   //          setLoading(false);
   //       });
   // }, []);

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
         title: 'Title',
         dataIndex: 'article_title',
         ...getColumnSearchProps('article_title'),
         fixed: 'left',
         sorter: (a, b) => a.article_title.localeCompare(b.article_title),
         ellipsis: {
            showTitle: false,
         },
         render: (article_title) => (
            <Tooltip placement="topLeft" title={article_title}>
               {article_title}
            </Tooltip>
         ),
      },
      {
         title: 'Images',
         dataIndex: 'images',
         align: 'center',
         render: (images) =>
            images && images.length > 0 ? (
               <Avatar.Group max={{ count: 3 }} size="large" style={{ display: 'flex', justifyContent: 'center' }}>
                  {images.map((image: string, index: number) => (
                     <Avatar key={index} src={image} alt={`Office Image ${index + 1}`} />
                  ))}
               </Avatar.Group>
            ) : (
               <Empty style={{ margin: 0 }} imageStyle={{ height: 30 }} image={Empty.PRESENTED_IMAGE_SIMPLE} />
            ),
         fixed: 'left',
         width: 150,
      },
      {
         title: 'Article Type',
         dataIndex: ['article_belongto_articleType', 'article_title'],
         width: 150,
      },
      {
         title: 'Field',
         dataIndex: ['article_belongto_articleType', 'article_field'],
         width: 150,
      },
      {
         title: 'Creator',
         dataIndex: ['article_belongto_employee', 'employee_full_name'],
         width: 150,
      },
      {
         title: 'Priority',
         dataIndex: 'is_priority',
         width: 100,
         filters: [
            {
               text: 'Yes',
               value: 1,
            },
            {
               text: 'No',
               value: 0,
            },
         ],
         onFilter: (value, record) => record.is_priority === value,
         render: (priority) => (
            <ProTag color={priority === 1 ? 'success' : 'default'}>{priority === 1 ? 'Yes' : 'No'}</ProTag>
         ),
      },
      {
         title: 'Published Date',
         dataIndex: 'published_at',
         width: 150,
         render: (date) => (date ? formatDateTime(date) : 'Not Published'),
      },
      {
         title: 'Actions',
         key: 'operation',
         fixed: 'right',
         width: 120,
         render: (_, record) => (
            <div className="flex w-full justify-center gap-2">
               <IconButton onClick={() => onEdit(record)}>
                  <Iconify icon="solar:pen-bold-duotone" size={18} />
               </IconButton>
               <Popconfirm
                  title="Delete article?"
                  description="Are you sure you want to delete this article?"
                  okText="Delete"
                  cancelText="Cancel"
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
   const onCreate = () => {
      setArticleModalProps((prev) => ({
         ...prev,
         show: true,
         title: 'Create New',
         isCreate: true,
         formValue: {
            ...prev.formValue,
            ...DEFAULT_ARTICLE_VALUE,
         },
      }));
   };

   const onEdit = (formValue: Article) => {
      setArticleModalProps((prev) => ({
         ...prev,
         show: true,
         title: 'Edit',
         isCreate: false,
         formValue,
      }));
   };

  const expandColumns: ColumnsType<Article> = [
      {
         title: 'Lock Status',
         align: 'center',
         key: 'lockStatus',
         render: (_, record) => {
            const { is_priority } = record;
            return (
               <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexDirection: 'column' }}>
                  {is_priority === 1 ? (
                     <>
                        <Iconify icon="fxemoji:lock" size={30} />
                        <Text mark style={{ color: 'red' }}>Yes</Text>
                     </>
                  ) : (
                     <Text mark style={{ color: 'green' }}>No</Text> // Chỉ hiển thị "Unlocked"
                  )}
               </div>
            );
         },
      }
   ];
   const renderExpandedRow = (record: Article) => (
      <div>
         {/* <Alert message="Description" description={record.article_description} type="info" /> */}
         <Table<Article> columns={expandColumns} dataSource={[record]} pagination={false} />
      </div>
   );
   const content = (
      <Table
         className={styles.customTable}
         rowKey={(record) => record.article_id.toString()}
         style={{ width: '100%', flex: 1 }}
         size="small"
         scroll={{ y: 'calc(100vh - 300px)' }}
         pagination={{
            size: 'default',
            total: articles?.length || 0,
            showSizeChanger: true,
            showQuickJumper: true,
            showTotal: (total) => `Total ${total} items`,
            onChange: (page, pageSize) => {
               console.log('Current Page:', page, 'Page Size:', pageSize);
            },
         }}
         columns={columns as ColumnsType<Article>}
         expandable={{ expandedRowRender: renderExpandedRow, defaultExpandedRowKeys: ['0'] }}
         dataSource={error ? [] : articlesSlice || []}
         loading={loading}
      />
   );

   return (
      <Card
         style={{ maxHeight: '100%', minHeight: '100%', display: 'flex', flexDirection: 'column' }}
         styles={{ body: { padding: '0', flex: 1, display: 'flex', flexDirection: 'column' } }}
         title="Article List"
         extra={
            <Button type="primary" onClick={onCreate}>
               New
            </Button>
         }
      >
         <Spin spinning={loadingDelete} tip="Deleting..." size="large" fullscreen>
            {loadingDelete && content}
         </Spin>
         {content}
         <ArticleModal {...articleModalProps} />
      </Card>
   );
}
