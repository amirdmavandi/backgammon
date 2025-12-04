    import { FunctionComponent, useState, useEffect } from "react";  
import { createLobby } from "./Firebase";  
import { useNavigate } from "react-router-dom";  
import { useAppDispatch, useAppSelector } from "./store/hooks";  
import { setShowMatchSetupScreen } from "./store/settingsSlice";  
import { setWipeTransition } from "./store/wipeTransitionSlice";  

type MainMenuProps = {};  

const MainMenu: FunctionComponent<MainMenuProps> = () => {  
  const navigate = useNavigate();  
  const dispatch = useAppDispatch();  
  const coins = useAppSelector(state => state.playerCoins.playerOne); // تعداد سکه کاربر  
  const [isCreatingMultiplayerLobby, setIsCreatingMultiplayerLobby] = useState(false);  

  const createOnlineLobby = async () => {  
    if (isCreatingMultiplayerLobby) return;  
    if (coins < 30) {  
      alert("You need at least 30 coins to play online.");  
      return;  
    }  
    setIsCreatingMultiplayerLobby(true);  
    const createLobbyResult = await createLobby();  
    dispatch(setShowMatchSetupScreen(true));  
    dispatch(setWipeTransition(true));  
    navigate("/" + createLobbyResult.roomCode);  
  };  

  let onlineButtonOrSpinner = (  
    <div className="Online-multiplayer-button" onClick={createOnlineLobby}>  
      Play Online  
    </div>  
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
      </div>  
      <div className="Credits-text">  
        <div>Backgammon v 1.0.2.574dced</div>  
        <div>by Sam Swarr (sam-swarr.github.io)</div>  
        <div>font Barlow by Jeremy Tribby</div>  
      </div>  
      <div className="Coins-info">Coins: {coins}</div>
    </div>  
  );  
};  

export default MainMenu;
