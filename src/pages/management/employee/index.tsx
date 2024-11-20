import { SearchOutlined } from '@ant-design/icons';
import { App, Button, Card, Popconfirm, Avatar, Tooltip, Table, Input, Space, Typography, Empty, Spin } from 'antd';
import { createStyles } from 'antd-style';
import { useRef, useState, useEffect } from 'react';
import Highlighter from 'react-highlight-words';
import { IconButton, Iconify } from '@components/icon';
import { Employee } from './entity';
import employeeAPI from '@/redux/api/services/employeeAPI';
import { EmployeeModal, EmployeeModalProps } from './employeeModal';
import type { InputRef, TableColumnType } from 'antd';
import type { ColumnsType } from 'antd/es/table';
import type { FilterDropdownProps } from 'antd/es/table/interface';
import { useSelector, useDispatch } from 'react-redux';
import { RootState } from '@/redux/stores/store';
import { setEmployeeSlice } from '@/redux/slices/employeeSlice';
import { useCopyToClipboard } from '@/hooks/event/use-copy-to-clipboard'; // Đảm bảo đường dẫn đúng
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
   employee_id: -1,
   employee_full_name: '',
   employee_email: '',
   employee_phone: '',
   employee_username: '',
   employee_password: '',
   employee_gender: 0,
   is_locked: 0,
   created_at: '',
   updated_at: '',
   employee_belongto_office: null, // Đảm bảo cho phép null
   employee_belongto_employeeType: null, // Đảm bảo cho phép null
};

type DataIndex = keyof Employee;

function CopyButton({ value }: { value: string }) {
   const { copyFn } = useCopyToClipboard();
   return (
      <Tooltip title="Copy">
         <IconButton className="text-gray" onClick={() => copyFn(value)}>
            <Iconify icon="eva:copy-fill" size={20} />
         </IconButton>
      </Tooltip>
   );
}

export default function EmployeePage() {
   const searchInput = useRef<InputRef>(null);
   const [searchText, setSearchText] = useState('');
   const [searchedColumn, setSearchedColumn] = useState('');
   const { notification } = App.useApp();
   const [loading, setLoading] = useState(true);
   const [loadingDelete, setLoadingDelete] = useState(false);
   const [employees, setEmployees] = useState<Employee[]>([]);
   const dispatch = useDispatch();

   const employeesSlice = useSelector((state: RootState) => state.employee.employees);

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
         .getAllEmployees()
         .then((res: any) => {
            dispatch(setEmployeeSlice(res));
            setEmployees(res);
         })
         .catch((error) => {
            console.error('Error fetching employees:', error);
         })
         .finally(() => {
            setLoading(false);
         });
   }, [dispatch]);

   const handleDelete = (id: number) => {
      setLoadingDelete(true);
      employeeAPI
         .deleteEmployee(id)
         .then((res) => {
            if (res && res.status === 200) {
               setEmployees((prev) => prev.filter((employee) => employee.employee_id !== id));
               notification.success({
                  message: `Delete Employee Success by Id ${id} !`,
                  duration: 3,
               });
            }
         })
         .catch((error) => {
            notification.error({
               message: `Delete Employee Failed by Id ${id} !`,
               duration: 3,
               description: error.message,
            });
         })
         .finally(() => {
            setLoadingDelete(false);
         });
   };

   const [employeeModalProps, setEmployeeModalProps] = useState<EmployeeModalProps>({
      formValue: { ...DEFAULT_EMPLOYEE_VALUE },
      title: 'New Create Employee',
      show: false,
      isCreate: true,
      onOk: () => {
         setEmployeeModalProps((prev) => ({ ...prev, show: false }));
         // Refresh data logic here if needed
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
         sorter: (a, b) => a.employee_full_name.localeCompare(b.employee_full_name),
      },
      {
         title: 'Email',
         dataIndex: 'employee_email',
         ...getColumnSearchProps('employee_email'),
      },
      {
         title: 'Phone',
         dataIndex: 'employee_phone',
         render: (phone) => (
            <Input suffix={<CopyButton value={phone.toString()} />} value={phone.toString()} readOnly />
         ),
      },
      {
         title: 'Action',
         key: 'operation',
         render: (_, record) => (
            <div className="flex w-full justify-center text-gray">
               <IconButton onClick={() => onEdit(record)}>
                  <Iconify icon="solar:pen-bold-duotone" size={18} />
               </IconButton>
               <Popconfirm
                  title="Delete the Employee?"
                  okText="Yes"
                  cancelText="No"
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
         title: 'Create New Employee',
         isCreate: true,
         formValue: { ...DEFAULT_EMPLOYEE_VALUE },
      }));
   };

   const onEdit = (formValue: Employee) => {
      setEmployeeModalProps((prev) => ({
         ...prev,
         show: true,
         title: 'Edit Employee',
         isCreate: false,
         formValue,
      }));
   };

   return (
      <Card
         title="Employee List"
         extra={
            <Button type="primary" onClick={onCreate}>
               New Employee
            </Button>
         }
      >
         <Spin spinning={loadingDelete} tip="Deleting..." size="large">
            <Table
               rowKey="employee_id"
               columns={columns}
               dataSource={employeesSlice}
               pagination={{ pageSize: 10 }}
               loading={loading}
            />
         </Spin>
         <EmployeeModal {...employeeModalProps} />
      </Card>
   );
}
