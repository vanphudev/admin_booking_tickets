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
}
