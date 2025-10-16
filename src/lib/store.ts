import { configureStore, createSlice } from '@reduxjs/toolkit';

const initialState = { count: 0 };

const exampleSlice = createSlice({
	name: 'example',
	initialState,
	reducers: {
		increment(state) {
			state.count += 1;
		},
		decrement(state) {
			state.count -= 1;
		},
	},
});

export const { increment, decrement } = exampleSlice.actions;

export const store = configureStore({
	reducer: {
		example: exampleSlice.reducer,
	},
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
