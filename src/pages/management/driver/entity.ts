export interface Driver {
   driver_id: number; // ID của tài xế
   driver_license_number: string; // Số giấy phép lái xe
   driver_experience_years: number; // Số năm kinh nghiệm lái xe
   createdAt?: string; // Thời gian tạo bản ghi
   updatedAt?: string; // Thời gian cập nhật bản ghi
   driver_onetoOne_employee: Employee; // Thông tin nhân viên liên quan
   images?: File[]; // Danh sách hình ảnh
}

export interface Employee {
   employee_id: number; // ID của nhân viên
   employee_full_name: string; // Họ và tên của nhân viên
   employee_email?: string; // Email của nhân viên
   employee_phone?: string; // Số điện thoại của nhân viên
   employee_username?: string; // Tên đăng nhập của nhân viên
   employee_birthday?: string; // Ngày sinh của nhân viên
   employee_password?: string; // Mật khẩu của nhân viên
   employee_profile_image?: string; // Hình ảnh của nhân viên
   employee_gender?: 0 | 1; // Giới tính của nhân viên
   is_first_activation?: number; // Trạng thái kích hoạt lần đầu
   is_locked?: number; // Trạng thái khóa tài khoản
   last_lock_at?: string; // Thời gian khóa tài khoản gần nhất
   office_id?: number; // ID văn phòng
   employee_type_id?: number; // ID loại nhân viên
   createdAt?: string; // Thời gian tạo bản ghi
   updatedAt?: string; // Thời gian cập nhật bản ghi
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
