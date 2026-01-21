import { API_BASE_URL } from "../constants";

// CREATE PLAYER
export async function createPlayer(name: string, points: number, avatar: string) {
  const res = await fetch(`${API_BASE_URL}/player`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ name, points, avatar })
  });

  return res.json();
}

// GET PLAYER
export async function getPlayer(playerId: string) {
  const res = await fetch(`${API_BASE_URL}/player/${playerId}`);
  return res.json();
}

// UPDATE PLAYER
export async function updatePlayer(playerId: string, name: string, points: number, avatar: string) {
  const res = await fetch(`${API_BASE_URL}/player/${playerId}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ name, points, avatar })
  });

  return res.json();
}

