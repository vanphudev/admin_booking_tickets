import { Form, Modal, Input, Select, DatePicker, App } from 'antd';
import { useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import dayjs from 'dayjs';

import { RootState } from '@/redux/stores/store';
import { fetchEmployees } from '@/redux/slices/employeeSlice';
import voucherAPI from '@/redux/api/services/voucherAPI';
import { Voucher, VoucherFormValues } from './entity';

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
   const dispatch = useDispatch();

   // Selectors
   const currentUser = useSelector((state: RootState) => state.user.userInfo);
   const { employees, loading } = useSelector((state: RootState) => state.employee);

   // Effects
   useEffect(() => {
      if (show) {
         dispatch(fetchEmployees());
         if (isCreate && currentUser?.employee_id) {
            form.setFieldValue('voucher_created_by', currentUser.employee_id);
         }
      }
   }, [dispatch, show, isCreate, currentUser, form]);

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
         });
      }
   }, [show, formValue, form]);

   // Handlers
   const handleOk = async () => {
      try {
         const values = await form.validateFields();
         const submitData = {
            ...values,
            voucher_valid_from: values.voucher_valid_from?.format('YYYY-MM-DD HH:mm:ss'),
            voucher_valid_to: values.voucher_valid_to?.format('YYYY-MM-DD HH:mm:ss'),
         };

         if (isCreate) {
            const response = await voucherAPI.createVoucher(submitData);
            if (response.success) {
               notification.success({
                  message: 'Tạo voucher thành công!',
                  duration: 3,
               });
               onOk();
            } else {
               notification.error({
                  message: 'Tạo voucher thất bại!',
                  description: response.message,
                  duration: 3,
               });
            }
         } else {
            const response = await voucherAPI.updateVoucher({
               ...submitData,
               voucher_id: formValue.voucher_id,
            });
            if (response.success) {
               notification.success({
                  message: 'Cập nhật voucher thành công!',
                  duration: 3,
               });
               onOk();
            } else {
               notification.error({
                  message: 'Cập nhật voucher thất bại!',
                  description: response.message,
                  duration: 3,
               });
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
         confirmLoading={loading}
      >
         <Form<VoucherFormValues> form={form} layout="horizontal" labelCol={{ span: 6 }} wrapperCol={{ span: 16 }}>
            <Form.Item
               label="Mã voucher"
               name="voucher_code"
               rules={[
                  { required: true, message: 'Vui lòng nhập mã voucher!' },
                  { min: 3, message: 'Mã voucher phải có ít nhất 3 ký tự!' },
                  { max: 50, message: 'Mã voucher không được quá 50 ký tự!' },
               ]}
            >
               <Input placeholder="Nhập mã voucher" />
            </Form.Item>

            <Form.Item
               label="Phần trăm giảm"
               name="voucher_discount_percentage"
               rules={[
                  { required: true, message: 'Vui lòng nhập phần trăm giảm!' },
                  { type: 'number', min: 0, max: 100, message: 'Phần trăm giảm phải từ 0-100!' },
               ]}
            >
               <Input type="number" min={0} max={100} addonAfter="%" placeholder="Nhập phần trăm giảm" />
            </Form.Item>

            <Form.Item
               label="Giảm tối đa"
               name="voucher_discount_max_amount"
               rules={[
                  { required: true, message: 'Vui lòng nhập số tiền giảm tối đa!' },
                  { type: 'number', min: 0, message: 'Số tiền giảm phải lớn hơn 0!' },
               ]}
            >
               <Input type="number" min={0} addonAfter="VNĐ" placeholder="Nhập số tiền giảm tối đa" />
            </Form.Item>

            <Form.Item
               label="Số lượng sử dụng"
               name="voucher_usage_limit"
               rules={[
                  { required: true, message: 'Vui lòng nhập số lượng!' },
                  { type: 'number', min: 1, message: 'Số lượng phải lớn hơn 0!' },
               ]}
            >
               <Input type="number" min={1} placeholder="Nhập số lượng có thể sử dụng" />
            </Form.Item>

            <Form.Item
               label="Thời gian bắt đầu"
               name="voucher_valid_from"
               rules={[{ required: true, message: 'Vui lòng chọn thời gian bắt đầu!' }]}
            >
               <DatePicker
                  showTime
                  format="YYYY-MM-DD HH:mm:ss"
                  style={{ width: '100%' }}
                  placeholder="Chọn thời gian bắt đầu"
                  disabledDate={(current) => current && current < dayjs().startOf('day')}
               />
            </Form.Item>

            <Form.Item
               label="Thời gian kết thúc"
               name="voucher_valid_to"
               rules={[
                  { required: true, message: 'Vui lòng chọn thời gian kết thúc!' },
                  ({ getFieldValue }) => ({
                     validator(_, value) {
                        if (
                           !value ||
                           !getFieldValue('voucher_valid_from') ||
                           value.isAfter(getFieldValue('voucher_valid_from'))
                        ) {
                           return Promise.resolve();
                        }
                        return Promise.reject(new Error('Thời gian kết thúc phải sau thời gian bắt đầu!'));
                     },
                  }),
               ]}
            >
               <DatePicker
                  showTime
                  format="YYYY-MM-DD HH:mm:ss"
                  style={{ width: '100%' }}
                  placeholder="Chọn thời gian kết thúc"
                  disabledDate={(current) => {
                     const validFrom = form.getFieldValue('voucher_valid_from');
                     return current && (current < dayjs().startOf('day') || (validFrom && current < validFrom));
                  }}
               />
            </Form.Item>

            <Form.Item
               label="Người tạo"
               name="voucher_created_by"
               rules={[{ required: true, message: 'Vui lòng chọn người tạo!' }]}
            >
               <Select
                  showSearch
                  placeholder="Chọn nhân viên"
                  optionFilterProp="children"
                  loading={loading}
                  disabled={!isCreate}
                  filterOption={(input, option) => (option?.label ?? '').toLowerCase().includes(input.toLowerCase())}
                  options={employees?.map((emp) => ({
                     value: emp.employee_id,
                     label: `${emp.employee_full_name} (${emp.employee_email})`,
                     search: `${emp.employee_full_name} ${emp.employee_email} ${emp.employee_phone}`,
                  }))}
               />
            </Form.Item>
         </Form>
      </Modal>
   );
}
