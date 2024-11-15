import { useEffect, useState } from 'react';
import { Button, Table, Space, Popconfirm, App } from 'antd';
import { EditOutlined, DeleteOutlined, PlusOutlined } from '@ant-design/icons';
import { useDispatch } from 'react-redux';
import type { ColumnsType } from 'antd/es/table';
import dayjs from 'dayjs';

import { Employee } from './entity';
import { EmployeeModal } from './employeeModal';
import employeeAPI from '@/redux/api/services/employeeAPI';
import { ThunkDispatch } from '@reduxjs/toolkit';
import { AnyAction } from 'redux';
import { RootState } from '@/redux/stores/store';

type AppDispatch = ThunkDispatch<RootState, any, AnyAction>;

export function EmployeeList() {
   const [employees, setEmployees] = useState<Employee[]>([]);
   const [loading, setLoading] = useState(false);
   const [showModal, setShowModal] = useState(false);
   const [selectedEmployee, setSelectedEmployee] = useState<Partial<Employee> | null>(null);
   const [isCreate, setIsCreate] = useState(true);
   
   const dispatch = useDispatch<AppDispatch>();
   const { notification } = App.useApp();

   const loadEmployees = async () => {
      try {
         setLoading(true);
         const response = await employeeAPI.getEmployees();
         if (response.success && response.data) {
            setEmployees(response.data);
         } else {
            notification.error({
               message: response.message || 'Không thể tải danh sách nhân viên',
            });
         }
      } catch (error: any) {
         notification.error({
            message: 'Lỗi!',
            description: error.message || 'Không thể tải danh sách nhân viên',
         });
      } finally {
         setLoading(false);
      }
   };

   useEffect(() => {
      loadEmployees();
   }, []);

   const handleDelete = async (employeeId: number) => {
      try {
         const response = await employeeAPI.deleteEmployee(employeeId);
         if (response.success) {
            notification.success({
               message: response.message || 'Xóa nhân viên thành công!',
            });
            loadEmployees();
         } else {
            notification.error({
               message: response.message || 'Không thể xóa nhân viên',
            });
         }
      } catch (error: any) {
         notification.error({
            message: 'Lỗi!',
            description: error.message || 'Không thể xóa nhân viên',
         });
      }
   };

   const handleCreate = () => {
      setIsCreate(true);
      setSelectedEmployee(null);
      setShowModal(true);
   };

   const handleEdit = (record: Employee) => {
      setIsCreate(false);
      setSelectedEmployee(record);
      setShowModal(true);
   };

   const handleModalOk = () => {
      setShowModal(false);
      loadEmployees();
   };

   const handleModalCancel = () => {
      setShowModal(false);
      setSelectedEmployee(null);
   };

   const columns: ColumnsType<Employee> = [
      {
         title: 'Họ và tên',
         dataIndex: 'employee_full_name',
         key: 'employee_full_name',
      },
      {
         title: 'Email',
         dataIndex: 'employee_email',
         key: 'employee_email',
      },
      {
         title: 'Số điện thoại',
         dataIndex: 'employee_phone',
         key: 'employee_phone',
      },
      {
         title: 'Tên đăng nhập',
         dataIndex: 'employee_username',
         key: 'employee_username',
      },
      {
         title: 'Ngày sinh',
         dataIndex: 'employee_birthday',
         key: 'employee_birthday',
         render: (date: string) => dayjs(date).format('DD/MM/YYYY'),
      },
      {
         title: 'Giới tính',
         dataIndex: 'employee_gender',
         key: 'employee_gender',
         render: (gender: number) => {
            switch (gender) {
               case 1:
                  return 'Nam';
               case 0:
                  return 'Nữ';
               default:
                  return 'Khác';
            }
         },
      },
      {
         title: 'Thao tác',
         key: 'action',
         render: (_, record) => (
            <Space size="middle">
               <Button
                  type="primary"
                  icon={<EditOutlined />}
                  onClick={() => handleEdit(record)}
               >
                  Sửa
               </Button>
               <Popconfirm
                  title="Xóa nhân viên"
                  description="Bạn có chắc chắn muốn xóa nhân viên này?"
                  onConfirm={() => handleDelete(record.employee_id)}
                  okText="Có"
                  cancelText="Không"
               >
                  <Button type="primary" danger icon={<DeleteOutlined />}>
                     Xóa
                  </Button>
               </Popconfirm>
            </Space>
         ),
      },
   ];

   return (
      <div>
         <div style={{ marginBottom: 16 }}>
            <Button
               type="primary"
               icon={<PlusOutlined />}
               onClick={handleCreate}
            >
               Thêm nhân viên
            </Button>
         </div>

         <Table<Employee>
            columns={columns}
            dataSource={employees}
            rowKey="employee_id"
            loading={loading}
         />

         <EmployeeModal
            title={isCreate ? 'Thêm nhân viên' : 'Sửa nhân viên'}
            show={showModal}
            onOk={handleModalOk}
            onCancel={handleModalCancel}
            formValue={selectedEmployee || {}}
            isCreate={isCreate}
         />
      </div>
   );
}
