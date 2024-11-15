import { Form, Modal, Input, InputNumber, Select, App } from 'antd';
import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { AppDispatch, RootState } from '@/redux/stores/store';
import { fetchEmployees } from '@/redux/slices/employeeSlice';
import { Driver } from './entity';
import { Employee } from '../employee/entity';
import driverAPI from '@/redux/api/services/driverAPI';

const { Option } = Select;

interface DriverModalProps {
   formValue: Driver;
   title: string;
   show: boolean;
   onOk: () => void;
   onCancel: () => void;
   isCreate: boolean;
}

export function DriverModal({ formValue, title, show, onOk, onCancel, isCreate }: DriverModalProps) {
   const [form] = Form.useForm();
   const { notification } = App.useApp();
   const dispatch = useDispatch<AppDispatch>();

   const employees = useSelector((state: RootState) => state.employee.employees);
   const employeeLoading = useSelector((state: RootState) => state.employee.loading);

   useEffect(() => {
      if (show) {
         dispatch(fetchEmployees());
      }
   }, [dispatch, show]);

   useEffect(() => {
      if (!show) {
         form.resetFields();
      }
   }, [show, form]);

   useEffect(() => {
      if (show && formValue) {
         form.setFieldsValue({
            employee_id: formValue.employee_id,
            driver_license_number: formValue.driver_license_number,
            driver_experience_years: formValue.driver_experience_years,
         });
      }
   }, [show, formValue, form]);

   const handleOk = async () => {
      try {
         const values = await form.validateFields();

         if (isCreate) {
            const response = await driverAPI.createDriver(values);
            if (response.success) {
               notification.success({
                  message: 'Tạo tài xế thành công!',
               });
               onOk();
            }
         } else {
            const response = await driverAPI.updateDriver({
               ...values,
               driver_id: formValue.driver_id,
            });
            if (response.success) {
               notification.success({
                  message: 'Cập nhật tài xế thành công!',
               });
               onOk();
            }
         }
      } catch (error: any) {
         notification.error({
            message: 'Có lỗi xảy ra!',
            description: error.message,
         });
      }
   };

   return (
      <Modal title={title} open={show} onOk={handleOk} onCancel={onCancel} width="60%" centered maskClosable={false}>
         <Form form={form} layout="horizontal" labelCol={{ span: 6 }} wrapperCol={{ span: 16 }}>
            <Form.Item
               label="Nhân viên"
               name="employee_id"
               rules={[{ required: true, message: 'Vui lòng chọn nhân viên!' }]}
            >
               <Select placeholder="Chọn nhân viên" loading={employeeLoading} disabled={!isCreate}>
                  {employees?.map((employee: Employee) => (
                     <Option
                        key={employee.employee_id}
                        value={employee.employee_id}
                        disabled={employee.is_locked === 1}
                     >
                        {employee.employee_full_name} - {employee.employee_email}
                     </Option>
                  ))}
               </Select>
            </Form.Item>

            <Form.Item
               label="Số GPLX"
               name="driver_license_number"
               rules={[{ required: true, message: 'Vui lòng nhập số GPLX!' }]}
            >
               <Input placeholder="Nhập số giấy phép lái xe" />
            </Form.Item>

            <Form.Item
               label="Kinh nghiệm (năm)"
               name="driver_experience_years"
               rules={[{ required: true, message: 'Vui lòng nhập số năm kinh nghiệm!' }]}
            >
               <InputNumber placeholder="Nhập số năm kinh nghiệm" style={{ width: '100%' }} min={0} />
            </Form.Item>
         </Form>
      </Modal>
   );
}
