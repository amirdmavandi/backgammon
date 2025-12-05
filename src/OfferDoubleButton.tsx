import { FunctionComponent, useContext } from "react";
import { useAppSelector, useAppDispatch } from "./store/hooks";
import { ActionsContext, LocalGameActions } from "./ActionsContext";
import { GameState } from "./store/gameStateSlice";
import { Player } from "./Types";
import { setPotCoins } from "./store/doublingCubeSlice";

const MIN_COINS_TO_PLAY = 20;
const INITIAL_POT = 10;

const OfferDoubleButton: FunctionComponent = () => {
  const dispatch = useAppDispatch();
  const actions = useContext(ActionsContext);

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

  const playerOneCoins = players[Player.One].coins;
  const playerTwoCoins = players[Player.Two].coins;

  const canOfferDouble =
    playerOneCoins >= MIN_COINS_TO_PLAY &&
    playerTwoCoins >= MIN_COINS_TO_PLAY &&
    doublingCubeData.owner === null;

  const isLocalPlayerTurn =
    actions instanceof LocalGameActions && currentPlayer === Player.One; // مثال: نوبت Player.One

  // نمایش دکمه دوبل
  if (
    gameState === GameState.PlayerRolling &&
    canOfferDouble &&
    isLocalPlayerTurn
  ) {
    return (
      <div className="Offer-double-button-wrapper">
        <button
          className="Offer-double-button"
          onClick={async () => {
            await actions.offerDoubleButtonClicked();
            // مقدار Pot را دو برابر یا حداقل INIT
            dispatch(setPotCoins(doublingCubeData.gameStakes * 2 || INITIAL_POT));
          }}
        >
          Double x2
        </button>
      </div>
    );
  }

  // نمایش منو قبول یا فورفیت
  if (gameState === GameState.PlayerOfferingDouble) {
    const showAcceptDoubleMenu =
      actions instanceof LocalGameActions
        ? true
        : currentPlayer !== Player.One; // بازیکن مقابل باید تایید کند

    const showWaiting = !showAcceptDoubleMenu;

    if (showAcceptDoubleMenu) {
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
                await actions.forfeitButtonClicked(gameBoardState, matchScore);
              }}
            >
              Forfeit
            </button>
            {canOfferDouble && (
              <button
                className="Accept-double-button"
                onClick={async () => {
                  await actions.acceptDoubleButtonClicked(
                    currentPlayer,
                    doublingCubeData.gameStakes * 2
                  );
                  dispatch(setPotCoins(doublingCubeData.gameStakes * 2));
                }}
              >
                Accept
              </button>
            )}
          </div>
        </div>
      );
    }

    if (showWaiting) {
      return (
        <div className="Waiting-for-accept-double-wrapper">
          <div className="Waiting-for-accept-double-text-wrapper">
            Waiting for opponent to accept or forfeit
          </div>
          <div className="Waiting-spinner" />
        </div>
      );
    }
  }

  // نمایش مقدار Pot در گوشه بازی
  return (
    <div className="Pot-display-wrapper">
      <span>Pot: {doublingCubeData.gameStakes || INITIAL_POT} 🪙</span>
    </div>
  );
};

export default OfferDoubleButton;
