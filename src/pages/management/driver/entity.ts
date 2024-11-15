import { Dayjs } from 'dayjs';
import { Employee } from '../employee/entity';

export interface Driver {
   driver_id: number;
   driver_license_number: string;
   driver_experience_years: number;
   created_at?: string;
   updated_at?: string;
   deleted_at?: string;
   employee_id: number;
   employee?: {
      employee_id: number;
      employee_full_name: string;
      employee_email: string;
      employee_phone: string;
      employee_username: string;
      employee_birthday?: string;
      employee_gender?: -1 | 0 | 1;
      employee_profile_image?: string;
      is_first_activation?: 0 | 1;
      is_locked: 0 | 1;
      office_id?: number;
      employee_type_id?: number;
   };
}

// Interface cho Form values
export interface DriverFormValues extends Omit<Driver, 'created_at' | 'updated_at' | 'deleted_at'> {
   employee_id: number;
   driver_license_number: string;
   driver_experience_years: number;
}
