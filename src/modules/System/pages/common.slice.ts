import { createSlice, PayloadAction } from '@reduxjs/toolkit';

type NameMap = {
  [key: string]: string;
};

type CommonState = {
  nameMap: NameMap;
};

const initialState: CommonState = {
  nameMap: {}
};

export const commonSlice = createSlice({
  name: 'common',
  initialState,
  reducers: {
    setNameMap(state, action: PayloadAction<NameMap>) {
      state.nameMap = action.payload;
    },
    resetCommon() {
      return initialState;
    }
  }
});

const { actions, reducer } = commonSlice;
export const { setNameMap, resetCommon } = actions;

export default reducer;
