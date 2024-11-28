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
import dayjs from 'dayjs';
import { createStyles } from 'antd-style';
import { useRef, useState, useEffect } from 'react';
import Highlighter from 'react-highlight-words';
import { IconButton, Iconify } from '@components/icon';
import getPaymentMethods from '@api/paymentMethodAPI';
import ProTag from '@theme/antd/components/tag';
import { PaymentMethodModal, PaymentMethodModalProps } from './paymentMethodModal';
import paymentMethodAPI from '@/redux/api/services/paymentMethodAPI';
import type { InputRef, TableColumnType } from 'antd';
import type { ColumnsType } from 'antd/es/table';
import type { FilterDropdownProps } from 'antd/es/table/interface';
import { PaymentMethod } from './entity';
import { useSelector, useDispatch } from 'react-redux';
import { RootState } from '@/redux/stores/store';
import { setPaymentMethodsSlice } from '@/redux/slices/paymentMethodSlice';
import { useCopyToClipboard } from '@/hooks/event/use-copy-to-clipboard';

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

const DEFAULT_PAYMENTMETHOD_VALUE: PaymentMethod = {
   payment_method_id: 0,
   payment_method_code: '',
   payment_method_name: '',
   isLocked: 0,
   images: [],
   payment_method_description: '',
   lastLockAt: '',
   createdAt: '',
   updatedAt: '',
   payment_type_id: undefined,
};

function transformApiResponseToPaymentMethod(apiResponse: any): PaymentMethod {
   console.log('Transforming API Response:', apiResponse);
   return {
      payment_method_id: apiResponse.payment_method_id,
      payment_method_code: apiResponse.payment_method_code,
      payment_method_name: apiResponse.payment_method_name,
      isLocked: apiResponse.is_locked,
      lastLockAt: apiResponse.last_lock_at || '',
      images: apiResponse.payment_method_avatar_url ? [apiResponse.payment_method_avatar_url] : [], // Cập nhật để lấy đúng ảnh
      payment_method_description: apiResponse.payment_method_description,
      createdAt: apiResponse.created_at,
      updatedAt: apiResponse.updated_at,
      payment_type_id: apiResponse.payment_type_id,
      paymentMethod_belongto_paymentType: {
         id: apiResponse.paymentMethod_belongto_paymentType?.payment_type_id,
         name: apiResponse.paymentMethod_belongto_paymentType?.payment_type_name,
         createdAt: apiResponse.paymentMethod_belongto_paymentType?.created_at,
         updatedAt: apiResponse.paymentMethod_belongto_paymentType?.updatedAt,
      },
      paymentMethod_onetoOne_paymentConfig: {
         payment_config_id: apiResponse.paymentMethod_onetoOne_paymentConfig?.payment_config_id,
         api_key: apiResponse.paymentMethod_onetoOne_paymentConfig?.api_key,
         secret_key: apiResponse.paymentMethod_onetoOne_paymentConfig?.secret_key,
         public_key: apiResponse.paymentMethod_onetoOne_paymentConfig?.public_key,
         payment_endpoint_url: apiResponse.paymentMethod_onetoOne_paymentConfig?.payment_endpoint_url,
         transaction_timeout: apiResponse.paymentMethod_onetoOne_paymentConfig?.transaction_timeout,
         environment: apiResponse.paymentMethod_onetoOne_paymentConfig?.environment,
         refund_url: apiResponse.paymentMethod_onetoOne_paymentConfig?.refund_url,
         is_deleted: apiResponse.paymentMethod_onetoOne_paymentConfig?.is_deleted,
         createdAt: apiResponse.paymentMethod_onetoOne_paymentConfig?.created_at,
         updatedAt: apiResponse.paymentMethod_onetoOne_paymentConfig?.updated_at,
      },
   };
}

type DataIndex = keyof PaymentMethod;

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
export default function PaymentMethodPage() {
   const { styles } = useStyle();
   const searchInput = useRef<InputRef>(null);
   const [searchText, setSearchText] = useState('');
   const [searchedColumn, setSearchedColumn] = useState('');
   const { notification } = App.useApp();
   const [loading, setLoading] = useState(true);
   const [loadingDelete, setLoadingDelete] = useState(false);
   const [error, setError] = useState<any>(null);
   const dispatch = useDispatch();

   const paymentMethodsSlice = useSelector((state: RootState) => state.paymentMethod.paymentMethods);
   console.log('Payment Methods Slice:', paymentMethodsSlice);

   const handleSearch = (selectedKeys: string[], confirm: FilterDropdownProps['confirm'], dataIndex: DataIndex) => {
      confirm();
      setSearchText(selectedKeys[0]);
      setSearchedColumn(dataIndex);
   };

   const handleReset = (clearFilters: () => void) => {
      clearFilters();
      setSearchText('');
   };

   const getColumnSearchProps = (dataIndex: DataIndex): TableColumnType<PaymentMethod> => ({
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
      getPaymentMethods
         .getPaymentMethods()
         .then((res: any) => {
            console.log('API Response:', res);
            dispatch(setPaymentMethodsSlice(res.map(transformApiResponseToPaymentMethod)));
         })
         .catch((error: any) => {
            setError(error);
         })
         .finally(() => {
            setLoading(false);
         });
   }, [dispatch]);

   const refreshData = async () => {
      try {
         const res = await paymentMethodAPI.getPaymentMethods();
         dispatch(setPaymentMethodsSlice(res.map(transformApiResponseToPaymentMethod)));
      } catch (error) {
         setError(error);
      }
   };

   const [paymentMethodModalProps, setPaymentMethodModalProps] = useState<PaymentMethodModalProps>({
      formValue: { ...DEFAULT_PAYMENTMETHOD_VALUE },
      title: 'New Create Payment Method',
      show: false,
      isCreate: true,
      onOk: () => {
         refreshData();
         setPaymentMethodModalProps((prev) => ({ ...prev, show: false }));
      },
      onCancel: () => {
         setPaymentMethodModalProps((prev) => ({ ...prev, show: false }));
      },
   });

   const handleDelete = (id: number | undefined) => {
      if (id !== undefined) {
         setLoadingDelete(true);
         getPaymentMethods
            .deletePaymentMethod(id.toString())
            .then((res) => {
               if (res && res.status === 200) {
                  refreshData();
                  notification.success({
                     message: `Delete Payment Method Success by Id ${id} !`,
                     duration: 3,
                  });
               }
               if (res && (res.status === 400 || res.error === true)) {
                  notification.error({
                     message: `Delete Payment Method Failed by Id ${id} !`,
                     duration: 3,
                     description: res.message,
                  });
               }
            })
            .catch((error) => {
               notification.error({
                  message: `Delete Payment Method Failed by Id ${id} !`,
                  duration: 3,
                  description: error.message,
               });
            })
            .finally(() => {
               setLoadingDelete(false);
            });
      }
   };

   const columns: ColumnsType<PaymentMethod> = [
      Table.EXPAND_COLUMN,
      {
         title: 'Name',
         dataIndex: 'payment_method_name',
         ...getColumnSearchProps('payment_method_name'),
         fixed: 'left',
         sorter: (a, b) => a.payment_method_name.localeCompare(b.payment_method_name),
         ellipsis: {
            showTitle: false,
         },
         render: (payment_method_name) => (
            <Tooltip placement="topLeft" title={payment_method_name}>
               {payment_method_name}
            </Tooltip>
         ),
      },
      {
         title: 'Code',
         dataIndex: 'payment_method_code',
         align: 'center',
      },
      {
         title: 'Images',
         dataIndex: 'images',
         align: 'center',
         render: (images) =>
            images && images.length > 0 ? (
               <Avatar.Group maxCount={3} size="large">
                  {images.map((image: string, index: number) => (
                     <Avatar key={index} src={image} alt={`Payment Method Image ${index + 1}`} />
                  ))}
               </Avatar.Group>
            ) : (
               <Empty style={{ margin: 0 }} imageStyle={{ height: 30 }} image={Empty.PRESENTED_IMAGE_SIMPLE} />
            ),
      },
      {
         title: 'Description',
         dataIndex: 'payment_method_description',
         align: 'center',
      },
      {
         title: 'Lock Status',
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
         align: 'center',
         width: 100,
         fixed: 'right',
         render: (_, record) => (
            <div className="flex w-full justify-center text-gray">
               <IconButton onClick={() => onEdit(record)}>
                  <Iconify icon="solar:pen-bold-duotone" size={18} />
               </IconButton>
               <Popconfirm
                  title="Delete the Payment Method?"
                  okText="Yes"
                  cancelText="No"
                  placement="left"
                  onConfirm={() => handleDelete(record.payment_method_id)}
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
      setPaymentMethodModalProps((prev) => ({
         ...prev,
         show: true,
         title: 'Create New',
         isCreate: true,
         formValue: { ...prev.formValue, ...DEFAULT_PAYMENTMETHOD_VALUE },
      }));
   };

   const onEdit = (formValue: PaymentMethod) => {
      setPaymentMethodModalProps((prev) => ({
         ...prev,
         show: true,
         title: 'Edit',
         isCreate: false,
         formValue,
      }));
   };

   const expandColumns: ColumnsType<PaymentMethod> = [
      {
         title: 'Layout Information',
         key: 'layout',
         render: (_, record) => (
            <div>
               <Text strong>Layout Name:</Text> {record.paymentMethod_belongto_paymentType?.name}
               <br />
               <Text strong>Total Seats:</Text> {record.paymentMethod_onetoOne_paymentConfig?.api_key?.length || 0}
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

   const renderExpandedRow = (record: PaymentMethod) => (
      <div>
         <Alert message="payment_method_description" description={record.payment_method_description} type="info" />
         <Table<PaymentMethod> columns={expandColumns} dataSource={[record]} pagination={false} />
      </div>
   );

   const content = (
      <Table
         className={styles.customTable}
         rowKey={(record) => record.payment_method_id?.toString() || ''}
         style={{ width: '100%', flex: 1 }}
         size="small"
         scroll={{ y: 'calc(100vh - 300px)' }}
         pagination={{
            size: 'default',
            total: paymentMethodsSlice?.length || 0,
            showSizeChanger: true,
            showQuickJumper: true,
            showTotal: (total) => `Total ${total} items`,
         }}
         columns={columns as ColumnsType<PaymentMethod>}
         expandable={{ expandedRowRender: renderExpandedRow }}
         dataSource={error ? [] : paymentMethodsSlice || []}
         loading={loading}
      />
   );

   return (
      <Card
         style={{ maxHeight: '100%', minHeight: '100%', display: 'flex', flexDirection: 'column' }}
         title="Payment Method List"
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
         <PaymentMethodModal {...paymentMethodModalProps} />
      </Card>
   );
}
