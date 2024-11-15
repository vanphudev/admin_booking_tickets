import { PlusOutlined } from '@ant-design/icons';
import { App, Form, Modal, Input, Radio, InputNumber, Select, Upload } from 'antd';
import { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';

import vehicleAPI from '@/redux/api/services/vehicleAPI';
import { RootState } from '@/redux/stores/store';

import { Vehicle } from './entity';

import type { RcFile, UploadFile, UploadProps } from 'antd/es/upload/interface';

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

   const { offices, vehicleTypes } = useSelector((state: RootState) => ({
      offices: state.office.offices,
      vehicleTypes: state.vehicleType.vehicleTypes,
   }));

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
         <div style={{ marginTop: 8 }}>Upload</div>
      </div>
   );

   useEffect(() => {
      if (show) {
         form.setFieldsValue(formValue);
         if (formValue.images && formValue.images.length > 0) {
            const newFileList = formValue.images.map((image, index) => {
               const isString = typeof image === 'string';
               return {
                  uid: `${index}`,
                  name: `image${index}.png`,
                  status: 'done',
                  url: isString ? image : URL.createObjectURL(image),
               };
            });
            setFileList(newFileList as UploadFile[]);
         } else {
            setFileList([]);
         }
      } else {
         form.resetFields();
         setFileList([]);
      }
   }, [show, formValue, form]);

   const handleOk = () => {
      form
         .validateFields()
         .then((formData) => {
            const submitData = {
               ...formData,
               images: fileList,
            };
            if (isCreate) {
               vehicleAPI.createVehicle(submitData).then((res) => {
                  if (res && (res.status === 201 || res.status === 200)) {
                     notification.success({
                        message: 'Thêm xe thành công!',
                        duration: 3,
                     });
                     onOk();
                  }
               });
            } else {
               vehicleAPI.updateVehicle(submitData).then((res) => {
                  if (res && (res.status === 201 || res.status === 200)) {
                     notification.success({
                        message: 'Cập nhật xe thành công!',
                        duration: 3,
                     });
                     onOk();
                  }
               });
            }
         })
         .catch((error) => {
            console.error('Validation Failed:', error);
         });
   };

   const handleCancel = () => {
      onCancel();
      setFileList([]);
   };

   return (
      <>
         <Modal title={title} open={show} onOk={handleOk} onCancel={handleCancel} width="60%" centered>
            <Form<Vehicle>
               form={form}
               labelCol={{ span: 4 }}
               wrapperCol={{ span: 18 }}
               layout="horizontal"
               style={{ maxHeight: '70vh', overflowY: 'auto' }}
               initialValues={formValue}
            >
               <Form.Item<Vehicle>
                  label="Mã xe"
                  name="code"
                  rules={[{ required: true, message: 'Vui lòng nhập mã xe' }]}
               >
                  <Input size="large" />
               </Form.Item>

               <Form.Item<Vehicle>
                  label="Biển số"
                  name="name"
                  rules={[{ required: true, message: 'Vui lòng nhập biển số xe' }]}
               >
                  <Input size="large" />
               </Form.Item>

               <Form.Item<Vehicle> label="Model" name="model">
                  <Input size="large" />
               </Form.Item>

               <Form.Item<Vehicle> label="Hãng xe" name="brand">
                  <Input size="large" />
               </Form.Item>

               <Form.Item<Vehicle>
                  label="Số ghế"
                  name="capacity"
                  rules={[{ required: true, message: 'Vui lòng nhập số ghế' }]}
               >
                  <InputNumber min={1} className="w-full" size="large" />
               </Form.Item>

               <Form.Item<Vehicle> label="Năm sản xuất" name="manufactureYear">
                  <InputNumber min={1800} max={new Date().getFullYear()} className="w-full" size="large" />
               </Form.Item>

               <Form.Item<Vehicle> label="Màu xe" name="color">
                  <Input size="large" />
               </Form.Item>

               <Form.Item<Vehicle>
                  label="Văn phòng"
                  name="officeId"
                  rules={[{ required: true, message: 'Vui lòng chọn văn phòng' }]}
               >
                  <Select size="large">
                     {offices?.map((office: any) => (
                        <Select.Option key={office.id} value={office.id}>
                           {office.name}
                        </Select.Option>
                     ))}
                  </Select>
               </Form.Item>

               <Form.Item<Vehicle>
                  label="Loại xe"
                  name="vehicleTypeId"
                  rules={[{ required: true, message: 'Vui lòng chọn loại xe' }]}
               >
                  <Select size="large">
                     {vehicleTypes?.map((type: any) => (
                        <Select.Option key={type.id} value={type.id}>
                           {type.name}
                        </Select.Option>
                     ))}
                  </Select>
               </Form.Item>

               <Form.Item<Vehicle> label="Mô tả" name="description">
                  <Input.TextArea size="large" rows={4} />
               </Form.Item>

               <Form.Item<Vehicle>
                  label="Trạng thái"
                  name="isLocked"
                  rules={[{ required: true, message: 'Vui lòng chọn trạng thái' }]}
               >
                  <Radio.Group size="large" optionType="button" buttonStyle="solid">
                     <Radio value={1}>Khóa</Radio>
                     <Radio value={0}>Hoạt động</Radio>
                  </Radio.Group>
               </Form.Item>

               <Form.Item<Vehicle> label="Hình ảnh">
                  <Upload
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
               </Form.Item>
            </Form>
         </Modal>

         <Modal open={previewOpen} title={previewTitle} footer={null} onCancel={handleCancelUpload}>
            <img alt="preview" style={{ width: '100%' }} src={previewImage} />
         </Modal>
      </>
   );
}
