import { Dayjs } from 'dayjs';
import { Office } from '../office/entity';

export interface EmployeeType {
   employee_type_id: number;
   employee_type_name: string;
   employee_type_description?: string;
   created_at?: string;
   updated_at?: string;
}

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

   employee_belongto_office?: Office;
   employee_belongto_employeeType?: EmployeeType;
}

// Interface cho Form values
export interface EmployeeFormValues extends Omit<Employee, 'employee_birthday'> {
   employee_birthday: Dayjs | null;
}