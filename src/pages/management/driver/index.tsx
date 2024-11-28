import { App, Button, Card, Popconfirm } from 'antd';
import Table, { ColumnsType } from 'antd/es/table';
import { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';

import { IconButton, Iconify } from '@/components/icon';
import driverAPI from '@/redux/api/services/driverAPI';
import { Driver } from './entity';
import { DriverModal } from './driverModal';
import { RootState } from '@/redux/stores/store';
import ProTag from '@/theme/antd/components/tag';

const DEFAULT_DRIVER: Driver = {
   driver_id: 0,
   driver_license_number: '',
   driver_experience_years: 0,
   employee_id: 0,
   employee: {
      employee_id: 0,
      employee_full_name: '',
      employee_email: '',
      employee_phone: '',
      employee_username: '',
      employee_gender: 1,
      is_locked: 0,
   },
};

export default function DriverPage() {
   const dispatch = useDispatch();
   const { notification } = App.useApp();
   const [loading, setLoading] = useState(false);
   const [drivers, setDrivers] = useState<Driver[]>([]);

   const [modalData, setModalData] = useState({
      formValue: DEFAULT_DRIVER,
      title: '',
      show: false,
      isCreate: true,
   });

   const fetchDriverList = async () => {
      setLoading(true);
      try {
         const data = await driverAPI.getDrivers();
         setDrivers(data || []);
      } catch (error: any) {
         notification.error({
            message: 'Lỗi khi tải danh sách tài xế',
            description: error.message,
         });
      } finally {
         setLoading(false);
      }
   };

   useEffect(() => {
      fetchDriverList();
   }, []);

   const handleCreate = () => {
      setModalData({
         formValue: DEFAULT_DRIVER,
         title: 'Thêm Tài Xế Mới',
         show: true,
         isCreate: true,
      });
   };

   const handleEdit = (record: Driver) => {
      setModalData({
         formValue: record,
         title: 'Chỉnh Sửa Tài Xế',
         show: true,
         isCreate: false,
      });
   };

   const handleDelete = async (driver_id: number) => {
      try {
         await driverAPI.deleteDriver(Number(driver_id));
         notification.success({
            message: 'Xóa tài xế thành công',
         });
         fetchDriverList();
      } catch (error: any) {
         notification.error({
            message: 'Lỗi khi xóa tài xế',
            description: error.message,
         });
      }
   };

   const columns: ColumnsType<Driver> = [
      {
         title: 'Họ và tên',
         dataIndex: ['employee', 'employee_full_name'],
         fixed: 'left',
         width: 200,
      },
      {
         title: 'Email',
         dataIndex: ['employee', 'employee_email'],
         width: 200,
      },
      {
         title: 'Số điện thoại',
         dataIndex: ['employee', 'employee_phone'],
         width: 150,
      },
      {
         title: 'Tên đăng nhập',
         dataIndex: ['employee', 'employee_username'],
         width: 150,
      },
      {
         title: 'Giới tính',
         dataIndex: ['employee', 'employee_gender'],
         width: 100,
         render: (value) => {
            const genderMap = {
               1: 'Nam',
               0: 'Nữ',
               [-1]: 'Khác',
            };
            return (
               <ProTag color={value === 1 ? 'blue' : value === 0 ? 'pink' : 'default'}>
                  {genderMap[value as keyof typeof genderMap]}
               </ProTag>
            );
         },
      },
      {
         title: 'Số GPLX',
         dataIndex: 'driver_license_number',
         width: 150,
      },
      {
         title: 'Kinh nghiệm (năm)',
         dataIndex: 'driver_experience_years',
         width: 150,
      },
      {
         title: 'Trạng thái',
         dataIndex: ['employee', 'is_locked'],
         width: 120,
         render: (value) => <ProTag color={value ? 'error' : 'success'}>{value ? 'Đã khóa' : 'Hoạt động'}</ProTag>,
      },
      {
         title: 'Thao tác',
         key: 'action',
         fixed: 'right',
         width: 120,
         render: (_, record) => (
            <div className="flex gap-2">
               <IconButton onClick={() => handleEdit(record)}>
                  <Iconify icon="solar:pen-bold-duotone" />
               </IconButton>
               <Popconfirm
                  title="Xóa tài xế"
                  description="Bạn có chắc muốn xóa tài xế này?"
                  onConfirm={() => handleDelete(record.driver_id)}
               >
                  <IconButton>
                     <Iconify icon="solar:trash-bin-trash-bold-duotone" className="text-error" />
                  </IconButton>
               </Popconfirm>
            </div>
         ),
      },
   ];

   return (
      <Card
         title="Danh sách tài xế"
         extra={
            <Button type="primary" onClick={handleCreate}>
               Thêm mới
            </Button>
         }
      >
         <Table
            columns={columns}
            dataSource={drivers}
            loading={loading}
            rowKey="driver_id"
            scroll={{ x: 1500 }}
            pagination={{
               showSizeChanger: true,
               showQuickJumper: true,
               showTotal: (total) => `Tổng ${total} tài xế`,
            }}
         />
         <DriverModal
            {...modalData}
            onCancel={() => setModalData((prev) => ({ ...prev, show: false }))}
            onOk={async () => {
               setModalData((prev) => ({ ...prev, show: false }));
               await fetchDriverList();
            }}
         />
      </Card>
   );
}
