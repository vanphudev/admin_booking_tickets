import { PaymentMethod } from './entity';
import type { RcFile, UploadFile, UploadProps } from 'antd/es/upload/interface';
import { useEffect, useState } from 'react';
import { App, Form, Modal, Upload, Input, Radio, Tooltip, Spin } from 'antd';
import UploadIllustration from '@/components/upload/upload-illustration';
import paymentMethodAPI from '@/redux/api/services/paymentMethodAPI';

export type PaymentMethodModalProps = {
   formValue: PaymentMethod;
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

export function PaymentMethodModal({ formValue, title, show, onOk, onCancel, isCreate }: PaymentMethodModalProps) {
   const [form] = Form.useForm();
   const { notification } = App.useApp();
   const [loading, setLoading] = useState(false);
   const [previewOpen, setPreviewOpen] = useState(false);
   const [previewImage, setPreviewImage] = useState('');
   const [previewTitle, setPreviewTitle] = useState('');
   const [fileList, setFileList] = useState<UploadFile[]>([]);

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

   const handleOk = () => {
      form
         .validateFields()
         .then((formData) => {
            const additionalData = {
               payment_method_id: formValue.payment_method_id,
               images: fileList.map((file) => file.originFileObj),
            };
            const combinedData = { ...formData, ...additionalData };
            setLoading(true);
            if (isCreate) {
               paymentMethodAPI
                  .createPaymentMethod(combinedData)
                  .then((res) => {
                     if (res && (res.status === 201 || res.status === 200)) {
                        notification.success({ message: 'Create Payment Method Success!', duration: 3 });
                        onOk();
                     }
                  })
                  .catch((error) => {
                     notification.error({ message: `Create Payment Method Failed: ${error.message}`, duration: 3 });
                  })
                  .finally(() => {
                     setLoading(false);
                  });
            } else {
               paymentMethodAPI
                  .updatePaymentMethod(combinedData)
                  .then((res) => {
                     if (res && (res.status === 201 || res.status === 200)) {
                        notification.success({ message: 'Update Payment Method Success!', duration: 3 });
                        onOk();
                     }
                  })
                  .catch((error) => {
                     notification.error({ message: `Update Payment Method Failed: ${error.message}`, duration: 3 });
                  })
                  .finally(() => {
                     setLoading(false);
                  });
            }
         })
         .catch((errorInfo) => {
            const errorFields = errorInfo.errorFields.map((field: any) => field.name.join(' '));
            notification.warning({ message: `Validation Data: \n${errorFields}`, duration: 3 });
         });
   };

   const content = (
      <Form<PaymentMethod>
         initialValues={formValue}
         form={form}
         labelCol={{ span: 4 }}
         wrapperCol={{ span: 18 }}
         layout="horizontal"
      >
         <Form.Item
            label="Name"
            name="payment_method_name"
            rules={[{ required: true, message: 'Please enter the name' }]}
         >
            <Input size="large" />
         </Form.Item>
         <Form.Item
            label="Code"
            name="payment_method_code"
            rules={[{ required: true, message: 'Please enter the code' }]}
         >
            <Input size="large" />
         </Form.Item>
         <Form.Item
            label="Description"
            name="payment_method_description"
            rules={[{ required: true, message: 'Please enter the description' }]}
         >
            <Input.TextArea size="large" />
         </Form.Item>
         <Form.Item label="Locked" name="isLocked" rules={[{ required: true, message: 'Please select a status' }]}>
            <Radio.Group size="large" optionType="button" buttonStyle="solid">
               <Radio value={1}>Enable</Radio>
               <Radio value={0}>Disable</Radio>
            </Radio.Group>
         </Form.Item>
         <Form.Item label="Images">
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
               <img alt="preview" style={{ width: '100%' }} src={previewImage} />
            </Modal>
         </Form.Item>
      </Form>
   );

   return (
      <Modal title={title} open={show} onOk={handleOk} onCancel={onCancel} destroyOnClose width="60%" centered>
         {loading ? (
            <Spin size="large" fullscreen tip={isCreate ? 'Creating...' : 'Updating...'}>
               {content}
            </Spin>
         ) : (
            content
         )}
      </Modal>
   );
}
