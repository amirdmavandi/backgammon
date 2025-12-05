        import cx from "classnames";
import { FunctionComponent, useContext, useEffect } from "react";
import { ActionsContext, LocalGameActions } from "./ActionsContext";
import Checker, { CheckerStatus } from "./Checker";
import { Color, MovementDirection, Player } from "./Types";
import { useAppSelector, useAppDispatch } from "./store/hooks";
import { pipCount } from "./store/gameBoardSlice";
import DoublingCube from "./DoublingCube";
import { GameState } from "./store/gameStateSlice";
import { subtractCoins } from "./store/playerCoinsSlice"; // Redux action برای کم کردن سکه
import { setPotCoins } from "./store/doublingCubeSlice"; // مقدار Pot

export enum PlayerCardSide {
  Top = "TOP",
  Bottom = "BOTTOM",
}

type PlayerCardProps = {
  side: PlayerCardSide;
  playerPerspective: Player;
};

const INITIAL_POT = 10; // سکه اولیه هر بازی

const PlayerCard: FunctionComponent<PlayerCardProps> = ({
  side,
  playerPerspective,
}: PlayerCardProps) => {
  const dispatch = useAppDispatch();
  const [
    gameBoardState,
    settings,
    currentPlayer,
    doublingCubeData,
    gameState,
    matchScore,
    playerCoins,
    playersInfo, // {id, displayName, coins} هر بازیکن از وردپرس
  ] = useAppSelector((state) => [
    state.gameBoard,
    state.settings,
    state.currentPlayer,
    state.doublingCube,
    state.gameState,
    state.matchScore,
    state.playerCoins,
    state.players, 
  ]);

  const actions = useContext(ActionsContext);

  let playerOneColor = settings.playerOneColor;
  let playerTwoColor = playerOneColor === Color.White ? Color.Black : Color.White;

  let doublingCube = null;

  let playerName = "";
  let pips = 167;
  let color = Color.Black;
  let playerScore = 0;
  let coins = 0;

  // 💰 کم کردن سکه هر بازیکن در شروع بازی و اضافه کردن به Pot
  useEffect(() => {
    if (gameState === GameState.PlayerRolling && doublingCubeData.gameStakes === 0) {
      dispatch(subtractCoins({ player: "playerOne", amount: INITIAL_POT }));
      dispatch(subtractCoins({ player: "playerTwo", amount: INITIAL_POT }));
      dispatch(setPotCoins(INITIAL_POT * 2));
    }
  }, [gameState, dispatch, doublingCubeData.gameStakes]);

  if (side === PlayerCardSide.Bottom) {
    const player = playersInfo[playerPerspective];
    playerName = actions instanceof LocalGameActions
      ? playerPerspective === Player.One ? "Player 1" : "Player 2"
      : player.displayName || "You";
    pips = pipCount(gameBoardState, playerPerspective);
    color = playerPerspective === Player.One ? playerOneColor : playerTwoColor;
    if (doublingCubeData.owner === playerPerspective) doublingCube = <DoublingCube />;
    playerScore = matchScore[playerPerspective];
    coins = playerCoins[playerPerspective];
  } else {
    const opponentPerspective = playerPerspective === Player.One ? Player.Two : Player.One;
    const player = playersInfo[opponentPerspective];
    playerName = actions instanceof LocalGameActions ? (opponentPerspective === Player.One ? "Player 1" : "Player 2") : player.displayName || "Opponent";
    pips = pipCount(gameBoardState, opponentPerspective);
    color = opponentPerspective === Player.Two ? playerOneColor : playerTwoColor;
    if (doublingCubeData.owner !== null && doublingCubeData.owner !== opponentPerspective) doublingCube = <DoublingCube />;
    playerScore = opponentPerspective === Player.One ? matchScore[Player.Two] : matchScore[Player.One];
    coins = playerCoins[opponentPerspective];
  }

  return (
    <div
      className={cx("Player-card-wrapper", {
        bottom: side === PlayerCardSide.Bottom,
        cw:
          (settings.movementDirection === MovementDirection.Clockwise && playerPerspective === Player.One) ||
          (settings.movementDirection === MovementDirection.CounterClockwise && playerPerspective === Player.Two),
        current:
          (gameState === GameState.PlayerMoving ||
            gameState === GameState.PlayerOfferingDouble ||
            gameState === GameState.PlayerRolling) &&
          ((side === PlayerCardSide.Bottom && currentPlayer === playerPerspective) ||
            (side === PlayerCardSide.Top && currentPlayer !== playerPerspective)),
      })}
    >
      <div className={"Player-card-checker-wrapper"}>
        <Checker color={color} checkerPulse={false} status={CheckerStatus.None} onAnimationComplete={() => {}} animation={null} />
      </div>
      <div className={"Player-name-and-score-wrapper"}>
        <div className={"Player-name-wrapper"}>{playerName}</div>
        <div className={"Player-score-wrapper"}>
          <div className={"Player-pip-count-wrapper"}>{"Pips: " + pips}</div>
          <div className={"Player-points-wrapper"}>
            {"Points: " + playerScore + " of "}
            <span className={"Player-card-total-match-points"}>{matchScore.pointsRequiredToWin}</span>
          </div>
          <div className={"Player-coins-wrapper"}>{"Coins: " + coins + " 🪙"}</div>
        </div>
      </div>
      <div className={"Player-card-doubling-cube-wrapper"}>{doublingCube}</div>
    </div>
  );
};

export default PlayerCard; 
