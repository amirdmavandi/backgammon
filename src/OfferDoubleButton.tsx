    import { FunctionComponent, useContext } from "react";
import { useAppSelector } from "./store/hooks";
import { ActionsContext, LocalGameActions } from "./ActionsContext";
import { getClientPlayer, isCurrentPlayer } from "./Utils";
import { GameState } from "./store/gameStateSlice";
import { Player } from "./Types";

const MIN_COINS_TO_PLAY = 30;
const INITIAL_POT = 10;

const OfferDoubleButton: FunctionComponent = () => {
  const [
    gameState,
    players,
    currentPlayer,
    doublingCubeData,
    gameBoardState,
    matchScore,
  ] = useAppSelector((state) => [
    state.gameState,
    state.players,
    state.currentPlayer,
    state.doublingCube,
    state.gameBoard,
    state.matchScore,
  ]);

  const actions = useContext(ActionsContext);

  const playerOneCoins = players[Player.One].coins;
  const playerTwoCoins = players[Player.Two].coins;

  // بررسی فعال بودن دوبل
  if (!doublingCubeData.enabled) return null;

  // وضعیت نمایش دکمه دوبل
  let showOfferDoubleButton = false;
  if (actions instanceof LocalGameActions) {
    showOfferDoubleButton =
      doublingCubeData.owner === null ||
      doublingCubeData.owner === currentPlayer;
  } else {
    showOfferDoubleButton =
      isCurrentPlayer(players, currentPlayer, actions) &&
      (doublingCubeData.owner === null ||
        doublingCubeData.owner === getClientPlayer(players));
  }

  // بررسی شرط سکه‌ها
  const canDouble =
    playerOneCoins >= MIN_COINS_TO_PLAY && playerTwoCoins >= MIN_COINS_TO_PLAY;

  // نمایش دکمه قبول دوبل یا فورفیت
  let showAcceptDoubleMenu = false;
  let showWaitingForPlayerToAccept = false;
  if (actions instanceof LocalGameActions) {
    showAcceptDoubleMenu = true;
  } else {
    showAcceptDoubleMenu = !isCurrentPlayer(players, currentPlayer, actions);
    showWaitingForPlayerToAccept = !showAcceptDoubleMenu;
  }

  // رندر دکمه‌ها
  if (gameState === GameState.PlayerRolling && showOfferDoubleButton && canDouble) {
    return (
      <div className="Offer-double-button-wrapper">
        <button
          className="Offer-double-button"
          onClick={async () => {
            await actions.offerDoubleButtonClicked();
            // افزودن سکه وسط به مقدار Pot
            doublingCubeData.gameStakes = INITIAL_POT;
          }}
        >
          Double x2
        </button>
      </div>
    );
  } else if (
    gameState === GameState.PlayerOfferingDouble &&
    showAcceptDoubleMenu
  ) {
    return (
      <div className="Accept-double-menu-wrapper">
        <div className="Accept-double-menu-text-wrapper">
          {actions instanceof LocalGameActions
            ? `Player ${currentPlayer === Player.One ? "1" : "2"} offers a double!`
            : "Opponent offers a double!"}
        </div>
        <div className="Accept-double-menu-buttons-wrapper">
          <button
            className="Forfeit-game-button"
            onClick={async () => {
              // انتقال سکه‌ها به بازیکن دیگر در صورت فورفیت
              await actions.forfeitButtonClicked(gameBoardState, matchScore);
            }}
          >
            Forfeit
          </button>
          {canDouble && (
            <button
              className="Accept-double-button"
              onClick={async () => {
                const newOwner =
                  currentPlayer === Player.One ? Player.Two : Player.One;
                await actions.acceptDoubleButtonClicked(
                  newOwner,
                  doublingCubeData.gameStakes * 2
                );
                doublingCubeData.gameStakes *= 2;
              }}
            >
              Accept
            </button>
          )}
        </div>
      </div>
    );
  } else if (
    gameState === GameState.PlayerOfferingDouble &&
    showWaitingForPlayerToAccept
  ) {
    return (
      <div className="Waiting-for-accept-double-wrapper">
        <div className="Waiting-for-accept-double-text-wrapper">
          Waiting for opponent to accept or forfeit
        </div>
        <div className="Waiting-spinner" />
      </div>
    );
  } else {
    // نمایش مقدار Pot در گوشه بازی
    return (
      <div className="Pot-display-wrapper">
        <span>Pot: {doublingCubeData.gameStakes || INITIAL_POT}</span>
      </div>
    );
  }
};

export default OfferDoubleButton;
