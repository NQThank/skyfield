import { createSlice, PayloadAction } from '@reduxjs/toolkit';

import { LocalStorageKeyEnum, SliceEnum } from '@/core/enums';
import { AuthSlice, SessionUser } from '@/core/types';
import { StorageHelper } from '@/utils/helpers';

const name = SliceEnum['auth'];

const initialState: AuthSlice = {
  user: StorageHelper.getItem(LocalStorageKeyEnum.auth) ?? null,
  loading: false,
  isCollapsed: false
};

const authSlice = createSlice({
  name,
  initialState,
  reducers: {
    setUser(state, action: PayloadAction<SessionUser | null>) {
      state.user = action.payload;
    },
    setCollapse(state) {
      state.isCollapsed = !state.isCollapsed;
    }
  },
  extraReducers() {}
});

// Action creators are generated for each case reducer function
const { reducer, actions } = authSlice;

export const { setUser, setCollapse } = actions;

export default reducer;
