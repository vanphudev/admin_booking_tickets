import { Button, Card, Popconfirm, Avatar, App } from 'antd';
import Table, { ColumnsType } from 'antd/es/table';
import { useState, useEffect } from 'react';

import { IconButton, Iconify } from '@/components/icon';
import vehicleAPI from '@/redux/api/services/vehicleAPI';
import ProTag from '@/theme/antd/components/tag';

import { Vehicle } from './entity';
import { VehicleModal, type VehicleModalProps } from './vehicleModal';

const DEFAULT_VEHICLE_VALUE: Vehicle = {
   id: 0,
   code: '',
   name: '',
   capacity: 0,
   isLocked: 0,
   images: [],
};
function transformApiResponseToVehicle(apiResponse: any): Vehicle {
   return {
      id: apiResponse.vehicle_id,
      code: apiResponse.vehicle_code,
      name: apiResponse.vehicle_license_plate,
      model: apiResponse.vehicle_model,
      brand: apiResponse.vehicle_brand,
      capacity: apiResponse.vehicle_capacity,
      manufactureYear: apiResponse.vehicle_manufacture_year,
      color: apiResponse.vehicle_color,
      description: apiResponse.vehicle_description,
      isLocked: apiResponse.is_locked === 1 ? 1 : 0,
      lastLockAt: apiResponse.last_lock_at || '',
      createdAt: apiResponse.created_at,
      updatedAt: apiResponse.updated_at,
      mapVehicleLayoutId: apiResponse.map_vehicle_layout_id,
      officeId: apiResponse.office_id,
      vehicleTypeId: apiResponse.vehicle_type_id,
      images: apiResponse.vehicle_to_vehicleImage?.map((image: any) => image.vehicle_image_url) || [],
   };
}

export default function VehiclePage() {
   const [loading, setLoading] = useState(true);
   const [vehicles, setVehicles] = useState<Vehicle[]>([]);
   const { notification } = App.useApp();
   const [modalProps, setModalProps] = useState<VehicleModalProps>({
      formValue: DEFAULT_VEHICLE_VALUE,
      title: '',
      show: false,
      isCreate: true,
      onOk: () => handleModalClose(),
      onCancel: () => handleModalClose(),
   });

   useEffect(() => {
      loadVehicles();
   }, []);

   const loadVehicles = () => {
      setLoading(true);
      vehicleAPI
         .getVehicles()
         .then((response) => {
            console.log('Response from API:', response); // Thêm log để kiểm tra
            if (response && Array.isArray(response)) {
               setVehicles(response);
               console.log('setting ', response);
            } else {
               console.error('Invalid response format:', response);
               setVehicles([]);
            }
         })
         .catch((error) => {
            console.error('Error loading vehicles:', error);
            setVehicles([]);
         })
         .finally(() => {
            setLoading(false);
         });
   };

   const handleModalClose = () => {
      setModalProps((prev) => ({ ...prev, show: false }));
   };

   const handleCreate = () => {
      setModalProps({
         formValue: DEFAULT_VEHICLE_VALUE,
         title: 'Thêm mới xe',
         show: true,
         isCreate: true,
         onOk: () => handleModalClose(),
         onCancel: () => handleModalClose(),
      });
   };

   const handleEdit = (record: Vehicle) => {
      setModalProps({
         formValue: record,
         title: 'Cập nhật xe',
         show: true,
         isCreate: false,
         onOk: () => handleModalClose(),
         onCancel: () => handleModalClose(),
      });
   };

   const handleDelete = (id: number) => {
      vehicleAPI.deleteVehicle(id.toString()).then((res) => {
         if (res && res.status === 200) {
            notification.success({
               message: 'Xóa xe thành công!',
               duration: 3,
            });
            loadVehicles();
         } else {
            notification.error({
               message: 'Xóa xe thất bại!',
               duration: 3,
            });
         }
      });
   };

   const columns: ColumnsType<Vehicle> = [
      {
         title: 'Mã xe',
         dataIndex: 'code',
         width: 120,
      },
      {
         title: 'Biển số',
         dataIndex: 'name',
         width: 120,
      },
      {
         title: 'Model',
         dataIndex: 'model',
         width: 120,
      },
      {
         title: 'Hãng xe',
         dataIndex: 'brand',
         width: 120,
      },
      {
         title: 'Số ghế',
         dataIndex: 'capacity',
         width: 100,
      },
      {
         title: 'Năm SX',
         dataIndex: 'manufactureYear',
         width: 100,
      },
      {
         title: 'Màu xe',
         dataIndex: 'color',
         width: 100,
      },
      {
         title: 'Trạng thái',
         dataIndex: 'isLocked',
         width: 120,
         render: (isLocked: number) => (
            <ProTag color={isLocked ? 'error' : 'success'}>{isLocked ? 'Đã khóa' : 'Hoạt động'}</ProTag>
         ),
      },
      {
         title: 'Hình ảnh',
         dataIndex: 'images',
         width: 150,
         render: (images) => (
            <Avatar.Group max={{ count: 3 }} size="large">
               {images && images.length > 0 ? (
                  images.map((image: string, index: number) => (
                     <Avatar key={index} src={image} alt={`Vehicle Image ${index + 1}`} />
                  ))
               ) : (
                  <ProTag color="default">No Image</ProTag>
               )}
            </Avatar.Group>
         ),
      },
      {
         title: 'Thao tác',
         fixed: 'right',
         width: 120,
         render: (_, record) => (
            <div className="flex gap-2">
               <IconButton onClick={() => handleEdit(record)}>
                  <Iconify icon="solar:pen-bold-duotone" />
               </IconButton>
               <Popconfirm title="Bạn có chắc chắn muốn xóa?" onConfirm={() => handleDelete(record.id)}>
                  <IconButton>
                     <Iconify icon="mingcute:delete-2-fill" className="text-error" />
                  </IconButton>
               </Popconfirm>
            </div>
         ),
      },
   ];

   return (
      <Card
         title="Bus List"
         extra={
            <Button type="primary" onClick={handleCreate}>
               Thêm mới
            </Button>
         }
      >
         <Table rowKey="id" columns={columns} dataSource={vehicles} loading={loading} scroll={{ x: 'max-content' }} />
         <VehicleModal {...modalProps} />
      </Card>
   );
}
