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
import { Form, Modal, Input, Select, DatePicker, App } from 'antd';
import { useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { ThunkDispatch } from '@reduxjs/toolkit';
import { AnyAction } from 'redux';
import dayjs from 'dayjs';

import { RootState } from '@/redux/stores/store';
import employeeAPI from '@/redux/api/services/employeeAPI';
import { fetchOffices } from '@/redux/slices/officeSlice';
import { fetchEmployeeTypes } from '@/redux/slices/employeeTypeSlice';
import { Employee, EmployeeFormValues } from './entity';
import { useEffect, useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import dayjs from 'dayjs';
import { RootState } from '@/redux/stores/store';
import employeeAPI from '@/redux/api/services/employeeAPI';
// import { fetchOffices } from '@/redux/slices/officeSlice';
import { Employee, EmployeeFormValues } from './entity';
import officeAPI from '@/redux/api/services/officeAPI';
import employeeTypeAPI from '@/redux/api/services/employeeTypeAPI';
import { setOfficesSlice } from '@/redux/slices/officeSlice';
import { setEmployeeTypesSlice } from '@/redux/slices/employeeTypeSlice';
import { Office } from '@pages/management/office/entity';
import { EmployeeType } from '../employeeType/entity';

const { Option } = Select;

interface EmployeeModalProps {
   formValue: Partial<Employee>;
   title: string;
   show: boolean;
   onOk: () => void;
   onCancel: () => void;
   isCreate: boolean;
}

type AppThunkDispatch = ThunkDispatch<RootState, any, AnyAction>;

export function EmployeeModal({ 
   formValue, 
   title, 
   show, 
   onOk, 
   onCancel, 
   isCreate 
}: EmployeeModalProps) {
   const [form] = Form.useForm<EmployeeFormValues>();
   const { notification } = App.useApp();
   const dispatch = useDispatch<AppThunkDispatch>();

export function EmployeeModal({ formValue, title, show, onOk, onCancel, isCreate }: EmployeeModalProps) {
   const [form] = Form.useForm<EmployeeFormValues>();
   const { notification } = App.useApp();
   const dispatch = useDispatch();
   const [loading, setLoading] = useState(false);
   const [error, setError] = useState(null);
   // Lấy data từ redux store
   const { offices, loading: officeLoading } = useSelector((state: RootState) => state.office);
   const { employeeTypes, loading: typeLoading } = useSelector((state: RootState) => state.employeeType);

   // Fetch data khi mở modal
   useEffect(() => {
      if (show) {
         dispatch(fetchEmployeeTypes());
         dispatch(fetchOffices());
   // useEffect(() => {
   //    if (show) {
   //       dispatch(fetchOffices());
   //       dispatch(fetchEmployeeTypes());
   //    }
   // }, [dispatch, show]);
   function transformApiResponseToOffice(apiResponse: any): Office {
      return {
         id: apiResponse.office_id,
         name: apiResponse.office_name,
         phone: apiResponse.office_phone,
         fax: apiResponse.office_fax,
         description: apiResponse.office_description,
         latitude: apiResponse.office_latitude,
         longitude: apiResponse.office_longitude,
         mapUrl: apiResponse.office_map_url,
         isLocked: apiResponse.is_locked === 1 ? 1 : 0,
         lastLockAt: apiResponse.last_lock_at || '',
         createdAt: apiResponse.created_at,
         updatedAt: apiResponse.updated_at,
         Address: {
            province:
               apiResponse?.office_belongto_ward?.ward_belongto_district?.district_belongto_province?.province_id,
            district: apiResponse?.office_belongto_ward?.ward_belongto_district?.district_id,
            ward: apiResponse?.office_belongto_ward?.ward_id,
            street: apiResponse?.office_address,
         },
         images: apiResponse?.office_to_officeImage.map((image: any) => image.office_image_url),
      };
   }
   function transformApiResponseToEmployeeType(apiResponse: any): EmployeeType {
      return {
         employee_type_id: apiResponse.employee_type_id,
         employee_type_name: apiResponse.employee_type_name,
         employee_type_description: apiResponse.employee_type_description,
         created_at: apiResponse.created_at,
         updated_at: apiResponse.updated_at,
      };
   }
   useEffect(() => {
      if (show) {
         setLoading(true);
         Promise.all([
            officeAPI.getOffices().then((res: any) => {
               dispatch(setOfficesSlice(res.map(transformApiResponseToOffice)));
            }),
            employeeTypeAPI.getEmployeeTypes().then((res: any) => {
               dispatch(setEmployeeTypesSlice(res.map(transformApiResponseToEmployeeType)));
            }),
         ])
            .catch((error) => {
               setError(error);
            })
            .finally(() => {
               setLoading(false);
            });
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
            // ...values,
            // employee_birthday: values.employee_birthday?.format('YYYY-MM-DD'),
            employee_full_name: values.employee_full_name,
            employee_email: values.employee_email,
            employee_phone: values.employee_phone,
            employee_username: values.employee_username,
            employee_birthday: values.employee_birthday?.format('YYYY-MM-DD') || '',
            employee_password: values.employee_password,
            employee_gender: values.employee_gender,
            // office_id: values.employee_belongto_office?.id,
            // employee_type_id: values.employee_belongto_employeeType?.employee_type_id,
            office_id: values.office_id,
            employee_type_id: values.employee_type_id,
         };
         console.log('Submit Data:', submitData);
         if (isCreate) {
            const response = await employeeAPI.createEmployee(submitData);
            console.log(response);
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
         <Form<EmployeeFormValues> form={form} layout="horizontal" labelCol={{ span: 6 }} wrapperCol={{ span: 16 }}>
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
                     <Option key={office.id} value={office.id}>
                        {office.name}
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
               label="Office"
               name="office_id"
               rules={[{ required: true, message: 'Vui lòng chọn loại bài viết!' }]}
            >
               <Select
                  size="large"
                  placeholder="Chọn loại bài viết"
                  options={offices?.map((type) => ({
                     value: type.id,
                     label: type.name,
                  }))}
                  loading={officeLoading}
                  disabled={officeLoading}
               />
            </Form.Item>
            <Form.Item
               label="Employees"
               name="employee_type_id"
               rules={[{ required: true, message: 'Vui lòng chọn loại nhân viên!' }]}
            >
               <Select
                  size="large"
                  placeholder="Chọn loại nhân viên"
                  options={employeeTypes?.map((type) => ({
                     value: type.employee_type_id,
                     label: type.employee_type_name,
                  }))}
                  loading={typeLoading}
                  disabled={typeLoading}
               />
            </Form.Item>
         </Form>
      </Modal>
   );
}
