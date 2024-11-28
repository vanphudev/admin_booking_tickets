import { Dayjs } from 'dayjs';

// Interface cho Employee
export interface Employee {
// Đổi tên interface từ Employee thành VoucherEmployee
export interface VoucherEmployee {
   employee_id: number;
   employee_full_name: string;
   employee_email: string;
   employee_phone?: string;
}

// Interface chính cho Voucher từ API
export interface Voucher {
   voucher_id: number;
   voucher_code: string;
   voucher_discount_percentage: number;
   voucher_discount_max_amount: number;
   voucher_usage_limit: number;
   voucher_valid_from: string;
   voucher_valid_to: string;
   voucher_created_by: number;
   created_at?: string;
   updated_at?: string;
   voucher_belongto_employee?: Employee;
   voucher_belongto_employee?: VoucherEmployee; // Sử dụng VoucherEmployee thay vì Employee
}

// Interface cho Form values
export interface VoucherFormValues extends Omit<Voucher, 'voucher_valid_from' | 'voucher_valid_to'> {
   voucher_valid_from: Dayjs | null;
   voucher_valid_to: Dayjs | null;
}
   employee_id?: number;
}
