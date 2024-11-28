import { Vehicle } from './entity';
import type { RcFile, UploadFile, UploadProps } from 'antd/es/upload/interface';
import { useEffect, useState } from 'react';
import { App, Form, Modal, Input, Radio, Space, Select, Flex, Typography, Upload, Spin, Tooltip } from 'antd';
import { IconButton, Iconify } from '@/components/icon';
import vehicleAPI from '@/redux/api/services/vehicleAPI';
import UploadIllustration from '@/components/upload/upload-illustration';

export type VehicleModalProps = {
   formValue: Vehicle;
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

export function VehicleModal({ formValue, title, show, onOk, onCancel, isCreate }: VehicleModalProps) {
   const [form] = Form.useForm();
   const { notification } = App.useApp();
   const [fileList, setFileList] = useState<UploadFile[]>([]);
   const [previewOpen, setPreviewOpen] = useState(false);
   const [previewImage, setPreviewImage] = useState('');
   const [previewTitle, setPreviewTitle] = useState('');
   const [loading, setLoading] = useState(false);

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
               vehicleId: formValue.id,
               images: fileList.map((file) => file.originFileObj),
            };
            const combinedData = { ...formData, ...additionalData };
            if (isCreate) {
               setLoading(true);
               vehicleAPI
                  .createVehicle(combinedData)
                  .then((res) => {
                     if (res && (res.status === 201 || res.status === 200)) {
                        notification.success({
                           message: 'Create Vehicle Success !',
                           duration: 3,
                        });
                        onOk();
                     }
                     if (res && (res.error === true || res.status === 400 || res.status === 404)) {
                        notification.warning({
                           message: 'Create Vehicle Failed ! Please try again',
                           duration: 3,
                        });
                     }
                  })
                  .catch((error) => {
                     notification.error({
                        message: `Create Vehicle Failed: ${error.message}`,
                        duration: 3,
                     });
                  })
                  .finally(() => {
                     setLoading(false);
                  });
            } else {
               // Trạng thái cập nhật. isCreate = false
               setLoading(true);
               vehicleAPI
                  .updateVehicle(combinedData)
                  .then((res) => {
                     if (res && (res.status === 201 || res.status === 200)) {
                        notification.success({
                           message: 'Update Vehicle Success !',
                           duration: 3,
                        });
                        onOk();
                     }
                     if (res && (res.error === true || res.status === 400 || res.status === 404)) {
                        notification.warning({
                           message: 'Update Vehicle Failed ! Please try again',
                           duration: 3,
                        });
                     }
                  })
                  .catch((error) => {
                     notification.error({
                        message: `Update Vehicle Failed: ${error.message}`,
                        duration: 3,
                     });
                  })
                  .finally(() => {
                     setLoading(false);
                  });
            }
         })
         .catch((errorInfo) => {
            if (errorInfo && errorInfo.errorFields) {
               const errorFields = errorInfo.errorFields.map((field: any) => field.name.join(' '));
               notification.warning({
                  message: `Validation Data: \n${errorFields}`,
                  duration: 3,
               });
            } else {
               // Xử lý lỗi không phải là lỗi xác thực
               notification.error({
                  message: `An error occurred: ${errorInfo.message || 'Unknown error'}`,
                  duration: 3,
               });
            }
         });
   };
   const content = (
      <Form form={form} layout="vertical" initialValues={formValue} style={{ maxHeight: '70vh', overflowY: 'auto' }}>
         <Form.Item
            name="code"
            label="Vehicle Code"
            rules={[{ required: true, message: 'Please input vehicle code!' }]}
         >
            <Input placeholder="Enter vehicle code" />
         </Form.Item>

         <Form.Item
            name="license_plate"
            label="License Plate"
            rules={[{ required: true, message: 'Please input license plate!' }]}
         >
            <Input placeholder="Enter license plate" />
         </Form.Item>

         <Space style={{ width: '100%' }} direction="vertical" size="middle">
            <Space style={{ width: '100%' }} size="middle">
               <Form.Item name="model" label="Model" style={{ width: '100%' }}>
                  <Input placeholder="Enter model" />
               </Form.Item>

               <Form.Item name="brand" label="Brand" style={{ width: '100%' }}>
                  <Input placeholder="Enter brand" />
               </Form.Item>
            </Space>

            <Space style={{ width: '100%' }} size="middle">
               <Form.Item
                  name="capacity"
                  label="Capacity"
                  rules={[{ required: true, message: 'Please input capacity!' }]}
                  style={{ width: '100%' }}
               >
                  <Input type="number" placeholder="Enter capacity" />
               </Form.Item>

               <Form.Item name="manufacture_year" label="Manufacture Year" style={{ width: '100%' }}>
                  <Input type="number" placeholder="Enter manufacture year" />
               </Form.Item>
            </Space>
         </Space>

         <Form.Item name="color" label="Color">
            <Input placeholder="Enter color" />
         </Form.Item>

         <Form.Item name="description" label="Description">
            <Input.TextArea rows={4} placeholder="Enter description" />
         </Form.Item>

         <Form.Item
            name="isLocked"
            label="Lock Status"
            rules={[{ required: true, message: 'Please select lock status!' }]}
         >
            <Radio.Group>
               <Radio value={1}>Locked</Radio>
               <Radio value={0}>Unlocked</Radio>
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
      <Modal title={title} open={show} onOk={handleOk} onCancel={onCancel} width={720} destroyOnClose>
         <Spin spinning={loading} tip={isCreate ? 'Creating...' : 'Updating...'}>
            {content}
         </Spin>
      </Modal>
   );
}
