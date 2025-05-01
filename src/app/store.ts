import { configureStore } from '@reduxjs/toolkit';

import taskTemplateFormSlice from '@/modules/System/pages/TemplateForm/template-form.slice';
import authSlice from '@/modules/Authentication/pages/Login/auth.slice';
import commonSlice from '@/modules/System/pages/common.slice';

const store = configureStore({
  reducer: {
    templateForm: taskTemplateFormSlice,
    auth: authSlice,
    common: commonSlice
  },
  middleware(getDefaultMiddleware) {
    return getDefaultMiddleware({ serializableCheck: false });
  }
});

// Infer the `RootState` and `AppDispatch` types from the store itself
export type RootState = ReturnType<typeof store.getState>;
// Inferred type: {posts: PostsState, comments: CommentsState, users: UsersState}
export type AppDispatch = typeof store.dispatch;

export default store;
