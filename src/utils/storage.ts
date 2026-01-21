export function savePlayerId(id: string) {
  localStorage.setItem("playerId", id);
}

export function getPlayerId(): string | null {
  return localStorage.getItem("playerId");
}

