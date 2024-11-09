export interface Driver {
   driver_id?: number;
   driver_license_number: string;
   driver_experience_years: number;
   created_at?: string;
   updated_at?: string;
   employee_id?: number;
   Employee?: {
      employee_full_name: string;
      employee_email: string;
      employee_phone: string;
      employee_username: string;
   };
}

export const DEFAULT_DRIVER: Driver = {
   driver_license_number: '',
   driver_experience_years: 0,
   Employee: {
      employee_full_name: '',
      employee_email: '',
      employee_phone: '',
      employee_username: '',
   },
};
