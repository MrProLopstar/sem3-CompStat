import {createSlice} from '@reduxjs/toolkit';

const router = createSlice({
  name: "app",
  initialState: {
		title: '',
		arr: null
  },
  reducers: {
		setPageState: (state, {payload}) => {
			if(payload.title) state.title = payload.title;
			if(payload.arr) state.arr = payload.arr;
		}
  }
});

export const { setPageState } = router.actions;
export default router.reducer;