import { FunctionComponent, useEffect, useState } from "react";
import { useAppSelector, useAppDispatch } from "../store/hooks";
import { setPlayerCoins } from "../store/playerCoinsSlice";
import "./MainMenu.scss"; // استایل دلخواه برای MainMenu

type MainMenuProps = {};

const API_URL = "https://your-wordpress-site.com/wp-json"; // ← آدرس وردپرس خود را اینجا قرار دهید
const INITIAL_COINS = 30;

const MainMenu: FunctionComponent<MainMenuProps> = () => {
  const dispatch = useAppDispatch();
  const coins = useAppSelector((state) => state.playerCoins.coins);
  const [userLoggedIn, setUserLoggedIn] = useState(false);
  const [username, setUsername] = useState("");

  // بررسی ورود کاربر از وردپرس
  useEffect(() => {
    async function checkUser() {
      try {
        const res = await fetch(`${API_URL}/user/current`, {
          credentials: "include",
        });
        if (res.ok) {
          const data = await res.json();
          setUserLoggedIn(true);
          setUsername(data.username);

          // اگر بار اول ورود است، به کاربر سکه بدهیم
          if (!data.coins) {
            dispatch(setPlayerCoins(INITIAL_COINS));
            // می‌توانید این مقدار را روی سرور ذخیره کنید
          } else {
            dispatch(setPlayerCoins(data.coins));
          }
        } else {
          setUserLoggedIn(false);
        }
      } catch (err) {
        console.error("Error checking user:", err);
        setUserLoggedIn(false);
      }
    }

    checkUser();
  }, [dispatch]);

  const handlePlayOnline = () => {
    if (coins < 30) return;
    window.location.href = "/online-game"; // مسیر بازی آنلاین
  };

  const handleLogin = () => {
    window.location.href = `${API_URL}/wp-login.php`;
  };

  return (
    <div className="MainMenu-wrapper">
      <h1>Backgammon Online</h1>

      {!userLoggedIn ? (
        <button onClick={handleLogin}>Login / Register</button>
      ) : (
        <div className="MainMenu-user-info">
          <p>Welcome, {username}</p>
          <p>Coins: {coins}</p>
          <button
            onClick={handlePlayOnline}
            disabled={coins < 30}
            className={coins < 30 ? "disabled" : ""}
          >
            Play Online
          </button>
          {coins < 30 && <p>You need at least 30 coins to play</p>}
        </div>
      )}
    </div>
  );
};

export default MainMenu;
