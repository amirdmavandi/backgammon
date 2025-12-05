// src/store/potSlice.ts
import { createSlice, PayloadAction } from "@reduxjs/toolkit";

interface PotState {
  coins: number;
}

const initialState: PotState = {
  coins: 0, // مقدار اولیه Pot
};

const potSlice = createSlice({
  name: "pot",
  initialState,
  reducers: {
    // تنظیم مقدار Pot (مثلاً ابتدای بازی 20 سکه)
    setPotCoins: (state, action: PayloadAction<number>) => {
      state.coins = action.payload;
    },

    // اضافه کردن سکه به Pot (مثلاً هنگام دوبل یا شرط بیشتر)
    addToPot: (state, action: PayloadAction<number>) => {
      state.coins += action.payload;
    },

    // ریست کردن Pot (مثلاً بعد از پایان بازی)
    resetPot: (state) => {
      state.coins = 0;
    },
  },
});

export const { setPotCoins, addToPot, resetPot } = potSlice.actions;
export default potSlice.reducer;
