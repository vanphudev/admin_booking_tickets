import { App, Form, Modal, Input, InputNumber } from 'antd';
import { useEffect } from 'react';

import driverAPI from '@/redux/api/services/driverAPI';
import { Driver } from './entity';

interface DriverModalProps {
   formValue: Driver;
   title: string;
   show: boolean;
   onOk: VoidFunction;
   onCancel: VoidFunction;
   isCreate: boolean;
}

export function DriverModal({ formValue, title, show, onOk, onCancel, isCreate }: DriverModalProps) {
   const [form] = Form.useForm();
   const { notification } = App.useApp();

   useEffect(() => {
      if (show) {
         form.setFieldsValue(formValue);
      } else {
         form.resetFields();
      }
   }, [show, formValue, form]);

   const handleSubmit = async () => {
      try {
         const values = await form.validateFields();
         const formData = new FormData();

         // Append driver data
         formData.append('driver_license_number', values.driver_license_number);
         formData.append('driver_experience_years', values.driver_experience_years);

         // Append employee data
         formData.append('employee_full_name', values.Employee.employee_full_name);
         formData.append('employee_email', values.Employee.employee_email);
         formData.append('employee_phone', values.Employee.employee_phone);
         formData.append('employee_username', values.Employee.employee_username);

         if (isCreate) {
            await driverAPI.createDriver(formData);
            notification.success({
               message: 'Thêm tài xế thành công',
            });
         } else {
            formData.append('driver_id', formValue.driver_id!.toString());
            await driverAPI.updateDriver(formData);
            notification.success({
               message: 'Cập nhật tài xế thành công',
            });
         }
         onOk();
      } catch (error: any) {
         notification.error({
            message: 'Có lỗi xảy ra',
            description: error.message,
         });
      }
   };

   return (
      <Modal title={title} open={show} onOk={handleSubmit} onCancel={onCancel} width={600} centered>
         <Form form={form} layout="vertical" initialValues={formValue}>
            <Form.Item
               label="Họ và tên"
               name={['Employee', 'employee_full_name']}
               rules={[{ required: true, message: 'Vui lòng nhập họ tên' }]}
            >
               <Input />
            </Form.Item>

            <Form.Item
               label="Email"
               name={['Employee', 'employee_email']}
               rules={[
                  { required: true, message: 'Vui lòng nhập email' },
                  { type: 'email', message: 'Email không hợp lệ' },
               ]}
            >
               <Input />
            </Form.Item>

            <Form.Item
               label="Số điện thoại"
               name={['Employee', 'employee_phone']}
               rules={[
                  { required: true, message: 'Vui lòng nhập số điện thoại' },
                  { pattern: /^[0-9]+$/, message: 'Số điện thoại không hợp lệ' },
               ]}
            >
               <Input />
            </Form.Item>

            <Form.Item
               label="Tên đăng nhập"
               name={['Employee', 'employee_username']}
               rules={[{ required: true, message: 'Vui lòng nhập tên đăng nhập' }]}
            >
               <Input />
            </Form.Item>

            <Form.Item
               label="Số giấy phép lái xe"
               name="driver_license_number"
               rules={[{ required: true, message: 'Vui lòng nhập số GPLX' }]}
            >
               <Input />
            </Form.Item>

            <Form.Item
               label="Số năm kinh nghiệm"
               name="driver_experience_years"
               rules={[{ required: true, message: 'Vui lòng nhập số năm kinh nghiệm' }]}
            >
               <InputNumber min={0} style={{ width: '100%' }} />
            </Form.Item>
         </Form>
      </Modal>
   );
}
