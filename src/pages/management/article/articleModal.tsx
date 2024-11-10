import { PlusOutlined } from '@ant-design/icons';
import { App, Form, Modal, Input, Radio, Select, DatePicker, Upload } from 'antd';
import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import dayjs from 'dayjs';

import articleAPI from '@/redux/api/services/articleAPI';
import { RootState } from '@/redux/stores/store';
import { Article } from './entity';
import { fetchArticleTypes } from '@/redux/slices/articleTypeSlice';

import type { RcFile, UploadFile, UploadProps } from 'antd/es/upload/interface';

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

   const { articleTypes, loading: articleTypesLoading } = useSelector((state: RootState) => state.articleType);
   const { employeeInfo } = useSelector((state: RootState) => state.employee);

   useEffect(() => {
      dispatch(fetchArticleTypes());
   }, [dispatch]);

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
      <div>
         <PlusOutlined />
         <div style={{ marginTop: 8 }}>Tải ảnh lên</div>
      </div>
   );

   useEffect(() => {
      if (show) {
         form.setFieldsValue({
            ...formValue,
            published_at: formValue.published_at ? dayjs(formValue.published_at) : null,
            is_priority: formValue.is_priority || 0
         });
         
         if (formValue.thumbnail_img) {
            setFileList([{
               uid: '-1',
               name: 'thumbnail.png',
               status: 'done',
               url: formValue.thumbnail_img,
            }]);
         } else {
            setFileList([]);
         }
      } else {
         form.resetFields();
         setFileList([]);
      }
   }, [show, formValue, form]);

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

         const submitData = {
            ...values,
            article_slug: values.article_title
               .toLowerCase()
               .trim()
               .replace(/[^\w\s-]/g, '')
               .replace(/[\s_-]+/g, '-')
               .replace(/^-+|-+$/g, ''),
            employee_id: employeeInfo.employee_id,
            published_at: values.published_at?.format('YYYY-MM-DD HH:mm:ss'),
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
               article_id: formValue.article_id
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
                  { max: 500, message: 'Tiêu đề không được quá 500 ký tự!' }
               ]}
            >
               <Input size="large" placeholder="Nhập tiêu đề bài viết" />
            </Form.Item>

            <Form.Item
               label="Mô tả"
               name="article_description"
            >
               <Input.TextArea 
                  size="large" 
                  placeholder="Nhập mô tả ngắn về bài viết"
                  rows={3}
               />
            </Form.Item>

            <Form.Item
               label="Nội dung"
               name="article_content"
               rules={[
                  { required: true, message: 'Vui lòng nhập nội dung!' }
               ]}
            >
               <Input.TextArea 
                  size="large"
                  placeholder="Nhập nội dung chi tiết bài viết"
                  rows={6}
               />
            </Form.Item>

            <Form.Item
               label="Loại bài viết"
               name="article_type_id"
               rules={[
                  { required: true, message: 'Vui lòng chọn loại bài viết!' }
               ]}
            >
               <Select
                  size="large"
                  placeholder="Chọn loại bài viết"
                  options={articleTypes?.map(type => ({
                     value: type.article_type_id,
                     label: type.article_title
                  }))}
                  loading={articleTypesLoading}
                  disabled={articleTypesLoading}
               />
            </Form.Item>

            <Form.Item
               label="Ngày đăng"
               name="published_at"
            >
               <DatePicker 
                  size="large"
                  showTime
                  format="DD/MM/YYYY HH:mm:ss"
                  placeholder="Chọn ngày đăng bài"
                  style={{ width: '100%' }}
               />
            </Form.Item>

            <Form.Item
               label="Ưu tiên"
               name="is_priority"
               initialValue={0}
            >
               <Radio.Group size="large">
                  <Radio value={1}>Có</Radio>
                  <Radio value={0}>Không</Radio>
               </Radio.Group>
            </Form.Item>

            <Form.Item
               label="Ảnh đại diện"
               required
            >
               <Upload
                  listType="picture-card"
                  fileList={fileList}
                  beforeUpload={() => false}
                  onPreview={handlePreviewUpload}
                  onChange={handleChange}
                  maxCount={1}
                  accept="image/*"
               >
                  {fileList.length >= 1 ? null : uploadButton}
               </Upload>
               <Modal 
                  open={previewOpen} 
                  title={previewTitle} 
                  footer={null} 
                  onCancel={handleCancelUpload}
               >
                  <img 
                     alt="preview" 
                     style={{ width: '100%' }} 
                     src={previewImage} 
                  />
               </Modal>
            </Form.Item>
         </Form>
      </Modal>
   );
}