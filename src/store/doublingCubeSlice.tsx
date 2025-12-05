import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { Player } from "../Types";

export type DoublingCubeData = {
  owner: Player | null;      // مالک فعلی دوبل
  gameStakes: number;        // مقدار Pot یا مقدار دوبل
  enabled: boolean;          // آیا دوبل فعال است؟
};

export const InitialDoublingCubeState: DoublingCubeData = {
  owner: null,
  gameStakes: 1,
  enabled: true,
};

export const doublingCubeSlice = createSlice({
  name: "doublingCube",
  initialState: InitialDoublingCubeState,
  reducers: {
    // تنظیم کل داده‌های دوبل
    setDoublingCubeData: (
      _,
      action: PayloadAction<DoublingCubeData>
    ) => action.payload,

    // تغییر مالک دوبل
    setDoublingOwner: (state, action: PayloadAction<Player>) => {
      state.owner = action.payload;
    },

    // افزایش مقدار Pot یا Stakes
    increaseStakes: (state, action: PayloadAction<number>) => {
      state.gameStakes *= action.payload;
    },

    // تنظیم مقدار Pot به عدد مشخص
    setPotCoins: (state, action: PayloadAction<number>) => {
      state.gameStakes = action.payload;
    },

    // غیر فعال کردن دوبل (مثلاً بعد از پایان بازی)
    disableDoubling: (state) => {
      state.enabled = false;
    },

    // ریست کامل دوبل برای بازی جدید
    resetDoublingCube: (state) => {
      state.owner = null;
      state.gameStakes = 1;
      state.enabled = true;
    },
  },
});

export const {
  setDoublingCubeData,
  setDoublingOwner,
  increaseStakes,
  setPotCoins,
  disableDoubling,
  resetDoublingCube,
} = doublingCubeSlice.actions;

export default doublingCubeSlice.reducer;
