import { App, Button, Card, Popconfirm, Avatar } from 'antd';
import Table, { ColumnsType } from 'antd/es/table';
import { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';

import { IconButton, Iconify } from '@/components/icon';
import paymentMethodAPI from '@/redux/api/services/paymentMethodAPI';
import { fetchPaymentMethods } from '@/redux/slices/paymentMethodSlice';
import { RootState, AppDispatch } from '@/redux/stores/store';
import ProTag from '@/theme/antd/components/tag';

import { PaymentMethod } from './entity';
import { PaymentMethodModal } from './paymentMethodModal';

// Thêm interface PaymentType
interface PaymentType {
   payment_type_id: number;
   payment_type_name: string;
}

const DEFAULT_PAYMENT_METHOD: PaymentMethod = {
   payment_method_code: '',
   payment_method_name: '',
   payment_method_description: '',
   is_locked: 0,
   payment_type_id: undefined,
};

function PaymentMethodPage() {
   const dispatch = useDispatch<AppDispatch>();
   const { notification } = App.useApp();
   const { paymentMethods, loading } = useSelector((state: RootState) => state.paymentMethod);
   const [paymentTypes, setPaymentTypes] = useState<PaymentType[]>([]);

   const [modalData, setModalData] = useState({
      formValue: DEFAULT_PAYMENT_METHOD,
      title: '',
      show: false,
      isCreate: true,
   });

   useEffect(() => {
      // Fetch payment types
      paymentMethodAPI
         .getPaymentTypes()
         .then((data) => {
            console.log('Payment Types:', data); // Thêm log để kiểm tra
            setPaymentTypes(data);
         })
         .catch((error) => {
            notification.error({
               message: 'Có lỗi xảy ra khi tải loại thanh toán',
               description: error.message,
            });
         });

      // Fetch payment methods
      dispatch(fetchPaymentMethods())
         .unwrap()
         .then((data) => {
            console.log('Payment Methods:', data); // Thêm log để kiểm tra
         })
         .catch((error) => {
            notification.error({
               message: 'Có lỗi xảy ra khi tải phương thức thanh toán',
               description: error.message,
            });
         });
   }, [dispatch, notification]);

   const columns: ColumnsType<PaymentMethod> = [
      {
         title: 'ID',
         dataIndex: 'payment_method_code',
         width: 120,
         fixed: 'left',
      },
      {
         title: 'Tên',
         dataIndex: 'payment_method_name',
         width: 200,
         fixed: 'left',
      },
      {
         title: 'Avatar',
         dataIndex: 'payment_method_avatar_url',
         width: 100,
         render: (avatar) =>
            avatar ? <Avatar src={avatar} size="large" /> : <ProTag color="default">No Image</ProTag>,
      },
      {
         title: 'Description',
         dataIndex: 'payment_method_description',
         width: 250,
      },
      {
         title: 'Loại thanh toán',
         dataIndex: 'payment_type_id',
         width: 150,
         render: (typeId) => {
            const type = paymentTypes.find((t) => t.payment_type_id === typeId);
            return type?.payment_type_name || 'N/A';
         },
      },
      {
         title: 'Trạng thái',
         dataIndex: 'is_locked',
         width: 120,
         render: (is_locked) => (
            <ProTag color={is_locked === 1 ? 'error' : 'success'}>{is_locked === 1 ? 'Đã khóa' : 'Hoạt động'}</ProTag>
         ),
      },
      {
         title: 'Thời gian',
         width: 200,
         render: (_, record) => (
            <div className="flex flex-col gap-2">
               <span>Tạo: {record.created_at}</span>
               <span>Cập nhật: {record.updated_at}</span>
               {record.last_lock_at && <span>Khóa: {record.last_lock_at}</span>}
            </div>
         ),
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
                  title="Xóa phương thức thanh toán"
                  description="Bạn có chắc muốn xóa phương thức thanh toán này?"
                  onConfirm={() => handleDelete(record.payment_method_id!)}
               >
                  <IconButton>
                     <Iconify icon="solar:trash-bin-trash-bold-duotone" className="text-error" />
                  </IconButton>
               </Popconfirm>
            </div>
         ),
      },
   ];

   const handleCreate = () => {
      setModalData({
         title: 'Thêm phương thức thanh toán',
         show: true,
         isCreate: true,
         formValue: DEFAULT_PAYMENT_METHOD,
      });
   };

   const handleEdit = (record: PaymentMethod) => {
      setModalData({
         title: 'Sửa phương thức thanh toán',
         show: true,
         isCreate: false,
         formValue: record,
      });
   };

   const handleDelete = async (id: number) => {
      try {
         await paymentMethodAPI.deletePaymentMethod(id.toString());
         notification.success({
            message: 'Xóa phương thức thanh toán thành công',
         });
         dispatch(fetchPaymentMethods());
      } catch (error: any) {
         notification.error({
            message: 'Có lỗi xảy ra',
            description: error.message,
         });
      }
   };

   return (
      <Card
         title="Payment Method List"
         extra={
            <Button type="primary" onClick={handleCreate}>
               Thêm mới
            </Button>
         }
      >
         <Table
            columns={columns}
            dataSource={paymentMethods}
            loading={loading}
            rowKey="payment_method_id"
            scroll={{ x: 1500 }}
            pagination={{
               showSizeChanger: true,
               showQuickJumper: true,
               showTotal: (total) => `Tổng ${total} bản ghi`,
            }}
         />
         <PaymentMethodModal
            {...modalData}
            paymentTypes={paymentTypes}
            onCancel={() => setModalData((prev) => ({ ...prev, show: false }))}
            onOk={() => {
               setModalData((prev) => ({ ...prev, show: false }));
               dispatch(fetchPaymentMethods());
            }}
         />
      </Card>
   );
}

export default PaymentMethodPage;
