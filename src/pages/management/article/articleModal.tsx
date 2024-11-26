import { PlusOutlined } from '@ant-design/icons';
import { App, Form, Modal, Input, Radio, Select, DatePicker, Upload, Tooltip } from 'antd';
import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import UploadIllustration from '@/components/upload/upload-illustration';
import articleAPI from '@/redux/api/services/articleAPI';
import articleTypeAPI from '@/redux/api/services/articleTypeAPI';
import { RootState } from '@/redux/stores/store';
import { Article } from './entity';
import dayjs from 'dayjs';
// import { fetchArticleTypes } from '@/redux/slices/articleTypeSlice';
import { setArticleTypesSlice } from '@/redux/slices/articleTypeSlice';

import type { RcFile, UploadFile, UploadProps } from 'antd/es/upload/interface';
import { Employee } from '../employee/entity';

export type ArticleModalProps = {
   formValue: Article;
   title: string;
   show: boolean;
   onOk: VoidFunction;
   onCancel: VoidFunction;
   isCreate: boolean;
};

const getBase64 = (file: RcFile): Promise<string> =>
   new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = (error) => reject(error);
   });

export function ArticleModal({ formValue, title, show, onOk, onCancel, isCreate }: ArticleModalProps) {
   const dispatch = useDispatch();
   const [form] = Form.useForm();
   const { notification } = App.useApp();
   const [fileList, setFileList] = useState<UploadFile[]>([]);
   const [previewOpen, setPreviewOpen] = useState(false);
   const [previewImage, setPreviewImage] = useState('');
   const [previewTitle, setPreviewTitle] = useState('');
   const [loading, setLoading] = useState(false);
   const [error, setError] = useState(null);

   const { articleTypes, loading: articleTypesLoading } = useSelector((state: RootState) => state.articleType);
   const { employeeInfo } = useSelector((state: RootState) => state.employee);
   // Selectors
   const currentUser = useSelector((state: RootState) => state.user.userInfo);
   const { employees } = useSelector((state: RootState) => state.employee);
   // Effects
   useEffect(() => {
      if (show && isCreate && currentUser?.userId) {
         form.setFieldValue('voucher_created_by', currentUser.userId);
      }
   }, [show, isCreate, currentUser, form]);

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
   useEffect(() => {
      setLoading(true);
      articleTypeAPI
         .getArticleTypes()
         .then((res: any) => {
            dispatch(setArticleTypesSlice(res.map(transformApiResponseToArticle)));
         })
         .catch((error) => {
            setError(error);
         })
         .finally(() => {
            setLoading(false);
         });
   }, [dispatch]);

   // useEffect(() => {
   //     dispatch(fetchArticleTypes());
   // }, [dispatch]);

   const handleCancelUpload = () => setPreviewOpen(false);

   const handlePreviewUpload = async (file: UploadFile) => {
      if (!file.url && !file.preview) {
         file.preview = await getBase64(file.originFileObj as RcFile);
      }
      setPreviewImage(file.url || (file.preview as string));
      setPreviewOpen(true);
      setPreviewTitle(file.name || file.url!.substring(file.url!.lastIndexOf('/') + 1));
   };

   const handleChange: UploadProps['onChange'] = ({ fileList: newFileList }) => setFileList(newFileList);

   const uploadButton = (
      <Tooltip placement="top" title="Drop or Select file">
         <div className="flex flex-col items-center justify-center p-0 opacity-100 hover:opacity-80">
            <UploadIllustration />
         </div>
      </Tooltip>
   );

   useEffect(() => {
      const loadImages = async () => {
         if (show) {
            form.setFieldsValue(formValue);
            if (formValue.images && formValue.images.length > 0) {
               const newFileList = await Promise.all(
                  formValue.images?.map(async (image, index) => {
                     const isString = typeof image === 'string';
                     if (isString) {
                        try {
                           const response = await fetch(image);
                           const blob = await response.blob();
                           const fileType = blob.type;
                           const fileExtension =
                              fileType === 'image/svg+xml' ? 'svg' : fileType.split('/')[1] || 'unknown';
                           const fileName = `image_upload_${index}.${fileExtension}`;
                           let file;
                           if (fileType === 'image/svg+xml') {
                              file = new File([blob], fileName, { type: fileType });
                           } else {
                              file = new File([blob], fileName, { type: fileType });
                           }
                           return {
                              uid: `${index}`,
                              name: fileName,
                              status: 'done',
                              originFileObj: file,
                           };
                        } catch (error) {
                           console.error(`Lỗi khi tải file: ${error}`);
                           return null;
                        }
                     }
                     return {
                        uid: `${index}`,
                        name: image.name,
                        status: 'done',
                        originFileObj: image,
                     };
                  }),
               );
               setFileList(newFileList as UploadFile[]);
            } else {
               setFileList([]);
            }
         }
      };
      loadImages();
   }, [show, formValue, form, isCreate]);

   const handleOk = async () => {
      try {
         setLoading(true);
         const values = await form.validateFields();
         if (!employeeInfo?.employee_id) {
            notification.error({
               message: 'Lỗi!',
               description: 'Không tìm thấy thông tin nhân viên.',
               duration: 3,
            });
            return;
         }

         // Kiểm tra và chuyển đổi giá trị published_at
         const publishedAt = values.published_at;
         const formattedPublishedAt =
            publishedAt && dayjs.isDayjs(publishedAt) ? publishedAt.format('YYYY-MM-DD HH:mm:ss') : null;

         const submitData = {
            ...values,
            article_slug: values.article_title
               .toLowerCase()
               .trim()
               .replace(/[^\w\s-]/g, '')
               .replace(/[\s_-]+/g, '-')
               .replace(/^-+|-+$/g, ''),
            employee_id: employeeInfo.employee_id,
            published_at: formattedPublishedAt, // Sử dụng giá trị đã được định dạng
            thumbnail_img: fileList[0]?.originFileObj || formValue.thumbnail_img,
         };

         if (isCreate) {
            const res = await articleAPI.createArticle(submitData);
            if (res && (res.status === 201 || res.status === 200)) {
               notification.success({
                  message: 'Thành công!',
                  description: 'Tạo bài viết thành công.',
                  duration: 3,
               });
               onOk();
            }
         } else {
            const res = await articleAPI.updateArticle({
               ...submitData,
               article_id: formValue.article_id,
            });
            if (res && (res.status === 201 || res.status === 200)) {
               notification.success({
                  message: 'Thành công!',
                  description: 'Cập nhật bài viết thành công.',
                  duration: 3,
               });
               onOk();
            }
         }
      } catch (error) {
         console.error('Error:', error);
         notification.error({
            message: 'Có lỗi xảy ra!',
            description: 'Vui lòng kiểm tra lại thông tin.',
            duration: 3,
         });
      } finally {
         setLoading(false);
      }
   };

   const handleCancel = () => {
      form.resetFields();
      setFileList([]);
      onCancel();
   };

   return (
      <Modal
         title={title}
         open={show}
         onOk={handleOk}
         onCancel={handleCancel}
         width="60%"
         centered
         confirmLoading={loading}
         maskClosable={false}
      >
         <Form
            form={form}
            layout="horizontal"
            labelCol={{ span: 4 }}
            wrapperCol={{ span: 18 }}
            style={{ maxHeight: '70vh', overflowY: 'auto' }}
         >
            <Form.Item
               label="Tiêu đề"
               name="article_title"
               rules={[
                  { required: true, message: 'Vui lòng nhập tiêu đề!' },
                  { max: 500, message: 'Tiêu đề không được quá 500 ký tự!' },
               ]}
            >
               <Input size="large" placeholder="Nhập tiêu đề bài viết" />
            </Form.Item>

            <Form.Item label="Mô tả" name="article_description">
               <Input.TextArea size="large" placeholder="Nhập mô tả ngắn về bài viết" rows={3} />
            </Form.Item>

            <Form.Item
               label="Nội dung"
               name="article_content"
               rules={[{ required: true, message: 'Vui lòng nhập nội dung!' }]}
            >
               <Input.TextArea size="large" placeholder="Nhập nội dung chi tiết bài viết" rows={6} />
            </Form.Item>

            <Form.Item
               label="Loại bài viết"
               name="article_type_id"
               rules={[{ required: true, message: 'Vui lòng chọn loại bài viết!' }]}
            >
               <Select
                  size="large"
                  placeholder="Chọn loại bài viết"
                  options={articleTypes?.map((type) => ({
                     value: type.article_type_id,
                     label: type.article_title,
                  }))}
                  loading={articleTypesLoading}
                  disabled={articleTypesLoading}
               />
            </Form.Item>
            <Form.Item
               label="Creator"
               name="voucher_created_by"
               rules={[{ required: true, message: 'Please select a creator!' }]}
               initialValue={currentUser?.userId}
            >
               <Select
                  showSearch
                  placeholder="Select employee"
                  optionFilterProp="children"
                  loading={loading}
                  disabled
                  // disabled={!isCreate}
                  filterOption={(input, option) => (option?.label ?? '').toLowerCase().includes(input.toLowerCase())}
                  options={employees?.map((emp: Employee) => ({
                     value: emp.employee_id,
                     label: emp.employee_full_name, // Ensure no extra quotes
                  }))}
               />
            </Form.Item>
            <Form.Item label="Ngày đăng" name="published_at">
               <DatePicker
                  size="large"
                  showTime
                  format="DD/MM/YYYY HH:mm:ss"
                  placeholder="Chọn ngày đăng bài"
                  style={{ width: '100%' }}
               />
            </Form.Item>

            <Form.Item label="Ưu tiên" name="is_priority" initialValue={0}>
               <Radio.Group size="large">
                  <Radio value={1}>Có</Radio>
                  <Radio value={0}>Không</Radio>
               </Radio.Group>
            </Form.Item>

            <Form.Item<Article> label="Image">
               <Upload
                  style={{ flex: 1 }}
                  listType="picture-card"
                  fileList={fileList}
                  multiple
                  beforeUpload={() => false}
                  onPreview={handlePreviewUpload}
                  onChange={handleChange}
                  maxCount={8}
                  progress={{
                     strokeColor: {
                        '0%': '#108ee9',
                        '100%': '#87d068',
                     },
                  }}
               >
                  {fileList.length >= 8 ? null : uploadButton}
               </Upload>
               <Modal open={previewOpen} title={previewTitle} footer={null} onCancel={handleCancelUpload}>
                  <img alt="example" style={{ width: '100%' }} src={previewImage} />
               </Modal>
            </Form.Item>
         </Form>
      </Modal>
   );
}
