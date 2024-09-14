import { configureStore } from '@reduxjs/toolkit';
import apiSlice from './api/apiSlice';
import userReducer from '../features/user/userSlice';

const store = configureStore({
    reducer: {
        [apiSlice.reducerPath]: apiSlice.reducer,
        user: userReducer,
    },
    middleware: (getdefaultMiddleware) =>
        getdefaultMiddleware().concat(apiSlice.middleware),
    devTools: true,
});

export default store;