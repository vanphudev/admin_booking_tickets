import { Button, Card, Popconfirm, App } from 'antd';
import Table, { ColumnsType } from 'antd/es/table';
import dayjs from 'dayjs';
import { useState, useEffect } from 'react';

import { IconButton, Iconify } from '@/components/icon';
import voucherAPI from '@/redux/api/services/voucherAPI';
import ProTag from '@/theme/antd/components/tag';
import { Voucher } from './entity';
import { VoucherModal } from './voucherModal';

// Format functions
const formatCurrency = (value?: number): string => {
   if (!value) return '0 ₫';
   return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
   }).format(value);
};

const formatDateTime = (value?: string): string => {
   if (!value) return '';
   return dayjs(value).format('DD/MM/YYYY HH:mm');
};

const DEFAULT_VOUCHER_VALUE: Voucher = {
   voucher_id: 0,
   voucher_code: '',
   voucher_discount_percentage: 0,
   voucher_discount_max_amount: 0,
   voucher_usage_limit: 1,
   voucher_valid_from: '',
   voucher_valid_to: '',
   voucher_created_by: 0,
};

export default function VoucherPage() {
   const { notification } = App.useApp();
   const [loading, setLoading] = useState(false);
   const [vouchers, setVouchers] = useState<Voucher[]>([]);

   const fetchVoucherList = async () => {
      setLoading(true);
      try {
         const data = await voucherAPI.getVouchers();
         setVouchers(data || []);
      } catch (error) {
         notification.error({
            message: 'Lỗi khi tải danh sách voucher',
            duration: 3,
         });
      } finally {
         setLoading(false);
      }
   };

   useEffect(() => {
      fetchVoucherList();
   }, []);

   const [voucherModalProps, setVoucherModalProps] = useState({
      formValue: DEFAULT_VOUCHER_VALUE,
      title: 'New',
      show: false,
      isCreate: true,
      onOk: () => {
         setVoucherModalProps((prev) => ({ ...prev, show: false }));
         fetchVoucherList(); // Refresh data after create/update
      },
      onCancel: () => {
         setVoucherModalProps((prev) => ({ ...prev, show: false }));
      },
   });

   const columns: ColumnsType<Voucher> = [
      {
         title: 'Mã voucher',
         dataIndex: 'voucher_code',
         fixed: 'left',
         width: 150,
      },
      {
         title: 'Giảm giá',
         dataIndex: 'voucher_discount_percentage',
         width: 100,
         render: (value) => `${value}%`,
      },
      {
         title: 'Giảm tối đa',
         dataIndex: 'voucher_discount_max_amount',
         width: 150,
         render: (value) => formatCurrency(value),
      },
      {
         title: 'Số lượng',
         dataIndex: 'voucher_usage_limit',
         width: 100,
         align: 'center',
      },
      {
         title: 'Thời gian hiệu lực',
         key: 'validTime',
         width: 300,
         render: (_, record) => (
            <div>
               <ProTag color="processing">
                  Từ: {formatDateTime(record.voucher_valid_from)}
               </ProTag>
               <ProTag color="warning" style={{ marginLeft: 8 }}>
                  Đến: {formatDateTime(record.voucher_valid_to)}
               </ProTag>
            </div>
         ),
      },
      {
         title: 'Thời gian tạo/cập nhật',
         key: 'timestamps',
         width: 300,
         render: (_, record) => (
            <div>
               <ProTag color="default">
                  Tạo: {formatDateTime(record.created_at)}
               </ProTag>
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
                  title="Xóa voucher?" 
                  description="Bạn có chắc chắn muốn xóa voucher này?"
                  okText="Xóa"
                  cancelText="Hủy"
                  placement="left"
                  onConfirm={() => handleDelete(record.voucher_id)}
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
      setVoucherModalProps((prev) => ({
         ...prev,
         show: true,
         title: 'Tạo Voucher Mới',
         isCreate: true,
         formValue: DEFAULT_VOUCHER_VALUE,
      }));
   };

   const onEdit = (formValue: Voucher) => {
      setVoucherModalProps((prev) => ({
         ...prev,
         show: true,
         title: 'Chỉnh Sửa Voucher',
         isCreate: false,
         formValue,
      }));
   };

   const handleDelete = async (voucher_id: number) => {
      try {
         await voucherAPI.deleteVoucher(voucher_id);
         notification.success({
            message: 'Xóa voucher thành công',
            duration: 3,
         });
         fetchVoucherList(); // Refresh list after delete
      } catch (error) {
         notification.error({
            message: 'Lỗi khi xóa voucher',
            duration: 3,
         });
      }
   };

   return (
      <Card
         title="Danh Sách Voucher"
         extra={
            <Button type="primary" onClick={onCreate}>
               Tạo mới
            </Button>
         }
      >
         <Table
            rowKey="voucher_id"
            size="small"
            scroll={{ x: 'max-content' }}
            pagination={{
               size: 'default',
               total: vouchers?.length || 0,
               showSizeChanger: true,
               showQuickJumper: true,
               showTotal: (total) => `Tổng ${total} voucher`,
            }}
            columns={columns}
            dataSource={vouchers}
            loading={loading}
         />
         <VoucherModal {...voucherModalProps} />
      </Card>
import { Button, Card, Popconfirm, App, Tooltip, Input, Spin} from 'antd';
import Table, { ColumnsType } from 'antd/es/table';
import dayjs from 'dayjs';
import { createStyles } from 'antd-style';
import { useState, useEffect } from 'react';
import { useCopyToClipboard } from '@/hooks/event/use-copy-to-clipboard';
import { IconButton, Iconify } from '@/components/icon';
import voucherAPI from '@/redux/api/services/voucherAPI';
import ProTag from '@/theme/antd/components/tag';
import { Voucher } from './entity';
import { VoucherModal } from './voucherModal';
import { useSelector, useDispatch } from 'react-redux';
import { RootState } from '@/redux/stores/store';
import getVouchers from '@api/voucherAPI';
import { setVouchersSlice } from '@/redux/slices/voucherSlice';

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
// Format functions
const formatCurrency = (value?: number): string => {
   if (!value) return '0 ₫';
   return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
   }).format(value);
};

const formatDateTime = (value?: string): string => {
   if (!value) return '';
   return dayjs(value).format('DD/MM/YYYY HH:mm');
};

const DEFAULT_VOUCHER_VALUE: Voucher = {
   voucher_id: 0,
   voucher_code: '',
   voucher_discount_percentage: 0,
   voucher_discount_max_amount: 0,
   voucher_usage_limit: 1,
   voucher_valid_from: '',
   voucher_valid_to: '',
   voucher_created_by: 0,
};
function transformApiResponseToVoucher(apiResponse: any): Voucher {
   return {
      voucher_id: apiResponse.voucher_id,
      voucher_code: apiResponse.voucher_code,
      voucher_discount_percentage: apiResponse.voucher_discount_percentage,
      voucher_discount_max_amount: apiResponse.voucher_discount_max_amount,
      voucher_usage_limit: apiResponse.voucher_usage_limit,
      voucher_valid_from: apiResponse.voucher_valid_from,
      voucher_valid_to: apiResponse.voucher_valid_to,
      voucher_created_by: apiResponse?.voucher_belongto_employee.employee_id,
      created_at: apiResponse.created_at,
      updated_at: apiResponse.updated_at,
   };
}
export default function VoucherPage() {
   const { notification } = App.useApp();
   const [vouchers, setVouchers] = useState<Voucher[]>([]);
   const { styles } = useStyle();
   const [loading, setLoading] = useState(true);
   const [loadingDelete, setLoadingDelete] = useState(false);
   const [error, setError] = useState(null);
   const dispatch = useDispatch();
   const vocherSlice = useSelector((state: RootState) => state.voucher.vouchers);


   const fetchVoucherList = async () => {
      setLoading(true);
      try {
         const data = await voucherAPI.getVouchers();
         setVouchers(data || []);
      } catch (error) {
         notification.error({
            message: 'Lỗi khi tải danh sách voucher',
            duration: 3,
         });
      } finally {
         setLoading(false);
      }
   };

   useEffect(() => {
      fetchVoucherList();
   }, []);

   const handleDelete = (voucher_id: number) => {
      setLoadingDelete(true);
      getVouchers
         .deleteVoucher(voucher_id.toString())
         .then((res) => {
            if (res && res.status === 200) {
               refreshData();
               notification.success({
                  message: `Delete Voucher Success by Id ${voucher_id} !`,
                  duration: 3,
               });
            }
            if (res && (res.status === 400 || res.error === true)) {
               notification.error({
                  message: `Delete Voucher Failed by Id ${voucher_id} !`,
                  duration: 3,
                  description: res.message,
               });
            }
         })
         .catch((error) => {
            notification.error({
               message: `Delete Voucher Failed by Id ${voucher_id} !`,
               duration: 3,
               description: error.message,
            });
         })
         .finally(() => {
            setLoadingDelete(false);
         });
   };
   useEffect(() => {
      setLoading(true);
      getVouchers
         .getVouchers()
         .then((res: any) => {
            dispatch(setVouchersSlice(res.map(transformApiResponseToVoucher)));
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
         const res = await getVouchers.getVouchers();
         dispatch(setVouchersSlice(res.map(transformApiResponseToVoucher)));
      } catch (error) {
         setError(error);
      }
   };

   const [voucherModalProps, setVoucherModalProps] = useState({
      formValue: DEFAULT_VOUCHER_VALUE,
      title: 'New',
      show: false,
      isCreate: true,
      onOk: () => {
         setVoucherModalProps((prev) => ({ ...prev, show: false }));
         fetchVoucherList(); // Refresh data after create/update
      },
      onCancel: () => {
         setVoucherModalProps((prev) => ({ ...prev, show: false }));
      },
   });

   const columns: ColumnsType<Voucher> = [
      {
         title: 'Code',
         dataIndex: 'voucher_code',
         align: 'center',
         render: (phone) => (
            <Input suffix={<CopyButton value={phone.toString()} />} value={phone.toString()} readOnly />
         ),
      },
      {
         title: 'Giảm giá',
         dataIndex: 'voucher_discount_percentage',
         width: 100,
         render: (value) => `${value}%`,
      },
      {
         title: 'Giảm tối đa',
         dataIndex: 'voucher_discount_max_amount',
         width: 150,
         render: (value) => formatCurrency(value),
      },
      {
         title: 'Số lượng',
         dataIndex: 'voucher_usage_limit',
         width: 100,
         align: 'center',
      },
      {
         title: 'Thời gian hiệu lực',
         key: 'validTime',
         width: 300,
         render: (_, record) => (
            <div>
               <ProTag color="processing">
                  Từ: {formatDateTime(record.voucher_valid_from)}
               </ProTag>
               <ProTag color="warning" style={{ marginLeft: 8 }}>
                  Đến: {formatDateTime(record.voucher_valid_to)}
               </ProTag>
            </div>
         ),
      },
      // {
      //    title: 'Thời gian tạo/cập nhật',
      //    key: 'timestamps',
      //    width: 300,
      //    render: (_, record) => (
      //       <div>
      //          <ProTag color="default">
      //             Tạo: {formatDateTime(record.created_at)}
      //          </ProTag>
      //          <ProTag color="default" style={{ marginLeft: 8 }}>
      //             Cập nhật: {formatDateTime(record.updated_at)}
      //          </ProTag>
      //       </div>
      //    ),
      // },
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
                  title="Delete the Office ?"
                  okText="Yes"
                  cancelText="No"
                  placement="left"
                  onCancel={() => {}}
                  onConfirm={() => handleDelete(record.voucher_id)}
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
      setVoucherModalProps((prev) => ({
         ...prev,
         show: true,
         title: 'Tạo Voucher Mới',
         isCreate: true,
         formValue: DEFAULT_VOUCHER_VALUE,
      }));
   };

   const onEdit = (formValue: Voucher) => {
      setVoucherModalProps((prev) => ({
         ...prev,
         show: true,
         title: 'Chỉnh Sửa Voucher',
         isCreate: false,
         formValue,
      }));
   };
   // const renderExpandedRow = (record: Voucher) => (
   //    <div>
   //       <Alert message="Description" description={record.description} type="info" />
   //       <Table<Voucher> columns={expandColumns} dataSource={[record]} pagination={false} />
   //    </div>
   // );

   const content = (
      <Table
         className={styles.customTable}
         rowKey={(record) => record.voucher_id.toString()}
         style={{ width: '100%', flex: 1 }}
         size="small"
         scroll={{ y: 'calc(100vh - 300px)' }}
         pagination={{
            size: 'default',
            total: vouchers?.length || 0,
            showSizeChanger: true,
            showQuickJumper: true,
            showTotal: (total) => `Total ${total} items`,
         }}
         columns={columns as ColumnsType<Voucher>}
         dataSource={error ? [] : vocherSlice || []}
         loading={loading}
      />
   );
   return (
      <Card
         style={{ maxHeight: '100%', minHeight: '100%', display: 'flex', flexDirection: 'column' }}
         styles={{ body: { padding: '0', flex: 1, display: 'flex', flexDirection: 'column' } }}
         title="Office List"
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
         <VoucherModal {...voucherModalProps} />
   </Card>
   );
}