export interface PaymentMethod {
   payment_method_id?: number;
   payment_method_code: string;
   payment_method_name: string;
   isLocked: 0 | 1;
   lastLockAt?: string;
   images?: string[];
   payment_method_description?: string;
   createdAt?: string;
   updatedAt?: string;
   payment_type_id?: number;
   paymentMethod_belongto_paymentType?: {
      id: number;
      name: string;
      createdAt?: string;
      updatedAt?: string;
   };
   paymentMethod_onetoOne_paymentConfig?: {
      payment_config_id: number; // map_vehicle_layout_id
      api_key: string; // layout_name
      secret_key: string; // layout_name
      public_key: string; // layout_name
      payment_endpoint_url: string; // layout_name
      transaction_timeout: number; // layout_name
      environment: string; // layout_name
      refund_url: string; // layout_name
      is_deleted: number; // layout_name
      createdAt?: string;
      updatedAt?: string;
      payment?: PaymentMethod[];
   };
}
// export interface PaymentType {
//    id: number;
//    name: string;
//    createdAt?: string;
//    updatedAt?: string;
// }

// export interface PaymentConfig {
//    payment_config_id: number; // map_vehicle_layout_id
//    api_key: string; // layout_name
//    secret_key: string; // layout_name
//    public_key: string; // layout_name
//    payment_endpoint_url: string; // layout_name
//    transaction_timeout: number; // layout_name
//    environment: string; // layout_name
//    refund_url: string; // layout_name
//    is_deleted: number; // layout_name
//    createdAt?: string;
//    updatedAt?: string;
//    payment?: PaymentMethod[]; // mapVehicleLayout_to_mapVehicleSeat array
// }
