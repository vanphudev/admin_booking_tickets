import { Button, Card, Popconfirm, App } from 'antd';
import Table, { ColumnsType } from 'antd/es/table';
import dayjs from 'dayjs';
import { useState, useEffect } from 'react';

import { IconButton, Iconify } from '@/components/icon';
import employeeAPI from '@/redux/api/services/employeeAPI';
import ProTag from '@/theme/antd/components/tag';
import { Employee } from './entity';
import { EmployeeModal } from './employeeModal';

const formatDateTime = (value?: string): string => {
   if (!value) return '';
   return dayjs(value).format('DD/MM/YYYY');
};

const DEFAULT_EMPLOYEE_VALUE: Employee = {
   employee_id: 0,
   employee_full_name: '',
   employee_email: '',
   employee_phone: '',
   employee_username: '',
   employee_birthday: '',
   employee_gender: 1,
   is_first_activation: 1,
   is_locked: 0,
   office_id: 0,
   employee_type_id: 0,
};

export default function EmployeePage() {
   const { notification } = App.useApp();
   const [loading, setLoading] = useState(false);
   const [employees, setEmployees] = useState<Employee[]>([]);

   const fetchEmployeeList = async () => {
      setLoading(true);
      try {
         const data = await employeeAPI.getEmployees();
         setEmployees(data || []);
      } catch (error) {
         notification.error({
            message: 'Lỗi khi tải danh sách nhân viên',
            duration: 3,
         });
      } finally {
         setLoading(false);
      }
   };

   useEffect(() => {
      fetchEmployeeList();
   }, []);

   const [employeeModalProps, setEmployeeModalProps] = useState({
      formValue: DEFAULT_EMPLOYEE_VALUE,
      title: 'New',
      show: false,
      isCreate: true,
      onOk: () => {
         setEmployeeModalProps((prev) => ({ ...prev, show: false }));
         fetchEmployeeList();
      },
      onCancel: () => {
         setEmployeeModalProps((prev) => ({ ...prev, show: false }));
      },
   });

   const columns: ColumnsType<Employee> = [
      {
         title: 'Họ và tên',
         dataIndex: 'employee_full_name',
         fixed: 'left',
         width: 200,
      },
      {
         title: 'Email',
         dataIndex: 'employee_email',
         width: 200,
      },
      {
         title: 'Số điện thoại',
         dataIndex: 'employee_phone',
         width: 120,
      },
      {
         title: 'Tên đăng nhập',
         dataIndex: 'employee_username',
         width: 150,
      },
      {
         title: 'Ngày sinh',
         dataIndex: 'employee_birthday',
         width: 120,
         render: (value) => formatDateTime(value),
      },
      {
         title: 'Giới tính',
         dataIndex: 'employee_gender',
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
         title: 'Trạng thái',
         key: 'status',
         width: 150,
         render: (_, record) => (
            <div className="flex gap-2">
               <ProTag color={record.is_first_activation ? 'warning' : 'success'}>
                  {record.is_first_activation ? 'Chưa kích hoạt' : 'Đã kích hoạt'}
               </ProTag>
               <ProTag color={record.is_locked ? 'error' : 'success'}>
                  {record.is_locked ? 'Đã khóa' : 'Hoạt động'}
               </ProTag>
            </div>
         ),
      },
      {
         title: 'Văn phòng',
         width: 200,
         render: (_, record) => record.employee_belongto_office?.office_name,
      },
      {
         title: 'Loại nhân viên',
         width: 150,
         render: (_, record) => record.employee_belongto_employeeType?.employee_type_name,
      },
      {
         title: 'Thời gian',
         key: 'timestamps',
         width: 300,
         render: (_, record) => (
            <div>
               <ProTag color="default">Tạo: {formatDateTime(record.created_at)}</ProTag>
               <ProTag color="default" style={{ marginLeft: 8 }}>
                  Cập nhật: {formatDateTime(record.updated_at)}
               </ProTag>
            </div>
         ),
      },
      {
         title: 'Thao tác',
         key: 'operation',
         fixed: 'right',
         width: 120,
         align: 'center',
         render: (_, record) => (
            <div className="flex w-full justify-center gap-2">
               <IconButton onClick={() => onEdit(record)}>
                  <Iconify icon="solar:pen-bold-duotone" size={18} />
               </IconButton>
               <Popconfirm
                  title="Xóa nhân viên?"
                  description="Bạn có chắc chắn muốn xóa nhân viên này?"
                  okText="Xóa"
                  cancelText="Hủy"
                  placement="left"
                  onConfirm={() => handleDelete(record.employee_id)}
               >
                  <IconButton>
                     <Iconify icon="mingcute:delete-2-fill" size={18} className="text-error" />
                  </IconButton>
               </Popconfirm>
            </div>
         ),
      },
   ];

   const onCreate = () => {
      setEmployeeModalProps((prev) => ({
         ...prev,
         show: true,
         title: 'Thêm Nhân Viên Mới',
         isCreate: true,
         formValue: DEFAULT_EMPLOYEE_VALUE,
      }));
   };

   const onEdit = (formValue: Employee) => {
      setEmployeeModalProps((prev) => ({
         ...prev,
         show: true,
         title: 'Chỉnh Sửa Nhân Viên',
         isCreate: false,
         formValue,
      }));
   };

   const handleDelete = async (employee_id: number) => {
      try {
         await employeeAPI.deleteEmployee(employee_id);
         notification.success({
            message: 'Xóa nhân viên thành công',
            duration: 3,
         });
         fetchEmployeeList();
      } catch (error) {
         notification.error({
            message: 'Lỗi khi xóa nhân viên',
            duration: 3,
         });
      }
   };

   return (
      <Card
         title="Danh Sách Nhân Viên"
         extra={
            <Button type="primary" onClick={onCreate}>
               Thêm mới
            </Button>
         }
      >
         <Table
            rowKey="employee_id"
            size="small"
            scroll={{ x: 'max-content' }}
            pagination={{
               size: 'default',
               total: employees?.length || 0,
               showSizeChanger: true,
               showQuickJumper: true,
               showTotal: (total) => `Tổng ${total} nhân viên`,
            }}
            columns={columns}
            dataSource={employees}
            loading={loading}
         />
         <EmployeeModal {...employeeModalProps} />
      </Card>
   );
}
