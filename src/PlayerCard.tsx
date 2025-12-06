           import cx from "classnames";
import { FunctionComponent, useContext } from "react";
import { ActionsContext, LocalGameActions } from "./ActionsContext";
import Checker, { CheckerStatus } from "./Checker";
import { Color, MovementDirection, Player } from "./Types";
import { useAppSelector } from "./store/hooks";
import { pipCount } from "./store/gameBoardSlice";
import DoublingCube from "./DoublingCube";
import { GameState } from "./store/gameStateSlice";

export enum PlayerCardSide {
  Top = "TOP",
  Bottom = "BOTTOM",
}

type PlayerCardProps = {
  side: PlayerCardSide;
  playerPerspective: Player;
};

const PlayerCard: FunctionComponent<PlayerCardProps> = ({ side, playerPerspective }) => {
  const [
    gameBoardState,
    settings,
    currentPlayer,
    doublingCubeData,
    gameState,
    matchScore,
    pot,
    playersInfo,
  ] = useAppSelector((state) => [
    state.gameBoard,
    state.settings,
    state.currentPlayer,
    state.doublingCube,
    state.gameState,
    state.matchScore,
    state.pot,
    state.players,
  ]);

  const actions = useContext(ActionsContext);

  let playerName = "";
  let pips = 167;
  let color = Color.Black;
  let playerScore = 0;
  let potCoins = pot.coins; // ← سکه وسط

  // ===========================
  //   تعیین بازیکن بالا/پایین
  // ===========================
  if (side === PlayerCardSide.Bottom) {
    const p = playersInfo[playerPerspective];
    playerName = p.displayName || "Player";
    pips = pipCount(gameBoardState, playerPerspective);
    playerScore = matchScore[playerPerspective];
    color = playerPerspective === Player.One
      ? settings.playerOneColor
      : settings.playerOneColor === Color.White
      ? Color.Black
      : Color.White;
  } else {
    const opp = playerPerspective === Player.One ? Player.Two : Player.One;
    const p = playersInfo[opp];
    playerName = p.displayName || "Opponent";
    pips = pipCount(gameBoardState, opp);
    playerScore = matchScore[opp];
    color = opp === Player.One
      ? settings.playerOneColor
      : settings.playerOneColor === Color.White
      ? Color.Black
      : Color.White;
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
      <div className="Player-card-checker-wrapper">
        <Checker
          color={color}
          checkerPulse={false}
          status={CheckerStatus.None}
          onAnimationComplete={() => {}}
          animation={null}
        />
      </div>

      <div className="Player-name-and-score-wrapper">

        {/* نام بازیکن */}
        <div className="Player-name-wrapper">
          {playerName} — {potCoins} 🪙
        </div>

        {/* اطلاعات */}
        <div className="Player-score-wrapper">
          <div className="Player-pip-count-wrapper">{"Pips: " + pips}</div>

          <div className="Player-points-wrapper">
            {"Points: " + playerScore + " of "}
            <span className="Player-card-total-match-points">
              {matchScore.pointsRequiredToWin}
            </span>
          </div>
        </div>
      </div>

      <div className="Player-card-doubling-cube-wrapper">
        {doublingCubeData.owner === playerPerspective && <DoublingCube />}
      </div>
    </div>
  );
};

export default PlayerCard;     
