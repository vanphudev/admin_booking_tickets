import { Dayjs } from 'dayjs';
// import { Office } from '../office/entity';

export interface Employee {
   employee_id: number;
   employee_full_name: string;
   employee_email: string;
   employee_phone: string;
   employee_username: string;
   employee_birthday?: string;
   employee_password?: string;
   employee_profile_image?: string;
   employee_profile_image_public_id?: string;
   employee_gender?: -1 | 0 | 1;
   is_first_activation?: 0 | 1;
   is_locked: 0 | 1;
   last_lock_at?: string;
   office_id?: number;
   employee_type_id?: number;
   created_at?: string;
   updated_at?: string;
   deleted_at?: string;

   employee_belongto_office?: {
      id: number; // office_id
      name: string; // office_name
      phone?: string; // office_phone
      fax?: string; // office_fax
      description?: string; // office_description
      latitude?: number; // office_latitude
      longitude?: number; // office_longitude
      mapUrl?: string; // office_map_url
      isLocked?: 0 | 1; // is_locked
      lastLockAt?: string | null; // last_lock_at
      Address?: {
         province: string | null;
         district: string | null;
         ward: string | null;
         street: string | null;
      };
      images?: File[];
   };
   employee_belongto_employeeType?: {
      employee_type_id: number;
      employee_type_name: string;
      employee_type_description?: string;
};
}

// Interface cho Form values
export interface EmployeeFormValues extends Omit<Employee, 'employee_birthday'> {
   employee_birthday: Dayjs | null;
}