import { Form, Modal, Input, Select, DatePicker, App } from 'antd';
import { useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import dayjs from 'dayjs';

import { RootState } from '@/redux/stores/store';
import employeeAPI from '@/redux/api/services/employeeAPI';
import { fetchOffices } from '@/redux/slices/officeSlice';
import { fetchEmployeeTypes } from '@/redux/slices/employeeTypeSlice';
import { Employee, EmployeeFormValues } from './entity';

const { Option } = Select;

interface EmployeeModalProps {
   formValue: Partial<Employee>;
   title: string;
   show: boolean;
   onOk: () => void;
   onCancel: () => void;
   isCreate: boolean;
}

export function EmployeeModal({ formValue, title, show, onOk, onCancel, isCreate }: EmployeeModalProps) {
   const [form] = Form.useForm<EmployeeFormValues>();
   const { notification } = App.useApp();
   const dispatch = useDispatch();

   // Lấy data từ redux store
   const { offices, loading: officeLoading } = useSelector((state: RootState) => state.office);
   const { employeeTypes, loading: typeLoading } = useSelector((state: RootState) => state.employeeType);

   // Fetch data khi mở modal
   useEffect(() => {
      if (show) {
         dispatch(fetchOffices());
         dispatch(fetchEmployeeTypes());
      }
   }, [dispatch, show]);

   // Reset form khi đóng modal
   useEffect(() => {
      if (!show) {
         form.resetFields();
      }
   }, [show, form]);

   // Set initial values khi có formValue mới
   useEffect(() => {
      if (show && formValue) {
         form.setFieldsValue({
            ...formValue,
            employee_birthday: formValue.employee_birthday ? dayjs(formValue.employee_birthday) : null,
         });
      }
   }, [show, formValue, form]);

   const handleOk = async () => {
      try {
         const values = await form.validateFields();
         const submitData = {
            ...values,
            employee_birthday: values.employee_birthday?.format('YYYY-MM-DD'),
         };

         if (isCreate) {
            const response = await employeeAPI.createEmployee(submitData);
            if (response.success) {
               notification.success({
                  message: 'Tạo nhân viên thành công!',
                  duration: 3,
               });
               onOk();
            }
         } else {
            const response = await employeeAPI.updateEmployee({
               ...submitData,
               employee_id: formValue.employee_id,
            });
            if (response.success) {
               notification.success({
                  message: 'Cập nhật nhân viên thành công!',
                  duration: 3,
               });
               onOk();
            }
         }
      } catch (error: any) {
         notification.error({
            message: 'Có lỗi xảy ra!',
            description: error.message || 'Vui lòng kiểm tra lại thông tin',
            duration: 3,
         });
      }
   };

   return (
      <Modal
         title={title}
         open={show}
         onOk={handleOk}
         onCancel={onCancel}
         width="60%"
         centered
         maskClosable={false}
         confirmLoading={officeLoading || typeLoading}
      >
         <Form<EmployeeFormValues>
            form={form}
            layout="horizontal"
            labelCol={{ span: 6 }}
            wrapperCol={{ span: 16 }}
         >
            <Form.Item
               label="Họ và tên"
               name="employee_full_name"
               rules={[
                  { required: true, message: 'Vui lòng nhập họ và tên!' },
                  { min: 3, message: 'Họ và tên phải có ít nhất 3 ký tự!' },
                  { max: 50, message: 'Họ và tên không được quá 50 ký tự!' },
               ]}
            >
               <Input placeholder="Nhập họ và tên" />
            </Form.Item>

            <Form.Item
               label="Email"
               name="employee_email"
               rules={[
                  { required: true, message: 'Vui lòng nhập email!' },
                  { type: 'email', message: 'Email không hợp lệ!' },
               ]}
            >
               <Input placeholder="Nhập email" />
            </Form.Item>

            <Form.Item
               label="Số điện thoại"
               name="employee_phone"
               rules={[
                  { required: true, message: 'Vui lòng nhập số điện thoại!' },
                  { pattern: /^[0-9]{10}$/, message: 'Số điện thoại không hợp lệ!' },
               ]}
            >
               <Input placeholder="Nhập số điện thoại" />
            </Form.Item>

            <Form.Item
               label="Tên đăng nhập"
               name="employee_username"
               rules={[
                  { required: true, message: 'Vui lòng nhập tên đăng nhập!' },
                  { min: 3, message: 'Tên đăng nhập phải có ít nhất 3 ký tự!' },
               ]}
            >
               <Input placeholder="Nhập tên đăng nhập" />
            </Form.Item>

            {isCreate && (
               <Form.Item
                  label="Mật khẩu"
                  name="employee_password"
                  rules={[
                     { required: true, message: 'Vui lòng nhập mật khẩu!' },
                     { min: 6, message: 'Mật khẩu phải có ít nhất 6 ký tự!' },
                  ]}
               >
                  <Input.Password placeholder="Nhập mật khẩu" />
               </Form.Item>
            )}

            <Form.Item
               label="Ngày sinh"
               name="employee_birthday"
               rules={[{ required: true, message: 'Vui lòng chọn ngày sinh!' }]}
            >
               <DatePicker
                  format="DD/MM/YYYY"
                  style={{ width: '100%' }}
                  placeholder="Chọn ngày sinh"
                  disabledDate={(current) => current && current > dayjs().endOf('day')}
               />
            </Form.Item>

            <Form.Item
               label="Giới tính"
               name="employee_gender"
               rules={[{ required: true, message: 'Vui lòng chọn giới tính!' }]}
            >
               <Select placeholder="Chọn giới tính">
                  <Option value={1}>Nam</Option>
                  <Option value={0}>Nữ</Option>
                  <Option value={-1}>Khác</Option>
               </Select>
            </Form.Item>

            <Form.Item
               label="Văn phòng"
               name="office_id"
               rules={[{ required: true, message: 'Vui lòng chọn văn phòng!' }]}
            >
               <Select 
                  placeholder="Chọn văn phòng"
                  loading={officeLoading}
               >
                  {offices?.map((office) => (
                     <Option key={office.office_id} value={office.office_id}>
                        {office.office_name}
                     </Option>
                  ))}
               </Select>
            </Form.Item>

            <Form.Item
               label="Loại nhân viên"
               name="employee_type_id"
               rules={[{ required: true, message: 'Vui lòng chọn loại nhân viên!' }]}
            >
               <Select 
                  placeholder="Chọn loại nhân viên"
                  loading={typeLoading}
               >
                  {employeeTypes?.map((type) => (
                     <Option key={type.employee_type_id} value={type.employee_type_id}>
                        {type.employee_type_name}
                     </Option>
                  ))}
               </Select>
            </Form.Item>
         </Form>
      </Modal>
   );
}