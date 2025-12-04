import { FunctionComponent, useEffect, useRef, useState } from "react";
import { useAppDispatch, useAppSelector } from "./store/hooks";
import {
  FirestoreGameData,
  getCurrentUser,
  joinLobbyAsPlayerTwo,
  signIn,
} from "./Firebase";
import { doc, setDoc, getDoc, onSnapshot, serverTimestamp } from "firebase/firestore";
import { GameState, setState } from "./store/gameStateSlice";
import { setPlayersState } from "./store/playersSlice";
import { setDiceState } from "./store/diceSlice";
import { setCurrentPlayer } from "./store/currentPlayerSlice";
import { enqueueNetworkedMoves, invalidateNetworkedMoves } from "./store/animatableMovesSlice";
import { getClientPlayer, isGameOverState } from "./Utils";
import GameRoom from "./GameRoom";
import { setDoublingCubeData } from "./store/doublingCubeSlice";
import { setMatchScore } from "./store/matchScoreSlice";
import { setGameBoardState } from "./store/gameBoardSlice";
import { Player } from "./Types";
import MatchSettingsMenu, { MatchPointValue } from "./MatchSettingsMenu";
import SettingsMenuButton from "./SettingsMenuButton";
import { setShowGameOverDialog } from "./store/settingsSlice";
import { setReadyForNextGameData } from "./store/readyForNextGameSlice";
import RoomConnectionError, { RoomConnectionErrorType } from "./RoomConnectionError";
import { ActionsContext, Actions, NetworkedGameActions } from "./ActionsContext";
import { db } from "./Firebase";

type NetworkedGameRoomProps = {};

function generateRoomCode(length = 6) {
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
  let code = "";
  for (let i = 0; i < length; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return code;
}

const NetworkedGameRoom: FunctionComponent<NetworkedGameRoomProps> = () => {
  const [settings, gameState] = useAppSelector((state) => [state.settings, state.gameState]);
  const dispatch = useAppDispatch();

  const [matchPointsValue, setMatchPointsValue] = useState<MatchPointValue>(5);
  const [enableDoubling, setEnableDoubling] = useState(true);
  const [roomConnectionError, setRoomConnectionError] = useState(RoomConnectionErrorType.None);

  const [_gameActions, _setGameActions] = useState<Actions | null>(null);
  const gameActionsRef = useRef(_gameActions);
  function setGameActions(gameActions: Actions) {
    gameActionsRef.current = gameActions;
    _setGameActions(gameActions);
  }

  const [_previousGameState, _setPreviousGameState] = useState<GameState>(gameState);
  const previousGameStateRef = useRef(_previousGameState);
  function setPreviousGameState(gameState: GameState) {
    previousGameStateRef.current = gameState;
    _setPreviousGameState(gameState);
  }

  const [roomCode, setRoomCode] = useState<string>("");
  const [joinCode, setJoinCode] = useState<string>("");
  const [isHost, setIsHost] = useState<boolean | null>(null);

  // تابع ایجاد اتاق
  const createRoom = async () => {
    await signIn();
    let code = generateRoomCode();
    const roomRef = doc(db, "rooms", code);

    // چک یکتا بودن کد
    const roomSnap = await getDoc(roomRef);
    if (roomSnap.exists()) {
      // اگر کد تکراری بود دوباره ایجاد شود
      return createRoom();
    }

    await setDoc(roomRef, {
      players: { playerOne: getCurrentUser(), playerTwo: null },
      state: GameState.WaitingToBegin,
      dice: null,
      doublingCube: null,
      matchScore: 0,
      readyForNextGame: {},
      gameBoard: null,
      networkedMoves: null,
      createdAt: serverTimestamp(),
    });

    setRoomCode(code);
    setIsHost(true);

    subscribeToRoom(roomRef, true);
  };

  // تابع پیوستن به اتاق
  const joinRoom = async (code: string) => {
    await signIn();
    const roomRef = doc(db, "rooms", code.toUpperCase());
    const roomSnap = await getDoc(roomRef);

    if (!roomSnap.exists()) {
      setRoomConnectionError(RoomConnectionErrorType.NotFound);
      return;
    }

    const data = roomSnap.data() as FirestoreGameData;
    if (data.players.playerTwo != null) {
      setRoomConnectionError(RoomConnectionErrorType.TooManyPlayers);
      return;
    }

    await joinLobbyAsPlayerTwo(roomRef);
    setRoomCode(code.toUpperCase());
    setIsHost(false);

    subscribeToRoom(roomRef, false);
  };

  // تابع مشترک برای اشتراک روی اتاق
  const subscribeToRoom = (roomRef: any, host: boolean) => {
    onSnapshot(roomRef, (doc) => {
      const data = doc.data() as FirestoreGameData;

      dispatch(setState(data.gameState));
      dispatch(setPlayersState(data.players));
      dispatch(setCurrentPlayer(data.currentPlayer));
      dispatch(setDiceState(data.dice));
      dispatch(setDoublingCubeData(data.doublingCube));
      dispatch(setMatchScore(data.matchScore));
      dispatch(setReadyForNextGameData(data.readyForNextGame));

      if (data.networkedMoves != null && getClientPlayer(data.players) === data.networkedMoves.animateFor) {
        if (gameActionsRef.current == null) {
          dispatch(invalidateNetworkedMoves(data.networkedMoves));
        } else {
          dispatch(enqueueNetworkedMoves(data.networkedMoves));
        }
      }

      if (data.gameState === GameState.WaitingToBegin) {
        dispatch(setGameBoardState(data.gameBoard));
      }

      if (previousGameStateRef.current !== GameState.GameOverForfeit && data.gameState === GameState.GameOverForfeit) {
        dispatch(setShowGameOverDialog(true));
      }
      setPreviousGameState(data.gameState);

      if (gameActionsRef.current == null) {
        dispatch(setGameBoardState(data.gameBoard));
        setGameActions(new NetworkedGameActions(host, dispatch, roomRef));

        if (isGameOverState(data.gameState)) {
          dispatch(setShowGameOverDialog(true));
        }
      }
    });
  };

  // UI قبل از اتصال
  if (isHost === null) {
    return (
      <div className="networked-game-menu">
        <h2>Online Backgammon</h2>
        <button onClick={createRoom}>Create Room</button>
        <div>
          <input
            type="text"
            placeholder="Enter Room Code"
            value={joinCode}
            onChange={(e) => setJoinCode(e.target.value.toUpperCase())}
          />
          <button onClick={() => joinRoom(joinCode)}>Join Room</button>
        </div>
        {roomConnectionError !== RoomConnectionErrorType.None && (
          <RoomConnectionError type={roomConnectionError} roomCode={joinCode} />
        )}
      </div>
    );
  }

  // UI بعد از اتصال
  let contents = null;
  if (settings.showMatchSetupScreen) {
    contents = (
      <MatchSettingsMenu
        matchPointsValue={matchPointsValue}
        enableDoubling={enableDoubling}
        onMatchPointsChanged={(newValue) => setMatchPointsValue(newValue)}
        onEnableDoublingChanged={(enabled) => setEnableDoubling(enabled)}
        roomCode={roomCode}
      />
    );
  } else {
    contents = (
      <div>
        <SettingsMenuButton />
        <GameRoom playerPerspective={isHost ? Player.One : Player.Two} />
      </div>
    );
  }

  return <ActionsContext.Provider value={gameActionsRef.current}>{contents}</ActionsContext.Provider>;
};

export default NetworkedGameRoom;            
