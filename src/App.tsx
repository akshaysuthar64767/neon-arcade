import { useEffect, useState } from "react";
import { createPlayer, getPlayer } from "./utils/api";
import { savePlayerId, getPlayerId } from "./utils/storage";

function App() {
  const [player, setPlayer] = useState<any>(null);

  useEffect(() => {
    async function initPlayer() {
      let id = getPlayerId();

      if (!id) {
        // First-time user → create new player
        const res = await createPlayer("Player", 10, "👾");
        id = res.playerId;
        savePlayerId(id);
      }

      // Load player from backend
      const data = await getPlayer(id);
      setPlayer(data);
    }

    initPlayer();
  }, []);

  return (
    <div>
    {player ? (
  <div>
    <h1>{player.name.S}</h1>
    <h2>{player.points.N} points</h2>
    <h2>{player.avatar.S}</h2>

    <button
      onClick={() =>
        setPlayer({
          ...player,
          points: { N: String(Number(player.points.N) + 10) }
        })
      }
    >
      Add 10 Points
    </button>
  </div>
) : (
  <p>Loading player...</p>
)}

      
}

export default App;
