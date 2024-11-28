import { SearchOutlined } from '@ant-design/icons';
import {
   App,
   Button,
   Card,
   Popconfirm,
   Avatar,
   Tooltip,
   Alert,
   Table,
   Input,
   Space,
   Typography,
   Empty,
   Spin,
} from 'antd';
import { createStyles } from 'antd-style';
import { useRef, useState, useEffect } from 'react';
import Highlighter from 'react-highlight-words';
import { IconButton, Iconify } from '@components/icon';
import { Driver } from '@pages/management/driver/entity';
import getDrivers from '@api/driverAPI';
import ProTag from '@theme/antd/components/tag';
import { DriverModal, DriverModalProps } from './driverModal';
import type { InputRef, TableColumnType } from 'antd';
import type { ColumnsType } from 'antd/es/table';
import type { FilterDropdownProps } from 'antd/es/table/interface';
import dayjs from 'dayjs';
import { useCopyToClipboard } from '@/hooks/event/use-copy-to-clipboard';
import { useSelector, useDispatch } from 'react-redux';
import { RootState } from '@/redux/stores/store';
import { setDriverSlice } from '@/redux/slices/driverSlice';

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
const DEFAULE_DRIVER_VALUE: Driver = {
   driver_id: -1,
   driver_license_number: '',
   driver_experience_years: 0,
   createdAt: '',
   updatedAt: '',
   driver_onetoOne_employee: {
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
      employee_birthday: '',
      employee_password: '',
      employee_profile_image: '',
      employee_gender: 0,
      is_first_activation: 0,
      is_locked: 0,
      last_lock_at: '',
      office_id: 0,
      employee_type_id: 0,
      createdAt: '',
      updatedAt: '',
   },
   images: [],
};

// Cập nhật hàm transformApiResponseToDriver
function transformApiResponseToDriver(apiResponse: any): Driver {
   return {
      driver_id: apiResponse.driver_id,
      driver_license_number: apiResponse.driver_license_number,
      driver_experience_years: apiResponse.driver_experience_years,
      createdAt: apiResponse.created_at,
      updatedAt: apiResponse.updated_at,
      driver_onetoOne_employee: apiResponse.driver_onetoOne_employee, // Thêm thông tin nhân viên
      images: apiResponse?.employee_profile_image ? [apiResponse.employee_profile_image] : [],
   };
}

type DataIndex = keyof Driver;
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

export default function DriverPage() {
   const searchInput = useRef<InputRef>(null);
   const [searchText, setSearchText] = useState('');
   const [searchedColumn, setSearchedColumn] = useState('');
   const { notification } = App.useApp();
   const handleSearch = (selectedKeys: string[], confirm: FilterDropdownProps['confirm'], dataIndex: DataIndex) => {
      confirm();
      setSearchText(selectedKeys[0]);
      setSearchedColumn(dataIndex);
   };

   const handleReset = (clearFilters: () => void) => {
      clearFilters();
      setSearchText('');
   };

   const { styles } = useStyle();
   const [loading, setLoading] = useState(true);
   const [loadingDelete, setLoadingDelete] = useState(false);
   const [error, setError] = useState(null);
   const [drivers, setDrivers] = useState<[]>([]);
   const dispatch = useDispatch();

   const driversSlice = useSelector((state: RootState) => state.driver.drivers);

   const handleDelete = (id: number) => {
      setLoadingDelete(true);
      getDrivers
         .deleteDriver(id.toString())
         .then((res) => {
            if (res && res.status === 200) {
               refreshData();
               notification.success({
                  message: `Delete Driver Success by Id ${id} !`,
                  duration: 3,
               });
            }
            if (res && (res.status === 400 || res.error === true)) {
               notification.error({
                  message: `Delete Driver Failed by Id ${id} !`,
                  duration: 3,
                  description: res.message,
               });
            }
         })
         .catch((error) => {
            notification.error({
               message: `Delete Driver Failed by Id ${id} !`,
               duration: 3,
               description: error.message,
            });
         })
         .finally(() => {
            setLoadingDelete(false);
         });
   };

   const getColumnSearchProps = (dataIndex: DataIndex): TableColumnType<Driver> => ({
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
      getDrivers
         .getDrivers()
         .then((res: any) => {
            dispatch(setDriverSlice(res.map(transformApiResponseToDriver)));
         })
         .catch((error) => {
            setError(error);
         })
         .finally(() => {
            setLoading(false);
         });
   }, [dispatch]);

   const refreshData = async () => {
      try {
         const res = await getDrivers.getDrivers();
         dispatch(setDriverSlice(res.map(transformApiResponseToDriver)));
      } catch (error) {
         setError(error);
      }
   };

   const [driverModalPros, setDriverModalProps] = useState<DriverModalProps>({
      formValue: {
         ...DEFAULE_DRIVER_VALUE,
      },
      title: 'New Create Driver',
      show: false,
      isCreate: true,
      onOk: () => {
         refreshData();
         setDriverModalProps((prev) => ({ ...prev, show: false }));
      },
      onCancel: () => {
         setDriverModalProps((prev) => ({ ...prev, show: false }));
      },
   });

   const columns: ColumnsType<Driver> = [
      Table.EXPAND_COLUMN,
      {
         title: 'Name',
         dataIndex: 'driver_license_number',
         ...getColumnSearchProps('driver_license_number'),
         fixed: 'left',
         sorter: (a, b) => a.driver_license_number.localeCompare(b.driver_license_number),
         ellipsis: {
            showTitle: false,
         },
         render: (name) => (
            <Tooltip placement="topLeft" title={name}>
               {name}
            </Tooltip>
         ),
      },
      {
         title: 'Employee Name', // Tiêu đề cột
         dataIndex: 'driver_onetoOne_employee', // Truy cập đối tượng nhân viên
         align: 'center',
         render: (employee) => (
            <Tooltip placement="topLeft" title={employee?.employee_full_name}>
               <span>{employee?.employee_full_name || 'N/A'}</span>
            </Tooltip>
         ),
      },
      {
         title: 'Images',
         dataIndex: 'images',
         align: 'center',
         render: (images) =>
            images && images.length > 0 ? (
               <Avatar.Group max={{ count: 3 }} size="large">
                  {images.map((image: string, index: number) => (
                     <Avatar key={index} src={image} alt={`Driver Image ${index + 1}`} />
                  ))}
               </Avatar.Group>
            ) : (
               <Empty style={{ margin: 0 }} imageStyle={{ height: 30 }} image={Empty.PRESENTED_IMAGE_SIMPLE} />
            ),
         fixed: 'left',
      },
      {
         title: 'driver_experience_years',
         dataIndex: 'driver_experience_years',
         align: 'center',
         render: (phone) => (
            <Input suffix={<CopyButton value={phone.toString()} />} value={phone.toString()} readOnly />
         ),
      },
      {
         title: 'Action',
         key: 'operation',
         align: 'center',
         width: 100,
         fixed: 'right',
         render: (_, record) => (
            <div className="flex w-full justify-center text-gray">
               <IconButton onClick={() => onEdit(record)}>
                  <Iconify icon="solar:pen-bold-duotone" size={18} />
               </IconButton>
               <Popconfirm
                  title="Delete the Driver ?"
                  okText="Yes"
                  cancelText="No"
                  placement="left"
                  onCancel={() => {}}
                  onConfirm={() => handleDelete(record.driver_id)}
               >
                  <IconButton>
                     <Iconify icon="mingcute:delete-2-fill" size={18} className="text-error" />
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

   const onCreate = () => {
      setDriverModalProps((prev) => ({
         ...prev,
         show: true,
         title: 'Create New',
         isCreate: true,
         formValue: {
            ...prev.formValue,
            ...DEFAULE_DRIVER_VALUE,
         },
      }));
   };

   const onEdit = (formValue: Driver) => {
      setDriverModalProps((prev) => ({
         ...prev,
         show: true,
         title: 'Edit',
         isCreate: false,
         formValue,
      }));
   };

   const expandColumns: ColumnsType<Driver> = [
      {
         title: 'Timestamps',
         key: 'timestamps',
         align: 'center',
         render: (_, record) => (
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
               <div style={{ display: 'flex', alignItems: 'center' }}>
                  <span style={{ marginRight: 8, fontWeight: 'bold' }}>Created Date:</span>
                  <Text mark>{dayjs(record.createdAt, 'YYYY-MM-DD HH:mm:ss').format('DD/MM/YYYY HH:mm:ss')}</Text>
               </div>
               <div style={{ display: 'flex', alignItems: 'center', marginTop: 8 }}>
                  <span style={{ marginRight: 8, fontWeight: 'bold' }}>Updated Date:</span>
                  <Text mark>{dayjs(record.updatedAt, 'YYYY-MM-DD HH:mm:ss').format('DD/MM/YYYY HH:mm:ss')}</Text>
               </div>
            </div>
         ),
      },
      {
         title: 'Images',
         dataIndex: 'images',
         align: 'center',
         render: (images) =>
            images && images.length > 0 ? (
               images.map((image: string) => {
                  return <Avatar size="large" src={image} alt="Office Image" />;
               })
            ) : (
               <Empty style={{ margin: 0 }} imageStyle={{ height: 30 }} image={Empty.PRESENTED_IMAGE_SIMPLE} />
            ),
      },
   ];

   const renderExpandedRow = (record: Driver) => (
      <div>
         <Alert message="Description" description={record.driver_license_number} type="info" />
         <Table<Driver> columns={expandColumns} dataSource={[record]} pagination={false} />
      </div>
   );

   const content = (
      <Table
         className={styles.customTable}
         rowKey={(record) => record.driver_id.toString()}
         style={{ width: '100%', flex: 1 }}
         size="small"
         scroll={{ y: 'calc(100vh - 300px)' }}
         pagination={{
            size: 'default',
            total: drivers?.length || 0,
            showSizeChanger: true,
            showQuickJumper: true,
            showTotal: (total) => `Total ${total} items`,
         }}
         columns={columns as ColumnsType<Driver>}
         expandable={{ expandedRowRender: renderExpandedRow, defaultExpandedRowKeys: ['0'] }}
         dataSource={error ? [] : driversSlice || []}
         loading={loading}
      />
   );

   return (
      <Card
         style={{ maxHeight: '100%', minHeight: '100%', display: 'flex', flexDirection: 'column' }}
         styles={{ body: { padding: '0', flex: 1, display: 'flex', flexDirection: 'column' } }}
         title="Driver List"
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
         <DriverModal {...driverModalPros} />
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
