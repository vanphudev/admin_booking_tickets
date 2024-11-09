export interface Vehicle {
   id: number; // vehicle_id
   code: string; // vehicle_code
   name: string; // vehicle_license_plate
   model?: string; // vehicle_model
   brand?: string; // vehicle_brand
   capacity: number; // vehicle_capacity
   manufactureYear?: number; // vehicle_manufacture_year
   color?: string; // vehicle_color
   description?: string; // vehicle_description
   isLocked?: 0 | 1; // is_locked
   lastLockAt?: string | null; // last_lock_at
   createdAt?: string; // created_at
   updatedAt?: string; // updated_at
   mapVehicleLayoutId?: number; // map_vehicle_layout_id
   officeId?: number; // office_id
   vehicleTypeId?: number; // vehicle_type_id
   images?: (string | File)[];
}
