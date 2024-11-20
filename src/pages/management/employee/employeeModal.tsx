import { Employee } from './entity';
import type { RcFile, UploadFile, UploadProps } from 'antd/es/upload/interface';
import { useEffect, useState } from 'react';
import { App, Form, Modal, Input, Radio, Space, Upload, Spin, Tooltip } from 'antd';
import UploadIllustration from '@/components/upload/upload-illustration';
import employeeAPI from '@/redux/api/services/employeeAPI';
export type EmployeeModalProps = {
   formValue: Employee;
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

export function EmployeeModal({ formValue, title, show, onOk, onCancel, isCreate }: EmployeeModalProps) {
   const [form] = Form.useForm();
   const { notification } = App.useApp();
   const [fileList, setFileList] = useState<UploadFile[]>([]);
   const [loading, setLoading] = useState(false);

   useEffect(() => {
      if (show) {
         form.setFieldsValue(formValue);
         if (formValue.employee_profile_image) {
            const newFileList: UploadFile[] = [
               {
                  uid: '1',
                  name: 'profile_image',
                  status: 'done',
                  url: formValue.employee_profile_image,
               },
            ];
            setFileList(newFileList);
         } else {
            setFileList([]);
         }
      }
   }, [show, formValue, form]);

   const handleOk = () => {
      form.validateFields().then((formData) => {
         const additionalData = {
            images: fileList.map((file) => file.originFileObj),
         };
         const combinedData = { ...formData, ...additionalData };
         setLoading(true);
         if (isCreate) {
            employeeAPI
               .createEmployee(combinedData)
               .then((res) => {
                  if (res && (res.status === 201 || res.status === 200)) {
                     notification.success({
                        message: 'Create Employee Success!',
                        duration: 3,
                     });
                     onOk();
                  }
               })
               .catch((error) => {
                  notification.error({
                     message: `Create Employee Failed: ${error.message}`,
                     duration: 3,
                  });
               })
               .finally(() => {
                  setLoading(false);
               });
         } else {
            employeeAPI
               .updateEmployee(formValue.employee_id, combinedData)
               .then((res) => {
                  if (res && res.status === 200) {
                     notification.success({
                        message: 'Update Employee Success!',
                        duration: 3,
                     });
                     onOk();
                  }
               })
               .catch((error) => {
                  notification.error({
                     message: `Update Employee Failed: ${error.message}`,
                     duration: 3,
                  });
               })
               .finally(() => {
                  setLoading(false);
               });
         }
      });
   };

   const handleChange: UploadProps['onChange'] = ({ fileList: newFileList }) => setFileList(newFileList);

   const uploadButton = (
      <Tooltip placement="top" title="Drop or Select file">
         <div className="flex flex-col items-center justify-center p-0 opacity-100 hover:opacity-80">
            <UploadIllustration />
         </div>
      </Tooltip>
   );

   const content = (
      <Form<Employee>
         initialValues={formValue}
         form={form}
         labelCol={{ span: 4 }}
         wrapperCol={{ span: 18 }}
         layout="horizontal"
         style={{ maxHeight: '70vh', overflowY: 'auto' }}
      >
         <Form.Item
            label="Full Name"
            name="employee_full_name"
            rules={[{ required: true, message: 'Please enter the full name' }]}
         >
            <Input size="large" />
         </Form.Item>
         <Form.Item label="Email" name="employee_email" rules={[{ required: true, message: 'Please enter the email' }]}>
            <Input size="large" />
         </Form.Item>
         <Form.Item
            label="Phone"
            name="employee_phone"
            rules={[{ required: true, message: 'Please enter the phone number' }]}
         >
            <Input size="large" />
         </Form.Item>
         <Form.Item
            label="Username"
            name="employee_username"
            rules={[{ required: true, message: 'Please enter the username' }]}
         >
            <Input size="large" />
         </Form.Item>
         <Form.Item
            label="Password"
            name="employee_password"
            rules={[{ required: true, message: 'Please enter the password' }]}
         >
            <Input.Password size="large" />
         </Form.Item>
         <Form.Item
            label="Gender"
            name="employee_gender"
            rules={[{ required: true, message: 'Please select the gender' }]}
         >
            <Radio.Group>
               <Radio value={-1}>Other</Radio>
               <Radio value={0}>Female</Radio>
               <Radio value={1}>Male</Radio>
            </Radio.Group>
         </Form.Item>
         <Form.Item label="Profile Image">
            <Upload
               style={{ flex: 1 }}
               listType="picture-card"
               fileList={fileList}
               beforeUpload={() => false}
               onChange={handleChange}
            >
               {fileList.length >= 1 ? null : uploadButton}
            </Upload>
         </Form.Item>
      </Form>
   );

   return (
      <Modal title={title} open={show} onOk={handleOk} onCancel={onCancel} destroyOnClose width="60%" centered>
         {loading ? (
            <Spin size="large" tip={isCreate ? 'Creating...' : 'Updating...'}>
               {content}
            </Spin>
         ) : (
            content
         )}
      </Modal>
   );
}
