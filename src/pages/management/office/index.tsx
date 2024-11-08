import { Button, Card, Popconfirm, Avatar } from 'antd';
import Table, { ColumnsType } from 'antd/es/table';
import { useState, useEffect } from 'react';
import { useDispatch } from 'react-redux';

import { IconButton, Iconify } from '@/components/icon';
import addressAPI from '@/redux/api/services/adressAPI';
import getOffices from '@/redux/api/services/officeAPI';
import { setProvinces, setDistricts, setWards } from '@/redux/slices/adressSlice';
import ProTag from '@/theme/antd/components/tag';

import { Office } from './entity';
import { OfficeModal, OfficeModalProps } from './officeModal';

const DEFAULE_OFFICE_VALUE: Office = {
   id: 0,
   name: '',
   phone: '',
   fax: '',
   description: '',
   latitude: 0,
   longitude: 0,
   mapUrl: '',
   isLocked: 0,
   lastLockAt: '',
   createdAt: '',
   updatedAt: '',
   Address: {
      province: null,
      district: null,
      ward: null,
      street: '',
   },
   images: [],
};

function transformApiResponseToOffice(apiResponse: any): Office {
   return {
      id: apiResponse.office_id,
      name: apiResponse.office_name,
      phone: apiResponse.office_phone,
      fax: apiResponse.office_fax,
      description: apiResponse.office_description,
      latitude: apiResponse.office_latitude,
      longitude: apiResponse.office_longitude,
      mapUrl: apiResponse.office_map_url,
      isLocked: apiResponse.is_locked === 1 ? 1 : 0,
      lastLockAt: apiResponse.last_lock_at || '',
      createdAt: apiResponse.created_at,
      updatedAt: apiResponse.updated_at,
      Address: {
         province: apiResponse.office_belongto_ward.ward_belongto_district.district_belongto_province.province_id,
         district: apiResponse.office_belongto_ward.ward_belongto_district.district_id,
         ward: apiResponse.office_belongto_ward.ward_id,
         street: apiResponse.office_address,
      },
      images: apiResponse.office_to_officeImage.map((image: any) => image.office_image_url),
   };
}

export default function OfficePage() {
   const dispatch = useDispatch();
   useEffect(() => {
      addressAPI.getProvinces().then((res) => {
         dispatch(setProvinces(res));
      });
      addressAPI.getDistrictsAll().then((res) => {
         dispatch(setDistricts(res));
      });
      addressAPI.getWardsAll().then((res) => {
         dispatch(setWards(res));
      });
   }, [dispatch]);

   const [loading, setLoading] = useState(true);
   const [error, setError] = useState(null);
   const [offices, setOffices] = useState<any[]>([]);

   useEffect(() => {
      getOffices
         .getOffices()
         .then((res: any) => {
            console.log('res', res);
            setOffices(res.map(transformApiResponseToOffice));
            setLoading(false);
         })
         .catch((error) => {
            setError(error);
            setLoading(false);
         });
   }, []);

   const [officeModalPros, setOfficeModalProps] = useState<OfficeModalProps>({
      formValue: {
         ...DEFAULE_OFFICE_VALUE,
      },
      title: 'New',
      show: false,
      isCreate: true,
      onOk: () => {
         setOfficeModalProps((prev) => ({ ...prev, show: false }));
      },
      onCancel: () => {
         setOfficeModalProps((prev) => ({ ...prev, show: false }));
      },
   });

   const columns: ColumnsType<Office> = [
      {
         title: 'Name',
         dataIndex: 'name',
         fixed: 'left',
      },
      {
         title: 'Images',
         dataIndex: 'images',
         render: (images) => (
            <Avatar.Group max={{ count: 3 }} size="large">
               {images && images.length > 0 ? (
                  images.map((image: string, index: number) => (
                     <Avatar key={index} src={image} alt={`Office Image ${index + 1}`} />
                  ))
               ) : (
                  <ProTag color="default">No Image</ProTag>
               )}
            </Avatar.Group>
         ),
         fixed: 'left',
      },
      {
         title: 'Phone',
         dataIndex: 'phone',
      },
      {
         title: 'Fax',
         dataIndex: 'fax',
      },
      {
         title: 'Description',
         dataIndex: 'description',
      },
      {
         title: 'Location',
         key: 'location',
         render: (_, record) => {
            const { latitude, longitude, mapUrl } = record;
            return (
               <div>
                  <div>
                     Lat: {latitude}, Long: {longitude}
                  </div>
                  {mapUrl && (
                     <a href={mapUrl} target="_blank" rel="noopener noreferrer">
                        View on Map
                     </a>
                  )}
               </div>
            );
         },
      },
      {
         title: 'Lock Status',
         key: 'lockStatus',
         render: (_, record) => {
            const { isLocked, lastLockAt } = record;
            return (
               <div>
                  <ProTag color={isLocked === 1 ? 'error' : 'success'}>{isLocked === 1 ? 'Locked' : 'Unlocked'}</ProTag>
                  {isLocked === 1 && lastLockAt && (
                     <div style={{ marginTop: 4 }}>
                        <small>Last Locked At: {lastLockAt}</small>
                     </div>
                  )}
               </div>
            );
         },
      },
      {
         title: 'Timestamps',
         key: 'timestamps',
         render: (_, record) => (
            <div>
               <ProTag color="default">Created: {record.createdAt}</ProTag>
               <ProTag color="default" style={{ marginLeft: 8 }}>
                  Updated: {record.updatedAt}
               </ProTag>
            </div>
         ),
      },
      {
         title: 'Address',
         key: 'address',
         render: (_, record) => {
            return record.Address?.street || 'No Address Available';
         },
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
               <Popconfirm title="Delete the Role" okText="Yes" cancelText="No" placement="left">
                  <IconButton>
                     <Iconify icon="mingcute:delete-2-fill" size={18} className="text-error" />
                  </IconButton>
               </Popconfirm>
            </div>
         ),
      },
   ];

   const onCreate = () => {
      setOfficeModalProps((prev) => ({
         ...prev,
         show: true,
         title: 'Create New',
         isCreate: true,
         formValue: {
            ...prev.formValue,
            ...DEFAULE_OFFICE_VALUE,
         },
      }));
   };

   const onEdit = (formValue: Office) => {
      setOfficeModalProps((prev) => ({
         ...prev,
         show: true,
         title: 'Edit',
         isCreate: false,
         formValue,
      }));
   };

   return (
      <Card
         title="Office List"
         extra={
            <Button type="primary" onClick={onCreate}>
               New
            </Button>
         }
      >
         <Table
            rowKey="id"
            size="small"
            scroll={{ x: 'max-content' }}
            pagination={{
               size: 'default',
               total: offices?.length || 0,
               showSizeChanger: true,
               showQuickJumper: true,
               showTotal: (total) => `Total ${total} items`,
            }}
            columns={columns}
            dataSource={error ? [] : offices || []}
            loading={loading}
         />
         <OfficeModal {...officeModalPros} />
      </Card>
   );
}
