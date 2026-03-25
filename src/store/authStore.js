import { configureStore } from "@reduxjs/toolkit";
import { persistStore, persistReducer } from 'redux-persist';
import storage from 'redux-persist/lib/storage'; // localStorage
import authReducer from "./authSlice";

// Persist config using localStorage
const persistConfig = {
    key: 'auth',
    storage: storage,
};

const persistedAuthReducer = persistReducer(persistConfig, authReducer);

const store = configureStore({
    reducer: {
        auth: persistedAuthReducer,
    },
    middleware: (getDefaultMiddleware) =>
        getDefaultMiddleware({
            serializableCheck: {
                ignoredActions: [
                    'persist/PERSIST',
                    'persist/REHYDRATE',
                    'persist/REGISTER',
                    'persist/PURGE',
                    'persist/FLUSH'
                ],
            },
        }),
});

export const persistor = persistStore(store);
export { store };