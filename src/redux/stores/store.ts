import { configureStore } from '@reduxjs/toolkit';

import { officeReducer } from '../slices/officeSlice';
import { userReducer } from '../slices/userSlice';

export const store = configureStore({
   reducer: {
      user: userReducer,
      office: officeReducer,
   },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
export default store;
