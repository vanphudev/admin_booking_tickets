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
}
