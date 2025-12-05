import { FunctionComponent, useState } from "react";  
import { createLobby } from "./Firebase";  
import { useNavigate } from "react-router-dom";  
import { useAppDispatch, useAppSelector } from "./store/hooks";  
import { setShowMatchSetupScreen } from "./store/settingsSlice";  
import { setWipeTransition } from "./store/wipeTransitionSlice";  

type MainMenuProps = {};  

const MIN_COINS_TO_PLAY = 20; // حداقل سکه برای بازی آنلاین

const MainMenu: FunctionComponent<MainMenuProps> = () => {  
  const navigate = useNavigate();  
  const dispatch = useAppDispatch();  
  const coins = useAppSelector(state => state.playerCoins.playerOne); // تعداد سکه کاربر  
  const [isCreatingMultiplayerLobby, setIsCreatingMultiplayerLobby] = useState(false);  

  const createOnlineLobby = async () => {  
    if (isCreatingMultiplayerLobby) return;  

    if (coins < MIN_COINS_TO_PLAY) {  
      alert(`You need at least ${MIN_COINS_TO_PLAY} coins to play online.`);  
      return;  
    }  

    setIsCreatingMultiplayerLobby(true);  
    try {
      const createLobbyResult = await createLobby();  
      dispatch(setShowMatchSetupScreen(true));  
      dispatch(setWipeTransition(true));  
      navigate("/" + createLobbyResult.roomCode);  
    } catch (error) {
      console.error("Failed to create online lobby:", error);
      alert("Failed to create online game. Please try again.");
      setIsCreatingMultiplayerLobby(false);
    }
  };  

  let onlineButtonOrSpinner = (  
    <button
      className="Online-multiplayer-button"
      onClick={createOnlineLobby}
      disabled={coins < MIN_COINS_TO_PLAY}
    >  
      Play Online
    </button>  
  );  

  if (isCreatingMultiplayerLobby) {  
    onlineButtonOrSpinner = (  
      <div className="Online-multiplayer-button-spinner">Loading...</div>  
    );  
  }  

  return (  
    <div className="Main-menu-wrapper">  
      <div className="Title-wrapper">  
        <div className="Title-text">Backgammon Online</div>  
      </div>  

      <div className="Menu-button-wrapper">  
        {onlineButtonOrSpinner}  
        {coins < MIN_COINS_TO_PLAY && (
          <p className="Coins-warning">
            You need at least {MIN_COINS_TO_PLAY} coins to play online.
          </p>
        )}
      </div>  

      <div className="Credits-text">  
        <div>Backgammon v 1.0.2.574dced</div>  
        <div>by Sam Swarr (sam-swarr.github.io)</div>  
        <div>Font Barlow by Jeremy Tribby</div>  
      </div>  
    </div>  
  );  
};  

export default MainMenu;
