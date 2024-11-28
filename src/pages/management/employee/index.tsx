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
import { Button, Card, Popconfirm, App, Typography, Spin, Empty, Avatar, Alert, Space, InputRef } from 'antd';
import { TableColumnType, Input } from 'antd';
import { createStyles } from 'antd-style';
import type { FilterDropdownProps } from 'antd/es/table/interface';
import Highlighter from 'react-highlight-words';
import Table, { ColumnsType } from 'antd/es/table';
import dayjs from 'dayjs';
import { useRef, useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { IconButton, Iconify } from '@/components/icon';
import employeeAPI from '@/redux/api/services/employeeAPI';
import ProTag from '@/theme/antd/components/tag';
import { Employee } from './entity';
import { EmployeeModal } from './employeeModal';
import { setEmployeesSlice } from '@/redux/slices/employeeSlice';
import { RootState } from '@/redux/stores/store';
import { SearchOutlined } from '@ant-design/icons';
const formatDateTime = (value?: string): string => {
   if (!value) return '';
   return dayjs(value).format('DD/MM/YYYY');
};

const { Text } = Typography;
const useStyle = createStyles(({ css }) => ({
   customTable: css`
      .ant-table {
         .ant-table-container {
            .ant-table-body,
            .ant-table-content {
               scrollbar-width: thin;
               scrollbar-color: #939393 transparent;
               scrollbar-gutter: stable;
            }
         }
      }
   `,
}));

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
   last_lock_at: '',
   office_id: 0,
   employee_type_id: 0,
};

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
type DataIndex = keyof Employee;

export default function EmployeePage() {
   const { styles } = useStyle();
   const { notification } = App.useApp();
   const [loading, setLoading] = useState(false);
   const [employees, setEmployees] = useState<Employee[]>([]);
   const [loadingDelete, setLoadingDelete] = useState(false);
   const [error, setError] = useState(null);
   const dispatch = useDispatch();
   const employeesSlice = useSelector((state: RootState) => state.employee.employees);

   const searchInput = useRef<InputRef>(null);
   const [searchText, setSearchText] = useState('');
   const [searchedColumn, setSearchedColumn] = useState('');
   const handleSearch = (selectedKeys: string[], confirm: FilterDropdownProps['confirm'], dataIndex: DataIndex) => {
      confirm();
      setSearchText(selectedKeys[0]);
      setSearchedColumn(dataIndex);
   };
   const handleReset = (clearFilters: () => void) => {
      clearFilters();
      setSearchText('');
   };

   const getColumnSearchProps = (dataIndex: DataIndex): TableColumnType<Employee> => ({
      // eslint-disable-next-line react/no-unstable-nested-components
      filterDropdown: ({ setSelectedKeys, selectedKeys, confirm, clearFilters, close }) => (
         <div style={{ padding: 8 }} onKeyDown={(e) => e.stopPropagation()}>
            <Input
               ref={searchInput}
               placeholder={`Search ${dataIndex}`}
               value={selectedKeys[0]}
               onChange={(e) => setSelectedKeys(e.target.value ? [e.target.value] : [])}
               onPressEnter={() => handleSearch(selectedKeys as string[], confirm, dataIndex)}
               style={{ marginBottom: 8, display: 'block' }}
            />
            <Space>
               <Button
                  type="primary"
                  onClick={() => handleSearch(selectedKeys as string[], confirm, dataIndex)}
                  icon={<SearchOutlined />}
                  size="small"
                  style={{ width: 90 }}
               >
                  Search
               </Button>
               <Button onClick={() => clearFilters && handleReset(clearFilters)} size="small" style={{ width: 90 }}>
                  Reset
               </Button>
               <Button
                  type="link"
                  size="small"
                  onClick={() => {
                     confirm({ closeDropdown: false });
                     setSearchText((selectedKeys as string[])[0]);
                     setSearchedColumn(dataIndex);
                  }}
               >
                  Filter
               </Button>
               <Button
                  type="link"
                  size="small"
                  onClick={() => {
                     close();
                  }}
               >
                  close
               </Button>
            </Space>
         </div>
      ),
      // eslint-disable-next-line react/no-unstable-nested-components
      filterIcon: (filtered: boolean) => <SearchOutlined style={{ color: filtered ? '#1677ff' : undefined }} />,
      onFilter: (value, record) => {
         const text = record[dataIndex]?.toString().toLowerCase();
         return text ? text.includes((value as string).toLowerCase()) : false;
      },
      onFilterDropdownOpenChange: (visible) => {
         if (visible) {
            setTimeout(() => searchInput.current?.select(), 100);
         }
      },
      render: (text) =>
         searchedColumn === dataIndex ? (
            <Highlighter
               highlightStyle={{ backgroundColor: '#ffc069', padding: 0 }}
               searchWords={[searchText]}
               autoEscape
               textToHighlight={text ? text.toString() : ''}
            />
         ) : (
            text
         ),
   });
   useEffect(() => {
      setLoading(true);
      employeeAPI
         .getEmployees()
         .then((res: any) => {
            console.log(res);
            dispatch(setEmployeesSlice(res.map(transformApiResponseToEmployee)));
         })
         .catch((error) => {
            setError(error);
         })
         .finally(() => {
            setLoading(false);
         });
   }, [dispatch]);

   const handleDelete = (employee_id: number) => {
      setLoadingDelete(true);
      employeeAPI
         .deleteEmployee(employee_id.toString())
         .then((res) => {
            if (res && res.status === 200) {
               refreshData();
               notification.success({
                  message: `Delete employee Success by Id ${employee_id} !`,
                  duration: 3,
               });
            }
            if (res && (res.status === 400 || res.error === true)) {
               notification.error({
                  message: `Delete employee Failed by Id ${employee_id} !`,
                  duration: 3,
                  description: res.message,
               });
            }
         })
         .catch((error) => {
            notification.error({
               message: `Delete Employee Failed by Id ${employee_id} !`,
               duration: 3,
               description: error.message,
            });
         })
         .finally(() => {
            setLoadingDelete(false);
         });
   };

   const refreshData = async () => {
      try {
         const res = await employeeAPI.getEmployees();
         dispatch(setEmployeesSlice(res.map(transformApiResponseToEmployee)));
      } catch (error) {
         setError(error);
      }
   };

   const [employeeModalProps, setEmployeeModalProps] = useState({
      formValue: DEFAULT_EMPLOYEE_VALUE,
      title: 'New',
      show: false,
      isCreate: true,
      onOk: () => {
         setEmployeeModalProps((prev) => ({ ...prev, show: false }));
      },
      onCancel: () => {
         setEmployeeModalProps((prev) => ({ ...prev, show: false }));
      },
   });

   const columns: ColumnsType<Employee> = [
      {
         title: 'Full Name',
         dataIndex: 'employee_full_name',
         ...getColumnSearchProps('employee_full_name'),
         fixed: 'left',
         width: 100,
         align: 'center',
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
         width: 200,
         align: 'center',
      },
      {
         title: 'Phone Number',
         dataIndex: 'employee_phone',
         width: 120,
         align: 'center',
      },
      {
         title: 'Username',
         dataIndex: 'employee_username',
         width: 150,
         align: 'center',
      },
      {
         title: 'Date of Birth',
         dataIndex: 'employee_birthday',
         width: 120,
         align: 'center',
         render: (value) => formatDateTime(value),
      },
      {
         title: 'Gender',
         dataIndex: 'employee_gender',
         width: 100,
         align: 'center',
         filters: [
            {
               text: 'Male',
               value: 1,
            },
            {
               text: 'Female',
               value: 0,
            },
            {
               text: 'Other',
               value: -1,
            },
         ],
         onFilter: (value, record) => record.employee_gender === value,
         render: (value) => {
            const genderMap = {
               1: 'Male',
               0: 'Female',
               [-1]: 'Other',
            };
            return (
               <ProTag color={value === 1 ? 'blue' : value === 0 ? 'pink' : 'default'}>
                  {genderMap[value as keyof typeof genderMap]}
               </ProTag>
            );
         },
      },
      {
         title: 'Lock Status',
         align: 'center',
         dataIndex: 'isLocked',
         filters: [
            {
               text: 'Locked',
               value: 1,
            },
            {
               text: 'Unlocked',
               value: 0,
            },
         ],
         onFilter: (value, record) => record.is_locked === value,
         render: (isLocked) => (
            <ProTag color={isLocked === 1 ? 'error' : 'success'}>{isLocked === 1 ? 'Locked' : 'Unlocked'}</ProTag>
         ),
      },
      {
         title: 'Offices',
         width: 100,
         dataIndex: ['employee_belongto_office', 'name'],
         ...getColumnSearchProps('employee_belongto_office.name' as DataIndex), // chưa được
         align: 'center',
      },
      {
         title: 'Employee Type',
         width: 100,
         dataIndex: ['employee_belongto_employeeType', 'employee_type_name'],
         ...getColumnSearchProps('employee_belongto_employeeType?.empemployee_type_name' as DataIndex), // chưa được
         align: 'center',
      },
      {
         title: 'Actions',
         key: 'operation',
         fixed: 'right',
         width: 120,
         align: 'center',
         render: (_, record) => (
            <div className="flex w-full justify-center gap-2">
               <IconButton onClick={() => onEdit(record)} title="Edit">
                  <Iconify icon="solar:pen-bold-duotone" size={18} />
               </IconButton>
               <Popconfirm
                  title="Delete employee?"
                  description="Are you sure you want to delete this employee?"
                  okText="Delete"
                  cancelText="Cancel"
                  placement="left"
                  onConfirm={() => handleDelete(record.employee_id)}
               >
                  <IconButton title="Delete">
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
   const expandColumns: ColumnsType<Employee> = [
      {
         title: 'Lock Status',
         align: 'center',
         key: 'lockStatus',
         render: (_, record) => {
            const { is_locked } = record;
            return (
               <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexDirection: 'column' }}>
                  {is_locked === 1 ? (
                     <>
                        <Iconify icon="fxemoji:lock" size={30} />
                        <Text mark style={{ color: 'red' }}>
                           Locked
                        </Text>
                     </>
                  ) : (
                     <Text mark style={{ color: 'green' }}>
                        Unlocked
                     </Text> // Chỉ hiển thị "Unlocked"
                  )}
               </div>
            );
         },
      },
      {
         title: 'Timestamps',
         key: 'timestamps',
         align: 'center',
         render: (_, record) => (
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
               <div style={{ display: 'flex', alignItems: 'center' }}>
                  <span style={{ marginRight: 8, fontWeight: 'bold' }}>Created Date:</span>
                  <Text mark>{dayjs(record.created_at, 'YYYY-MM-DD HH:mm:ss').format('DD/MM/YYYY HH:mm:ss')}</Text>
               </div>
               <div style={{ display: 'flex', alignItems: 'center', marginTop: 8 }}>
                  <span style={{ marginRight: 8, fontWeight: 'bold' }}>Updated Date:</span>
                  <Text mark>{dayjs(record.updated_at, 'YYYY-MM-DD HH:mm:ss').format('DD/MM/YYYY HH:mm:ss')}</Text>
               </div>
            </div>
         ),
      },
   ];
   const renderExpandedRow = (record: Employee) => (
      <div>
         {/* <Alert message="Description" description={record.description} type="info" /> */}
         <Table<Employee> columns={expandColumns} dataSource={[record]} pagination={false} />
      </div>
   );
   const content = (
      <Table
         className={styles.customTable}
         rowKey={(record) => record.employee_id.toString()}
         style={{ width: '100%', flex: 1 }}
         size="small"
         scroll={{ y: 'calc(100vh - 300px)' }}
         pagination={{
            size: 'default',
            total: employees?.length || 0,
            showSizeChanger: true,
            showQuickJumper: true,
            showTotal: (total) => `Total ${total} items`,
         }}
         columns={columns as ColumnsType<Employee>}
         // expandable={{ expandedRowRender: renderExpandedRow, defaultExpandedRowKeys: ['0'] }}
         dataSource={error ? [] : employeesSlice || []}
         loading={loading}
      />
   );

   return (
      <Card
         style={{ maxHeight: '100%', minHeight: '100%', display: 'flex', flexDirection: 'column' }}
         styles={{ body: { padding: '0', flex: 1, display: 'flex', flexDirection: 'column' } }}
         title="Employee List"
         extra={
            <Button type="primary" onClick={onCreate}>
               New
            </Button>
         }
      >
         <Spin spinning={loadingDelete} tip="Deleting..." size="large" fullscreen>
            {loadingDelete && content}
         </Spin>
         {content}
         <EmployeeModal {...employeeModalProps} />
      </Card>
   );
}
