import { Office } from '../office/entity';

export interface Vehicle {
   id: number;
   code: string;
   name: string;
   model?: string;
   brand?: string;
   capacity: number;
   manufactureYear?: number;
   color?: string;
   description?: string;
   isLocked?: 0 | 1;
   lastLockAt?: string | null;
   createdAt?: string;
   updatedAt?: string;
   mapVehicleLayout?: MapVehicleLayout;
   office?: Office;
   vehicleType?: VehicleType;
   images?: File[];
}

export interface MapVehicleSeat {
   id: number;
   code: string;
   row_no: number;
   column_no: number;
   floor_no: number;
   lock_chair: boolean;
   createdAt?: string;
   updatedAt?: string;
   layout?: MapVehicleLayout;
}

export interface MapVehicleLayout {
   id: number;
   name: string;
   createdAt?: string;
   updatedAt?: string;
}

export interface VehicleType {
   id: number;
   name: string;
   id: number; // vehicle_id
   code: string; // vehicle_code
   license_plate: string; // vehicle_license_plate
   model?: string; // vehicle_model
   brand?: string; // vehicle_brand
   capacity: number; // vehicle_capacity
   manufacture_year?: number; // vehicle_manufacture_year
   color?: string; // vehicle_color
   description?: string; // vehicle_description
   isLocked?: 0 | 1;
   lastLockAt?: string | null;
   createdAt?: string; // created_at
   updatedAt?: string; // updated_at
   mapVehicleLayout?: MapVehicleLayout;
   vehicleType?: VehicleType;
   images?: string[]; // vehicle_to_vehicleImage array
   office?: Office;
}

export interface MapVehicleSeat {
   id: number; // map_vehicle_seat_id
   code: string; // map_vehicle_seat_code
   rowNo: number; // map_vehicle_seat_row_no
   columnNo: number; // map_vehicle_seat_column_no
   floorNo: number; // map_vehicle_seat_floor_no
   lockChair: boolean; // map_vehicle_seat_lock_chair
   createdAt?: string;
   updatedAt?: string;
   layoutId?: number; // map_vehicle_layout_id
}

export interface MapVehicleLayout {
   id: number; // map_vehicle_layout_id
   name: string; // layout_name
   createdAt?: string;
   updatedAt?: string;
   seats?: MapVehicleSeat[]; // mapVehicleLayout_to_mapVehicleSeat array
}

export interface VehicleType {
   id: number; // vehicle_type_id
   name: string; // vehicle_type_name
   description?: string; // vehicle_type_description
   createdAt?: string;
   updatedAt?: string;
}
