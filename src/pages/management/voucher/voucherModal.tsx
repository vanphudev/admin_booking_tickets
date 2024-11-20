import { Form, Modal, Input, Select, DatePicker, App } from 'antd';
import { useEffect, useState } from 'react';

import dayjs from 'dayjs';

import voucherAPI from '@/redux/api/services/voucherAPI';
import { Voucher, VoucherFormValues } from './entity';
import { Employee } from '../employee/entity';
import { setEmployeesSlice } from '@/redux/slices/employeeSlice';
import employeeAPI from '@/redux/api/services/employeeAPI';
import { useSelector, useDispatch } from 'react-redux';
import { RootState } from '@/redux/stores/store';

interface VoucherModalProps {
   formValue: Partial<Voucher>;
   title: string;
   show: boolean;
   onOk: () => void;
   onCancel: () => void;
   isCreate: boolean;
}

export function VoucherModal({ formValue, title, show, onOk, onCancel, isCreate }: VoucherModalProps) {
   const [form] = Form.useForm<VoucherFormValues>();
   const { notification } = App.useApp();
   const [loading, setLoading] = useState(false);
   const dispatch = useDispatch();
   const [error, setError] = useState(null);
   const { userId } = useSelector((state: RootState) => state.user.userInfo);
   function transformApiResponseToEmployee(apiResponse: any): Employee {
      return {
         employee_id: apiResponse.employee_id,
         employee_full_name: apiResponse.employee_full_name,
         employee_email: apiResponse.employee_email,
         employee_phone: apiResponse.employee_phone,
         employee_username: apiResponse.employee_username,
         employee_birthday: apiResponse.employee_birthday,
         employee_gender: apiResponse.employee_gender,
         is_first_activation: apiResponse.is_first_activation,
         is_locked: apiResponse.is_locked === 1 ? 1 : 0,
         last_lock_at: apiResponse.last_lock_at || '',
         employee_belongto_office: {
            id: apiResponse.employee_belongto_office?.office_id, // Sử dụng office_id
            name: apiResponse.employee_belongto_office?.office_name || '', // Sử dụng office_name
            phone: apiResponse.employee_belongto_office?.office_phone,
            fax: apiResponse.employee_belongto_office?.office_fax,
            description: apiResponse.employee_belongto_office?.office_description,
            latitude: parseFloat(apiResponse.employee_belongto_office?.office_latitude), // Chuyển đổi sang số
            longitude: parseFloat(apiResponse.employee_belongto_office?.office_longitude), // Chuyển đổi sang số
            mapUrl: apiResponse.employee_belongto_office?.office_map_url,
            isLocked: apiResponse.employee_belongto_office?.is_locked === 1 ? 1 : 0,
            lastLockAt: apiResponse.employee_belongto_office?.last_lock_at || '',
         },
         employee_belongto_employeeType: {
            employee_type_id: apiResponse.employee_belongto_employeeType?.employee_type_id,
            employee_type_name: apiResponse.employee_belongto_employeeType?.employee_type_name,
            employee_type_description: apiResponse.employee_belongto_employeeType?.employee_type_description,
         },
         created_at: apiResponse.created_at,
         updated_at: apiResponse.updated_at,
      };
   }
   useEffect(() => {
      setLoading(true);
      employeeAPI
         .getEmployees()
         .then((res: any) => {
            dispatch(setEmployeesSlice(res.map(transformApiResponseToEmployee)));
         })
         .catch((error) => {
            setError(error);
         })
         .finally(() => {
            setLoading(false);
         });
   }, [dispatch]);
   // Selectors
   const currentUser = useSelector((state: RootState) => state.user.userInfo);
   const { employees } = useSelector((state: RootState) => state.employee);

   // Effects
   useEffect(() => {
      if (show && isCreate && currentUser?.userId) {
         form.setFieldValue('employee_id', currentUser.userId);
      }
   }, [show, isCreate, currentUser, form]);

   useEffect(() => {
      if (!show) {
         form.resetFields();
      }
   }, [show, form]);

   useEffect(() => {
      if (show && formValue) {
         form.setFieldsValue({
            ...formValue,
            voucher_valid_from: formValue.voucher_valid_from ? dayjs(formValue.voucher_valid_from) : null,
            voucher_valid_to: formValue.voucher_valid_to ? dayjs(formValue.voucher_valid_to) : null,
            // employee_id: formValue.voucher_belongto_employee?.employee_id,
         });
      }
   }, [show, formValue, form]);

   // Handlers
   const handleOk = async () => {
      try {
         setLoading(true);
         const values = form.getFieldsValue(); // Lấy giá trị mà không cần xác thực
         const submitData = {
            code: values.voucher_code,
            percentage: values.voucher_discount_percentage,
            max_amount: values.voucher_discount_max_amount,
            usage_limit: values.voucher_usage_limit,
            valid_from: values.voucher_valid_from?.format('YYYY-MM-DD') || '',
            valid_to: values.voucher_valid_to?.format('YYYY-MM-DD') || '',
            create_by: userId,
            update_by: userId,
         };
         console.log('Submit Data:', submitData);
         if (isCreate) {
            const response = await voucherAPI.createVoucher(submitData);
            console.log(response);
            if (response.success) {
               notification.success({
                  message: 'Create voucher successfully!',
                  duration: 3,
               });
               onOk();
            } else {
               notification.error({
                  message: 'Create voucher failed!',
                  description: response.message,
                  duration: 3,
               });
            }
         } else {
            if (formValue.voucher_id === undefined) {
               notification.error({
                  message: 'Voucher ID is undefined!',
                  description: 'Cannot update voucher without a valid ID.',
                  duration: 3,
               });
               return;
            }
            console.log('Voucher ID: ', formValue.voucher_id);
            const response = await voucherAPI.updateVoucher({
               ...submitData,
               voucherId: formValue.voucher_id,
            });
            // console.log(response);
            if (response.success) {
               notification.success({
                  message: 'Update voucher successfully!',
                  duration: 3,
               });
               onOk();
            } else {
               notification.error({
                  message: 'Update voucher failed!',
                  description: response.message,
                  duration: 3,
               });
            }
         }
      } catch (error: any) {
         // Hiển thị thông báo lỗi nếu có lỗi xảy ra
         // console.error('Error:', error); // In ra lỗi để kiểm tra
         notification.error({
            message: 'An error occurred!',
            description: error.response ? error.response.data.message : 'Something went wrong.',
         });
      } finally {
         setLoading(false);
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
         confirmLoading={loading}
      >
         <Form<VoucherFormValues> form={form} layout="horizontal" labelCol={{ span: 6 }} wrapperCol={{ span: 16 }}>
            <Form.Item
               label="Voucher Code"
               name="voucher_code"
               rules={[
                  { required: true, message: 'Please enter voucher code!' },
                  { min: 3, message: 'Voucher code must be at least 3 characters!' },
                  { max: 50, message: 'Voucher code cannot exceed 50 characters!' },
               ]}
            >
               <Input placeholder="Enter voucher code" />
            </Form.Item>

            <Form.Item
               label="Discount Percentage"
               name="voucher_discount_percentage"
               rules={[
                  { required: true, message: 'Please enter discount percentage!' },
                  { type: 'number', min: 0, max: 100, message: 'Discount percentage must be between 0-100!' },
               ]}
            >
               <Input type="number" min={0} max={100} addonAfter="%" placeholder="Enter discount percentage" />
            </Form.Item>

            <Form.Item
               label="Maximum Discount"
               name="voucher_discount_max_amount"
               rules={[
                  { required: true, message: 'Please enter maximum discount amount!' },
                  { type: 'number', min: 0, message: 'Discount amount must be greater than 0!' },
               ]}
            >
               <Input type="number" min={0} addonAfter="VND" placeholder="Enter maximum discount amount" />
            </Form.Item>

            <Form.Item
               label="Usage Limit"
               name="voucher_usage_limit"
               rules={[
                  { required: true, message: 'Please enter usage limit!' },
                  { type: 'number', min: 1, message: 'Usage limit must be greater than 0!' },
               ]}
            >
               <Input type="number" min={1} placeholder="Enter usage limit" />
            </Form.Item>

            <Form.Item
               label="Valid From"
               name="voucher_valid_from"
               rules={[{ required: true, message: 'Please select start time!' }]}
            >
               <DatePicker
                  showTime
                  format="YYYY-MM-DD HH:mm:ss"
                  style={{ width: '100%' }}
                  placeholder="Select start time"
                  disabledDate={(current) => current && current < dayjs().startOf('day')}
               />
            </Form.Item>

            <Form.Item
               label="Valid To"
               name="voucher_valid_to"
               rules={[
                  { required: true, message: 'Please select end time!' },
                  ({ getFieldValue }) => ({
                     validator(_, value) {
                        if (
                           !value ||
                           !getFieldValue('voucher_valid_from') ||
                           value.isAfter(getFieldValue('voucher_valid_from'))
                        ) {
                           return Promise.resolve();
                        }
                        return Promise.reject(new Error('End time must be after start time!'));
                     },
                  }),
               ]}
            >
               <DatePicker
                  showTime
                  format="YYYY-MM-DD HH:mm:ss"
                  style={{ width: '100%' }}
                  placeholder="Select end time"
                  disabledDate={(current) => {
                     const validFrom = form.getFieldValue('voucher_valid_from');
                     return current && (current < dayjs().startOf('day') || (validFrom && current < validFrom));
                  }}
               />
            </Form.Item>

            <Form.Item
               label="Creator"
               name="employee_id"
               rules={[{ required: true, message: 'Please select a creator!' }]}
               initialValue={currentUser?.userId} // Chỉ sử dụng initialValue khi tạo mới
            >
               <Select
                  showSearch
                  placeholder="Select employee"
                  optionFilterProp="children"
                  loading={loading}
                  disabled // Disable select khi tạo mới
                  filterOption={(input, option) => (option?.label ?? '').toLowerCase().includes(input.toLowerCase())}
                  options={employees?.map((emp: Employee) => ({
                     value: emp.employee_id,
                     label: emp.employee_full_name,
                  }))}
               />
            </Form.Item>
         </Form>
      </Modal>
   );
}
