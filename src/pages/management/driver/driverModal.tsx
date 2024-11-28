import { Driver } from './entity';
import type { RcFile, UploadFile, UploadProps } from 'antd/es/upload/interface';
import { useEffect, useState } from 'react';
import { App, Form, Modal, Input, Radio, Space, Select, Upload, Spin, Tooltip } from 'antd';
import UploadIllustration from '@/components/upload/upload-illustration';
import driverAPI from '@/redux/api/services/driverAPI';
import MapModal from '@/components/GoogleMapIframe/GoogleMaps';

const { Search } = Input;

export type DriverModalProps = {
   formValue: Driver;
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
   const [fileList, setFileList] = useState<UploadFile[]>([]);
   const [previewOpen, setPreviewOpen] = useState(false);
   const [previewImage, setPreviewImage] = useState('');
   const [previewTitle, setPreviewTitle] = useState('');
   const [loading, setLoading] = useState(false);
   const [isModalOpen, setIsModalOpen] = useState(false);
   const [employees, setEmployees] = useState<any[]>([]);
   const handleOpenModal = () => setIsModalOpen(true);
   const handleCloseModal = () => setIsModalOpen(false);

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
                        name: image.name,
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
               driverId: formValue.driver_id,
               images: fileList.map((file) => file.originFileObj),
            };
            const combinedData = { ...formData, ...additionalData };
            if (isCreate) {
               setLoading(true);
               driverAPI
                  .createDriver(combinedData)
                  .then((res) => {
                     if (res && (res.status === 201 || res.status === 200)) {
                        notification.success({
                           message: 'Create Driver Success !',
                           duration: 3,
                        });
                        onOk();
                     }
                     if (res && (res.error === true || res.status === 400 || res.status === 404)) {
                        notification.warning({
                           message: 'Create Driver Failed ! Please try again',
                           duration: 3,
                        });
                     }
                  })
                  .catch((error) => {
                     notification.error({
                        message: `Create Driver Failed: ${error.message}`,
                        duration: 3,
                     });
                  })
                  .finally(() => {
                     setLoading(false);
                  });
            } else {
               // Trạng thái cập nhật. isCreate = false
               setLoading(true);
               driverAPI
                  .updateDriver(combinedData)
                  .then((res) => {
                     if (res && (res.status === 201 || res.status === 200)) {
                        notification.success({
                           message: 'Update Driver Success !',
                           duration: 3,
                        });
                        onOk();
                     }
                     if (res && (res.error === true || res.status === 400 || res.status === 404)) {
                        notification.warning({
                           message: 'Update Driver Failed ! Please try again',
                           duration: 3,
                        });
                     }
                  })
                  .catch((error) => {
                     notification.error({
                        message: `Update Driver Failed: ${error.message}`,
                        duration: 3,
                     });
                  })
                  .finally(() => {
                     setLoading(false);
                  });
            }
         })
         .catch((errorInfo) => {
            const errorFields = errorInfo.errorFields.map((field: any) => field.name.join(' '));
            notification.warning({
               message: `Validation Data: \n${errorFields}`,
               duration: 3,
            });
         });
   };

   const content = (
      <Form<Driver>
         initialValues={formValue}
         form={form}
         labelCol={{ span: 4 }}
         wrapperCol={{ span: 18 }}
         layout="horizontal"
         style={{ maxHeight: '70vh', overflowY: 'auto' }}
      >
         <Form.Item<Driver>
            label="Driver License Number"
            name="driver_license_number"
            rules={[{ required: true, message: 'Please enter the driver license number' }]}
         >
            <Input size="large" />
         </Form.Item>
         <Form.Item
            name="driver_experience_years"
            label="Experience Years"
            rules={[{ required: true, message: 'Please enter the experience years!' }]}
            style={{ width: '100%' }}
         >
            <Input type="number" placeholder="Enter capacity" />
         </Form.Item>
         <Form.Item<Driver>
            label="Employee"
            name={['driver_onetoOne_employee', 'employee_full_name']}
            rules={[{ required: true, message: 'Please select an employee' }]}
         >
            <Input size="large" placeholder="Employee" />
         </Form.Item>
         <Form.Item<Driver> label="Image">
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
               <img alt="example" style={{ width: '100%' }} src={previewImage} />
            </Modal>
         </Form.Item>
      </Form>
   );

   return (
      <>
         <MapModal isOpen={isModalOpen} onClose={handleCloseModal} onSaveLocation={() => {}} />
         <Modal title={title} open={show} onOk={handleOk} onCancel={onCancel} destroyOnClose width="60%" centered>
            {loading && (
               <Spin size="large" fullscreen tip={isCreate ? 'Creating...' : 'Updating...'}>
                  {content}
               </Spin>
            )}
            {content}
         </Modal>
      </>
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
