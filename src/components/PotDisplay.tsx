// src/components/PotDisplay.tsx
import React, { FunctionComponent } from "react";
import { useAppSelector } from "../store/hooks";
import "./PotDisplay.scss"; // اگر میخوای استایل اختصاصی داشته باشی

const PotDisplay: FunctionComponent = () => {
  const potCoins = useAppSelector((state) => state.pot.coins);

  return (
    <div className="Pot-display">
      <span className="Pot-label">Pot:</span>
      <span className="Pot-coins">{potCoins} 🪙</span>
    </div>
  );
};

export default PotDisplay;
