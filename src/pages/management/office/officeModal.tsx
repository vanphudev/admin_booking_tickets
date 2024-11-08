import { PlusOutlined } from '@ant-design/icons';
import { App, Form, Modal, Input, Radio, Space, Select, Flex, Typography, Upload } from 'antd';
import { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';

import officeAPI from '@/redux/api/services/officeAPI';
import { RootState } from '@/redux/stores/store';

import { Office } from './entity';

import type { RcFile, UploadFile, UploadProps } from 'antd/es/upload/interface';

export type OfficeModalProps = {
   formValue: Office;
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

export function OfficeModal({ formValue, title, show, onOk, onCancel, isCreate }: OfficeModalProps) {
   const [form] = Form.useForm();
   const { notification } = App.useApp();
   const [fileList, setFileList] = useState<UploadFile[]>([]);
   const [previewOpen, setPreviewOpen] = useState(false);
   const [previewImage, setPreviewImage] = useState('');
   const [previewTitle, setPreviewTitle] = useState('');

   const { provinces, districts, wards } = useSelector((state: RootState) => state.address);

   const [selectedProvince, setSelectedProvince] = useState(null);
   const [selectedDistrict, setSelectedDistrict] = useState(null);
   const [selectedWard, setSelectedWard] = useState(null);

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
         form.setFieldsValue(formValue); // Đặt giá trị form khi show là true
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
         if (!isCreate) {
            setSelectedProvince(formValue.Address?.province as any);
            setSelectedDistrict(formValue.Address?.district as any);
            setSelectedWard(formValue.Address?.ward as any);
         }
      } else {
         form.resetFields();
         setSelectedProvince(null);
         setSelectedDistrict(null);
         setSelectedWard(null);
         form.setFieldsValue({
            address: {
               district: null,
               ward: null,
               province: null,
            },
         });
         setFileList([]);
      }
   }, [show, formValue, form, isCreate]);

   const handleProvinceChange = (value: any) => {
      setSelectedProvince(value);
      setSelectedDistrict(null);
      setSelectedWard(null);
      form.setFieldsValue({
         address: {
            district: null,
            ward: null,
         },
      });
   };

   const handleDistrictChange = (value: any) => {
      setSelectedDistrict(value);
      setSelectedWard(null);
      form.setFieldsValue({
         address: {
            ward: null,
         },
      });
   };

   const handleWardChange = (value: any) => {
      setSelectedWard(value);
   };

   const handleOk = () => {
      form
         .validateFields()
         .then((formData) => {
            const additionalData = {
               latitude: 0,
               longitude: 0,
               images: fileList,
               wardId: selectedWard,
               map_url: formData.mapUrl,
               address: formData.Address.street,
            };
            const combinedData = { ...formData, ...additionalData };
            if (isCreate) {
               officeAPI.createOffice(combinedData).then((res) => {
                  if (res && (res.status === 201 || res.status === 200)) {
                     notification.success({
                        message: 'Create Office Success !',
                        duration: 3,
                     });
                     onOk();
                  }
               });
            } else {
               officeAPI.updateOffice(combinedData).then((res) => {
                  if (res && (res.status === 201 || res.status === 200)) {
                     notification.success({
                        message: 'Update Office Success !',
                        duration: 3,
                     });
                     onOk();
                  }
               });
            }
         })
         .catch((errorInfo) => {
            console.error('Validation Failed:', errorInfo);
         });
   };

   const handleCancel = () => {
      onCancel();
      setFileList([]);
   };
   return (
      <Modal title={title} open={show} onOk={handleOk} onCancel={handleCancel} width="60%" centered>
         <Form<Office>
            initialValues={formValue}
            form={form}
            labelCol={{ span: 4 }}
            wrapperCol={{ span: 18 }}
            layout="horizontal"
            style={{ maxHeight: '70vh', overflowY: 'auto' }}
         >
            <Form.Item<Office> label="Name" name="name" rules={[{ required: true, message: 'Please enter the name' }]}>
               <Input size="large" />
            </Form.Item>
            <Form.Item label="Contact Information">
               <Space.Compact style={{ display: 'flex', gap: '10px' }}>
                  <Form.Item<Office>
                     name="phone"
                     style={{ flex: 1 }}
                     rules={[
                        { required: true, message: 'Please enter the phone number' },
                        { pattern: /^[0-9]+$/, message: 'Please enter a valid phone number' },
                     ]}
                  >
                     <Input size="large" placeholder="Phone" />
                  </Form.Item>
                  <Form.Item<Office>
                     name="fax"
                     style={{ flex: 1 }}
                     rules={[{ required: true, message: 'Please enter the fax number' }]}
                  >
                     <Input size="large" placeholder="Fax" />
                  </Form.Item>
               </Space.Compact>
            </Form.Item>
            <Form.Item<Office>
               label="Google Maps URL"
               name="mapUrl"
               rules={[{ required: true, message: 'Please enter the Google Maps URL' }]}
            >
               <Input size="large" addonBefore="https://" />
            </Form.Item>
            <Form.Item<Office>
               label="Description"
               name="description"
               rules={[{ required: true, message: 'Please enter the description' }]}
            >
               <Input.TextArea size="large" />
            </Form.Item>
            <Form.Item<Office>
               label="Locked"
               name="isLocked"
               rules={[{ required: true, message: 'Please select a status' }]}
            >
               <Radio.Group size="large" optionType="button" buttonStyle="solid">
                  <Radio value={1}>Enable</Radio>
                  <Radio value={0}>Disable</Radio>
               </Radio.Group>
            </Form.Item>
            <Form.Item<Office> label="Address" rules={[{ required: true, message: 'Please enter the address' }]}>
               <Space direction="vertical" style={{ width: '100%' }}>
                  <Form.Item<Office>
                     name={['Address', 'street']}
                     rules={[{ required: true, message: 'Please enter the street address' }]}
                  >
                     <Input size="large" placeholder="Enter Address" />
                  </Form.Item>
                  <Flex align="center" gap={16} style={{ width: '100%' }}>
                     <div style={{ flex: 1 }}>
                        <Typography.Text>Tỉnh/Thành phố:</Typography.Text>
                        <Form.Item<Office>
                           name={['Address', 'province']}
                           rules={[{ required: true, message: 'Please select a province' }]}
                        >
                           <Select
                              size="large"
                              showSearch
                              optionFilterProp="label"
                              style={{ width: '100%', cursor: 'pointer' }}
                              placeholder="Select Province"
                              value={selectedProvince}
                              onChange={handleProvinceChange}
                              options={
                                 provinces && provinces.length > 0
                                    ? provinces?.map((province: any) => ({
                                         label: province.province_name,
                                         value: province.province_id,
                                      }))
                                    : []
                              }
                              {...(provinces?.length === 0 && { loading: true })}
                           />
                        </Form.Item>
                     </div>
                     <div style={{ flex: 1, marginBottom: 0 }}>
                        <Typography.Text>Quận/huyện:</Typography.Text>
                        <Form.Item<Office>
                           name={['Address', 'district']}
                           rules={[{ required: true, message: 'Please select a district' }]}
                        >
                           <Select
                              size="large"
                              showSearch
                              optionFilterProp="label"
                              style={{ width: '100%', cursor: 'pointer' }}
                              placeholder="Select District"
                              onChange={handleDistrictChange}
                              options={
                                 districts && districts.length > 0
                                    ? districts
                                         .filter((district: any) => district.province_id === selectedProvince)
                                         .map((district: any) => ({
                                            label: district.district_name,
                                            value: district.district_id,
                                            selected: !isCreate && district.district_id === formValue.Address?.district,
                                         }))
                                    : []
                              }
                              disabled={!selectedProvince}
                              {...((districts?.length === 0 || !selectedProvince) && { loading: true })}
                              value={selectedDistrict}
                           />
                        </Form.Item>
                     </div>
                     <div style={{ flex: 1, marginBottom: 0 }}>
                        <Typography.Text>Xã/phường:</Typography.Text>
                        <Form.Item<Office>
                           name={['Address', 'ward']}
                           rules={[{ required: true, message: 'Please select a valid ward' }]}
                        >
                           <Select
                              size="large"
                              showSearch
                              optionFilterProp="label"
                              style={{ width: '100%', cursor: 'pointer' }}
                              placeholder="Select Ward"
                              value={selectedWard}
                              onChange={handleWardChange}
                              options={
                                 wards && wards.length > 0
                                    ? wards
                                         .filter((ward: any) => ward.district_id === selectedDistrict)
                                         .map((ward: any) => ({
                                            label: ward.ward_name,
                                            value: ward.ward_id,
                                         }))
                                    : []
                              }
                              disabled={!selectedDistrict}
                              {...((wards?.length === 0 || !selectedDistrict) && { loading: true })}
                           />
                        </Form.Item>
                     </div>
                  </Flex>
               </Space>
            </Form.Item>
            <Form.Item<Office> label="Image">
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
               <Modal open={previewOpen} title={previewTitle} footer={null} onCancel={handleCancelUpload}>
                  <img alt="example" style={{ width: '100%' }} src={previewImage} />
               </Modal>
            </Form.Item>
         </Form>
      </Modal>
   );
}
