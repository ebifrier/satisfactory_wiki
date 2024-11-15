import { combineReducers, configureStore } from "@reduxjs/toolkit";
import { useDispatch, useSelector, TypedUseSelectorHook } from "react-redux";
import { persistReducer, persistStore } from "redux-persist";
import storage from "redux-persist/lib/storage";
import compChartSlice from "./slices/compchartSlice";

const persistConfig = {
  key: "root",
  storage,
};

const rootReducer = combineReducers({
  compChart: compChartSlice.reducer,
});

const store = configureStore({
  reducer: persistReducer(persistConfig, rootReducer),
});

export const persistor = persistStore(store);
export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
export const useAppDispatch = useDispatch.withTypes<AppDispatch>();
export const useAppSelector: TypedUseSelectorHook<RootState> = useSelector;

export default store;
