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
import { IconButton, Iconify } from '@/components/icon';
import { Vehicle } from './entity';
import getVehicles from '@api/vehicleAPI';
import vehicleAPI from '@/redux/api/services/vehicleAPI';
import ProTag from '@/theme/antd/components/tag';

import { Vehicle, MapVehicleSeat, VehicleType, MapVehicleLayout } from './entity';
import { VehicleModal, type VehicleModalProps } from './vehicleModal';
import type { InputRef, TableColumnType } from 'antd';
import type { ColumnsType } from 'antd/es/table';
import type { FilterDropdownProps } from 'antd/es/table/interface';
import dayjs from 'dayjs';
import { useCopyToClipboard } from '@/hooks/event/use-copy-to-clipboard';
import { useSelector, useDispatch } from 'react-redux';
import { RootState } from '@/redux/stores/store';
import { setVehiclesSlice } from '@/redux/slices/vehicleSlice';
import ProTag from '@theme/antd/components/tag';

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

const DEFAULT_VEHICLE_VALUE: Vehicle = {
   id: 0,
   code: '',
   name: '',
   model: '',
   brand: '',
   capacity: 0,
   manufactureYear: 0,
   color: '',
   description: '',
   isLocked: 0,
   lastLockAt: null,
   createdAt: '',
   updatedAt: '',
   mapVehicleLayout: undefined,
   office: undefined,
   vehicleType: undefined,
   images: [],
};


function transformApiResponseToVehicle(apiResponse: any): Vehicle {
   return {
      id: apiResponse.vehicle_id,
      code: apiResponse.vehicle_code,
      license_plate: apiResponse.vehicle_license_plate,
      model: apiResponse.vehicle_model,
      brand: apiResponse.vehicle_brand,
      capacity: apiResponse.vehicle_capacity,
      manufacture_year: apiResponse.vehicle_manufacture_year,
      color: apiResponse.vehicle_color,
      description: apiResponse.vehicle_description,
      isLocked: apiResponse.is_locked === 1 ? 1 : 0,
      lastLockAt: apiResponse.last_lock_at || '',
      createdAt: apiResponse.created_at,
      updatedAt: apiResponse.updated_at,
      vehicleType: apiResponse.vehicleType_belongto_vehicle
         ? {
              id: apiResponse.vehicleType_belongto_vehicle.vehicle_type_id,
              name: apiResponse.vehicleType_belongto_vehicle.vehicle_type_name,
              description: apiResponse.vehicleType_belongto_vehicle.vehicle_type_description,
              createdAt: apiResponse.vehicleType_belongto_vehicle.created_at,
              updatedAt: apiResponse.vehicleType_belongto_vehicle.updated_at,
           }
         : undefined,
      mapVehicleLayout: apiResponse.vehicle_belongto_mapVehicleLayout
         ? {
              id: apiResponse.vehicle_belongto_mapVehicleLayout.map_vehicle_layout_id,
              name: apiResponse.vehicle_belongto_mapVehicleLayout.layout_name,
              createdAt: apiResponse.vehicle_belongto_mapVehicleLayout.created_at,
              updatedAt: apiResponse.vehicle_belongto_mapVehicleLayout.updated_at,
              seats: apiResponse.vehicle_belongto_mapVehicleLayout.mapVehicleLayout_to_mapVehicleSeat?.map(
                 (seat: any) => ({
                    id: seat.map_vehicle_seat_id,
                    code: seat.map_vehicle_seat_code,
                    rowNo: seat.map_vehicle_seat_row_no,
                    columnNo: seat.map_vehicle_seat_column_no,
                    floorNo: seat.map_vehicle_seat_floor_no,
                    lockChair: seat.map_vehicle_seat_lock_chair === 1,
                    createdAt: seat.created_at,
                    updatedAt: seat.updated_at,
                    layoutId: seat.map_vehicle_layout_id,
                 }),
              ),
           }
         : undefined,
      images: apiResponse.vehicle_to_vehicleImage?.map((image: any) => image.vehicle_image_url) || [],
   };
}

type DataIndex = keyof Vehicle;

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

export default function VehiclePage() {
   const searchInput = useRef<InputRef>(null);
   const [searchText, setSearchText] = useState('');
   const [searchedColumn, setSearchedColumn] = useState('');
   const { notification } = App.useApp();
   const { styles } = useStyle();
   const [loading, setLoading] = useState(true);
   const [loadingDelete, setLoadingDelete] = useState(false);
   const [error, setError] = useState<Error | null>(null);
   const dispatch = useDispatch();

   const vehiclesSlice = useSelector((state: RootState) => state.vehicle.vehicles);

   const handleSearch = (selectedKeys: string[], confirm: FilterDropdownProps['confirm'], dataIndex: DataIndex) => {
      confirm();
      setSearchText(selectedKeys[0]);
      setSearchedColumn(dataIndex);
   };

   const handleReset = (clearFilters: () => void) => {
      clearFilters();
      setSearchText('');
   };

   const handleDelete = (id: number) => {
      setLoadingDelete(true);
      vehicleAPI
         .deleteVehicle(id.toString())
         .then((res) => {
            if (res && res.status === 200) {
               refreshData();
               notification.success({
                  message: `Delete Vehicle Success by Id ${id} !`,
                  duration: 3,
               });
            } else {
               notification.error({
                  message: `Delete Vehicle Failed by Id ${id} !`,
                  duration: 3,
                  description: res.message,
               });
            }
         })
         .catch((error) => {
            notification.error({
               message: `Delete Vehicle Failed by Id ${id} !`,
               duration: 3,
               description: error.message,
            });
         })
         .finally(() => {
            setLoadingDelete(false);
         });
   };
   const getColumnSearchProps = (dataIndex: DataIndex): TableColumnType<Vehicle> => ({
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
      getVehicles
         .getVehicles()
         .then((res) => {
            if (res) {
               dispatch(setVehiclesSlice(res.map(transformApiResponseToVehicle)));
         .then((response) => {
            console.log('Response from API:', response);
            if (response && Array.isArray(response)) {
               console.log('Setting vehicles:', response);
               setVehicles(response);
               console.log('setting ', response);
            } else {
               setVehicles([]);
            }
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
         const res = await vehicleAPI.getVehicles();
         if (res) {
            dispatch(setVehiclesSlice(res.map(transformApiResponseToVehicle)));
         }
      } catch (error) {
         setError(error);
      }
   };

   const [vehicleModalProps, setVehicleModalProps] = useState<VehicleModalProps>({
      formValue: DEFAULT_VEHICLE_VALUE,
      title: 'New Create Vehicle',
      show: false,
      isCreate: true,
      onOk: () => {
         refreshData();
         setVehicleModalProps((prev) => ({ ...prev, show: false }));
      },
      onCancel: () => {
         setVehicleModalProps((prev) => ({ ...prev, show: false }));
      },
   });

   const columns: ColumnsType<Vehicle> = [
      Table.EXPAND_COLUMN,
      {
         title: 'Code',
         dataIndex: 'code',
         ...getColumnSearchProps('code'),
         fixed: 'left',
         sorter: (a, b) => a.code.localeCompare(b.code),
      },
      {
         title: 'License Plate',
         dataIndex: 'license_plate',
         ...getColumnSearchProps('license_plate'),
         fixed: 'left',
      },
      {
         title: 'Images',
         dataIndex: 'images',
         align: 'center',
         render: (images) =>
            images && images.length > 0 ? (
               <Avatar.Group maxCount={3} size="large">
                  {images.map((image: string, index: number) => (
                     <Avatar key={index} src={image} alt={`Vehicle Image ${index + 1}`} />
                  ))}
               </Avatar.Group>
            ) : (
               <Empty style={{ margin: 0 }} imageStyle={{ height: 30 }} image={Empty.PRESENTED_IMAGE_SIMPLE} />
            ),
      },
      {
         title: 'Vehicle Type',
         dataIndex: ['vehicleType', 'name'],
         align: 'center',
      },
      {
         title: 'Capacity',
         dataIndex: 'capacity',
         align: 'center',
         sorter: (a, b) => a.capacity - b.capacity,
      },
      {
         title: 'Model',
         dataIndex: 'model',
         align: 'center',
      },
      {
         title: 'Brand',
         dataIndex: 'brand',
         align: 'center',
      },
      {
         title: 'Color',
         dataIndex: 'color',
         align: 'center',
      },
      {
         title: 'Lock Status',
         align: 'center',
         dataIndex: 'isLocked',
         filters: [
            { text: 'Locked', value: 1 },
            { text: 'Unlocked', value: 0 },
         ],
         onFilter: (value, record) => record.isLocked === value,
         render: (isLocked) => (
            <ProTag color={isLocked === 1 ? 'error' : 'success'}>{isLocked === 1 ? 'Locked' : 'Unlocked'}</ProTag>
         ),
      },
      {
         title: 'Action',
         key: 'operation',
         fixed: 'right',
         width: 100,
         render: (_, record) => (
            <Space>
               <IconButton onClick={() => onEdit(record)}>
                  <Iconify icon="solar:pen-bold-duotone" size={18} />
               </IconButton>
               <Popconfirm
                  title="Delete this vehicle?"
                  onConfirm={() => handleDelete(record.id)}
                  okText="Yes"
                  cancelText="No"
               >
                  <IconButton>
                     <Iconify icon="mingcute:delete-2-fill" size={18} className="text-error" />
                  </IconButton>
               </Popconfirm>
            </Space>
         ),
      },
   ];

   const onCreate = () => {
      setVehicleModalProps((prev) => ({
         ...prev,
         show: true,
         title: 'Create New Vehicle',
         isCreate: true,
         formValue: DEFAULT_VEHICLE_VALUE,
      }));
   };

   const onEdit = (formValue: Vehicle) => {
      setVehicleModalProps((prev) => ({
         ...prev,
         show: true,
         title: 'Edit Vehicle',
         isCreate: false,
         formValue,
      }));
   };

   const expandColumns: ColumnsType<Vehicle> = [
      {
         title: 'Layout Information',
         key: 'layout',
         render: (_, record) => (
            <div>
               <Text strong>Layout Name:</Text> {record.mapVehicleLayout?.name}
               <br />
               <Text strong>Total Seats:</Text> {record.mapVehicleLayout?.seats?.length || 0}
            </div>
         ),
      },
      {
         title: 'Lock Status',
         align: 'center',
         key: 'lockStatus',
         render: (_, record) => {
            const { isLocked, lastLockAt } = record;
            return (
               <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexDirection: 'column' }}>
                  {isLocked === 1 && lastLockAt && (
                     <>
                        <Iconify icon="fxemoji:lock" size={40} />
                        <Text mark>{dayjs(lastLockAt).format('DD/MM/YYYY HH:mm:ss')}</Text>
                     </>
                  )}
                  {isLocked === 0 && (
                     <Empty style={{ margin: 0 }} imageStyle={{ height: 30 }} image={Empty.PRESENTED_IMAGE_SIMPLE} />
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
            <Space direction="vertical">
               <div>
                  <Text strong>Created:</Text> <Text mark>{dayjs(record.createdAt).format('DD/MM/YYYY HH:mm:ss')}</Text>
               </div>
               <div>
                  <Text strong>Updated:</Text> <Text mark>{dayjs(record.updatedAt).format('DD/MM/YYYY HH:mm:ss')}</Text>
               </div>
            </Space>
         ),
      },
      {
         title: 'Images',
         dataIndex: 'images',
         align: 'center',
         render: (images) =>
            images && images.length > 0 ? (
               images.map((image: string) => {
                  return <Avatar size="large" src={image} alt="Vehicle Image" />;
               })
            ) : (
               <Empty style={{ margin: 0 }} imageStyle={{ height: 30 }} image={Empty.PRESENTED_IMAGE_SIMPLE} />
            ),
      },
   ];

   const renderExpandedRow = (record: Vehicle) => (
      <div>
         <Alert message="Description" description={record.description} type="info" />
         <Table<Vehicle> columns={expandColumns} dataSource={[record]} pagination={false} />
      </div>
   );

   const content = (
      <Table
         className={styles.customTable}
         rowKey={(record) => record.id.toString()}
         style={{ width: '100%', flex: 1 }}
         size="small"
         scroll={{ x: 1500, y: 'calc(100vh - 300px)' }}
         pagination={{
            total: vehiclesSlice?.length || 0,
            showSizeChanger: true,
            showQuickJumper: true,
            showTotal: (total) => `Total ${total} items`,
         }}
         columns={columns}
         expandable={{ expandedRowRender: renderExpandedRow }}
         dataSource={error ? [] : vehiclesSlice}
         loading={loading}
      />
   );

   return (
      <Card
         style={{ height: '100%', display: 'flex', flexDirection: 'column' }}
         styles={{ body: { padding: 0, flex: 1, display: 'flex', flexDirection: 'column' } }}
         title="Vehicle List"
         extra={
            <Button type="primary" onClick={onCreate}>
               New Vehicle
            </Button>
         }
      >
         <Spin spinning={loadingDelete} tip="Deleting..." size="large" fullscreen />
         {content}
         <VehicleModal {...vehicleModalProps} />
      </Card>
   );
}
