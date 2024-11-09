import { PlusOutlined } from '@ant-design/icons';
import { App, Form, Modal, Input, Radio, Select, Upload } from 'antd';
import type { RcFile, UploadFile, UploadProps } from 'antd/es/upload/interface';
import { useEffect, useState } from 'react';

import { PaymentMethod } from './entity';
import paymentMethodAPI from '@/redux/api/services/paymentMethodAPI';

interface PaymentType {
   payment_type_id: number;
   payment_type_name: string;
}

interface PaymentMethodModalProps {
   formValue: PaymentMethod;
   title: string;
   show: boolean;
   onOk: VoidFunction;
   onCancel: VoidFunction;
   isCreate: boolean;
   paymentTypes: PaymentType[];
}

const getBase64 = (file: RcFile): Promise<string> =>
   new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = (error) => reject(error);
   });

export function PaymentMethodModal({
   formValue,
   title,
   show,
   onOk,
   onCancel,
   isCreate,
   paymentTypes,
}: PaymentMethodModalProps) {
   const [form] = Form.useForm();
   const { notification } = App.useApp();
   const [loading, setLoading] = useState(false);

   const [fileList, setFileList] = useState<UploadFile[]>([]);
   const [previewOpen, setPreviewOpen] = useState(false);
   const [previewImage, setPreviewImage] = useState('');
   const [previewTitle, setPreviewTitle] = useState('');

   useEffect(() => {
      if (show) {
         form.setFieldsValue(formValue);
         if (formValue.payment_method_avatar_url) {
            setFileList([
               {
                  uid: '-1',
                  name: 'avatar',
                  status: 'done',
                  url: formValue.payment_method_avatar_url,
               },
            ]);
         } else {
            setFileList([]);
         }
      } else {
         form.resetFields();
         setFileList([]);
      }
   }, [show, formValue, form]);

   const handleSubmit = async () => {
      try {
         setLoading(true);
         const values = await form.validateFields();
         const formData = new FormData();

         Object.keys(values).forEach((key) => {
            if (values[key] !== undefined) {
               formData.append(key, values[key]);
            }
         });

         if (fileList[0]?.originFileObj) {
            formData.append('avatar', fileList[0].originFileObj);
         }

         if (isCreate) {
            await paymentMethodAPI.createPaymentMethod(formData);
            notification.success({
               message: 'Tạo phương thức thanh toán thành công',
            });
         } else {
            await paymentMethodAPI.updatePaymentMethod(formValue.payment_method_id!.toString(), formData);
            notification.success({
               message: 'Cập nhật phương thức thanh toán thành công',
            });
         }
         onOk();
      } catch (error: any) {
         notification.error({
            message: 'Có lỗi xảy ra',
            description: error.message,
         });
      } finally {
         setLoading(false);
      }
   };

   const handlePreview = async (file: UploadFile) => {
      if (!file.url && !file.preview) {
         file.preview = await getBase64(file.originFileObj as RcFile);
      }
      setPreviewImage(file.url || (file.preview as string));
      setPreviewOpen(true);
      setPreviewTitle(file.name || file.url!.substring(file.url!.lastIndexOf('/') + 1));
   };

   const handleChangeUpload: UploadProps['onChange'] = ({ fileList: newFileList }) => setFileList(newFileList);

   return (
      <>
         <Modal
            title={title}
            open={show}
            onOk={handleSubmit}
            onCancel={onCancel}
            width={600}
            centered
            confirmLoading={loading}
         >
            <Form
               form={form}
               labelCol={{ span: 4 }}
               wrapperCol={{ span: 18 }}
               layout="horizontal"
               style={{ maxHeight: '70vh', overflowY: 'auto' }}
               initialValues={formValue}
            >
               <Form.Item
                  name="payment_method_code"
                  label="Mã"
                  rules={[{ required: true, message: 'Vui lòng nhập mã phương thức' }]}
               >
                  <Input size="large" />
               </Form.Item>

               <Form.Item
                  name="payment_method_name"
                  label="Tên"
                  rules={[{ required: true, message: 'Vui lòng nhập tên phương thức' }]}
               >
                  <Input size="large" />
               </Form.Item>

               <Form.Item name="payment_method_description" label="Mô tả">
                  <Input.TextArea size="large" />
               </Form.Item>

               <Form.Item
                  name="payment_type_id"
                  label="Loại"
                  rules={[{ required: true, message: 'Vui lòng chọn loại thanh toán' }]}
               >
                  <Select size="large">
                     {paymentTypes?.map((type) => (
                        <Select.Option key={type.payment_type_id} value={type.payment_type_id}>
                           {type.payment_type_name}
                        </Select.Option>
                     ))}
                  </Select>
               </Form.Item>

               <Form.Item
                  name="is_locked"
                  label="Trạng thái"
                  rules={[{ required: true, message: 'Vui lòng chọn trạng thái' }]}
               >
                  <Radio.Group size="large" optionType="button" buttonStyle="solid">
                     <Radio value={0}>Hoạt động</Radio>
                     <Radio value={1}>Khóa</Radio>
                  </Radio.Group>
               </Form.Item>

               <Form.Item label="Avatar">
                  <Upload
                     listType="picture-card"
                     fileList={fileList}
                     onPreview={handlePreview}
                     onChange={handleChangeUpload}
                     maxCount={1}
                     beforeUpload={() => false}
                  >
                     {fileList.length >= 1 ? null : (
                        <div>
                           <PlusOutlined />
                           <div style={{ marginTop: 8 }}>Upload</div>
                        </div>
                     )}
                  </Upload>
               </Form.Item>
            </Form>
         </Modal>

         <Modal open={previewOpen} title={previewTitle} footer={null} onCancel={() => setPreviewOpen(false)}>
            <img alt="preview" style={{ width: '100%' }} src={previewImage} />
         </Modal>
      </>
   );
}
