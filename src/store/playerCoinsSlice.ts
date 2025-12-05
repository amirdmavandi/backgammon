      import { createSlice, createAsyncThunk, PayloadAction } from "@reduxjs/toolkit";
import axios from "axios";

interface PlayerCoinsState {
  playerOne: number;
  playerTwo: number;
  loading: boolean;
  error: string | null;
}

const initialState: PlayerCoinsState = {
  playerOne: 0,
  playerTwo: 0,
  loading: false,
  error: null,
};

// ----------------------------------------------------
// 1) دریافت سکه‌های کاربر از وردپرس (myCRED)
// ----------------------------------------------------
export const fetchCoinsFromWP = createAsyncThunk(
  "playerCoins/fetchCoinsFromWP",
  async (userId: number) => {
    const res = await axios.get(
      `https://khodrodivar.info/barandesho/wp-json/mycred/v1/balance/${userId}`
    );
    return { userId, balance: res.data.balance ?? 0 }; // اگر کاربر سکه نداشته باشه صفر برمیگرده
  }
);

// ----------------------------------------------------
// 2) آپدیت کردن سکه در وردپرس (برد/باخت)
// ----------------------------------------------------
export const updateCoinsToWP = createAsyncThunk(
  "playerCoins/updateCoinsToWP",
  async ({
    userId,
    amount,
    type,
  }: {
    userId: number;
    amount: number;
    type: "add" | "subtract";
  }) => {
    const url =
      type === "add"
        ? "https://khodrodivar.info/barandesho/wp-json/mycred/v1/add"
        : "https://khodrodivar.info/barandesho/wp-json/mycred/v1/subtract";

    await axios.post(url, {
      user_id: userId,
      amount,
      log_entry: "Backgammon Game",
    });

    return { userId, amount, type };
  }
);

// ----------------------------------------------------
// Slice
// ----------------------------------------------------
const playerCoinsSlice = createSlice({
  name: "playerCoins",
  initialState,
  reducers: {
    localSetCoins: (
      state,
      action: PayloadAction<{ player: "playerOne" | "playerTwo"; amount: number }>
    ) => {
      state[action.payload.player] = action.payload.amount;
    },
  },

  extraReducers: (builder) => {
    // ===== Fetch Coins =====
    builder.addCase(fetchCoinsFromWP.pending, (state) => {
      state.loading = true;
    });
    builder.addCase(fetchCoinsFromWP.fulfilled, (state, action) => {
      state.loading = false;
      if (action.payload.userId === 1) state.playerOne = action.payload.balance;
      if (action.payload.userId === 102) state.playerTwo = action.payload.balance;
    });
    builder.addCase(fetchCoinsFromWP.rejected, (state) => {
      state.loading = false;
      state.error = "Error fetching coins from WordPress";
    });

    // ===== Update Coins =====
    builder.addCase(updateCoinsToWP.fulfilled, (state, action) => {
      const { userId, amount, type } = action.payload;
      if (userId === 1) state.playerOne += type === "add" ? amount : -amount;
      if (userId === 102) state.playerTwo += type === "add" ? amount : -amount;
    });
  },
});

export const { localSetCoins } = playerCoinsSlice.actions;
export default playerCoinsSlice.reducer;
