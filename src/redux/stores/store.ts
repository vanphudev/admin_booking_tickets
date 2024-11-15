import { configureStore } from '@reduxjs/toolkit';
import { addressReducer } from '../slices/adressSlice';
import { officeReducer } from '../slices/officeSlice';
import { userReducer } from '../slices/userSlice';
import { vehicleTypeReducer } from '../slices/vehicleSlice';
import { paymentMethodReducer } from '../slices/paymentMethodSlice';
import employeeReducer from '../slices/employeeSlice';
import employeeTypeReducer from '../slices/employeeTypeSlice';
import driverReducer from '../slices/driverSlice';

export const store = configureStore({
   reducer: {
      user: userReducer,
      office: officeReducer,
      address: addressReducer,
      vehicleType: vehicleTypeReducer,
      paymentMethod: paymentMethodReducer,
      driver: driverReducer,
      employee: employeeReducer,
      employeeType: employeeTypeReducer,
   },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

export default store;
