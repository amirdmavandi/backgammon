import { createSlice, PayloadAction } from "@reduxjs/toolkit";

interface PlayerCoinsState {
  playerOne: number;
  playerTwo: number;
}

const initialState: PlayerCoinsState = {
  playerOne: 100, // شروع با 100 سکه
  playerTwo: 100,
};

const playerCoinsSlice = createSlice({
  name: "playerCoins",
  initialState,
  reducers: {
    addCoins: (state, action: PayloadAction<{ player: "playerOne" | "playerTwo"; amount: number }>) => {
      state[action.payload.player] += action.payload.amount;
    },
    subtractCoins: (state, action: PayloadAction<{ player: "playerOne" | "playerTwo"; amount: number }>) => {
      state[action.payload.player] -= action.payload.amount;
      if (state[action.payload.player] < 0) state[action.payload.player] = 0;
    },
    setCoins: (state, action: PayloadAction<{ player: "playerOne" | "playerTwo"; amount: number }>) => {
      state[action.payload.player] = action.payload.amount;
    },
  },
});

export const { addCoins, subtractCoins, setCoins } = playerCoinsSlice.actions;
export default playerCoinsSlice.reducer;
