           import { FunctionComponent, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import GameBoard from "./GameBoard";
import { Player } from "./Types";
import PlayerCard, { PlayerCardSide } from "./PlayerCard";
import SettingsMenu from "./SettingsMenu";
import GameOverDialog from "./GameOverDialog";
import { RootState } from "./store"; 
import { handleGameOverCoins } from "./store/playerCoinsSlice";

type GameRoomProps = {
  playerPerspective: Player;
  playerOneScore: number;
  playerTwoScore: number;
  stakeAmount: number; // همیشه 10 سکه به وسط منتقل می‌کنیم
};

const GameRoom: FunctionComponent<GameRoomProps> = ({
  playerPerspective,
  playerOneScore,
  playerTwoScore,
  stakeAmount,
}: GameRoomProps) => {
  const dispatch = useDispatch();
  const pot = useSelector((state: RootState) => state.pot.coins);

  useEffect(() => {
    // وقتی بازی تمام شد، بررسی برنده و انتقال سکه
    if (playerOneScore !== 0 || playerTwoScore !== 0) {
      let winnerUserId: number | null = null;
      let loserUserId: number | null = null;

      if (playerOneScore > playerTwoScore) {
        winnerUserId = 1;
        loserUserId = 2;
      } else if (playerTwoScore > playerOneScore) {
        winnerUserId = 2;
        loserUserId = 1;
      }

      if (winnerUserId && loserUserId) {
        dispatch(
          handleGameOverCoins({
            winnerUserId,
            loserUserId,
            amount: stakeAmount,
          })
        );
        alert(`Player ${winnerUserId} won! Coins transferred.`);
      } else {
        alert("Game tied! No coins transferred.");
      }
    }
  }, [playerOneScore, playerTwoScore, stakeAmount, dispatch]);

  return (
    <div className="Game-area-wrapper">
      <SettingsMenu playerPerspective={playerPerspective} />
      <GameOverDialog playerPerspective={playerPerspective} />
      <PlayerCard
        side={PlayerCardSide.Top}
        playerPerspective={playerPerspective}
      />
      <GameBoard
        playerPerspective={playerPerspective}
        playerOneScore={playerOneScore}
        playerTwoScore={playerTwoScore}
      />
      <PlayerCard
        side={PlayerCardSide.Bottom}
        playerPerspective={playerPerspective}
      />
    </div>
  );
};

export default GameRoom; 
