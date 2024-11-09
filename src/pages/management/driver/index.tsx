import { App, Button, Card, Popconfirm, Avatar } from 'antd';
import Table, { ColumnsType } from 'antd/es/table';
import { useState, useEffect } from 'react';
import { useDispatch } from 'react-redux';

import { IconButton, Iconify } from '@/components/icon';
import driverAPI from '@/redux/api/services/driverAPI';
import ProTag from '@/theme/antd/components/tag';
import { DriverModal } from './driverModal';
import { DropdownProps } from 'antd/es/dropdown/dropdown';
export interface Driver {
   driver_id?: number;
   driver_license_number: string;
   driver_experience_years: number;
   created_at?: string;
   updated_at?: string;
   employee_id?: number;
   Employee?: {
      employee_full_name: string;
      employee_email: string;
      employee_phone: string;
      employee_username: string;
   };
}

const DEFAULT_DRIVER: Driver = {
   driver_license_number: '',
   driver_experience_years: 0,
   Employee: {
      employee_full_name: '',
      employee_email: '',
      employee_phone: '',
      employee_username: '',
   },
};

export default function DriverPage() {
   const dispatch = useDispatch();
   const { notification } = App.useApp();
   const [loading, setLoading] = useState(true);
   const [drivers, setDrivers] = useState<Driver[]>([]);

   useEffect(() => {
      driverAPI
         .getDrivers()
         .then((res: any) => {
            setDrivers(res);
            setLoading(false);
         })
         .catch((error) => {
            notification.error({
               message: 'Có lỗi xảy ra khi tải danh sách tài xế',
               description: error.message,
            });
            setLoading(false);
         });
   }, [notification]);

   const columns: ColumnsType<Driver> = [
      {
         title: 'Họ và tên',
         dataIndex: ['Employee', 'employee_full_name'],
         fixed: 'left',
      },
      {
         title: 'Email',
         dataIndex: ['Employee', 'employee_email'],
      },
      {
         title: 'Số điện thoại',
         dataIndex: ['Employee', 'employee_phone'],
      },
      {
         title: 'Tên đăng nhập',
         dataIndex: ['Employee', 'employee_username'],
      },
      {
         title: 'Số GPLX',
         dataIndex: 'driver_license_number',
      },
      {
         title: 'Kinh nghiệm (năm)',
         dataIndex: 'driver_experience_years',
      },
      {
         title: 'Thao tác',
         key: 'action',
         fixed: 'right',
         width: 100,
         render: (_, record) => (
            <div className="flex gap-2">
               <IconButton onClick={() => handleEdit(record)}>
                  <Iconify icon="solar:pen-bold-duotone" />
               </IconButton>
               <Popconfirm
                  title="Xóa tài xế"
                  description="Bạn có chắc muốn xóa tài xế này?"
                  onConfirm={() => handleDelete(record.driver_id!)}
               >
                  <IconButton>
                     <Iconify icon="solar:trash-bin-trash-bold-duotone" className="text-error" />
                  </IconButton>
               </Popconfirm>
            </div>
         ),
      },
   ];

   const [modalData, setModalData] = useState({
      formValue: DEFAULT_DRIVER,
      title: '',
      show: false,
      isCreate: true,
   });

   const handleCreate = () => {
      setModalData({
         title: 'Thêm tài xế mới',
         show: true,
         isCreate: true,
         formValue: DEFAULT_DRIVER,
      });
   };

   const handleEdit = (record: Driver) => {
      setModalData({
         title: 'Sửa thông tin tài xế',
         show: true,
         isCreate: false,
         formValue: record,
      });
   };

   const handleDelete = async (id: number) => {
      try {
         await driverAPI.deleteDriver(id.toString());
         notification.success({
            message: 'Xóa tài xế thành công',
         });
         // Refresh data
         const newData = await driverAPI.getDrivers();
         setDrivers(newData);
      } catch (error: any) {
         notification.error({
            message: 'Có lỗi xảy ra',
            description: error.message,
         });
      }
   };

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
               showTotal: (total) => `Tổng ${total} bản ghi`,
            }}
         />
         <DriverModal
            {...modalData}
            onCancel={() => setModalData((prev) => ({ ...prev, show: false }))}
            onOk={async () => {
               setModalData((prev) => ({ ...prev, show: false }));
               const newData = await driverAPI.getDrivers();
               setDrivers(newData);
            }}
         />
      </Card>
   );
}
