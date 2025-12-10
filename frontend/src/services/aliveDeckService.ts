import api from "../api/api";

export async function unlockAliveDeck(deckId: string) {
  const response = await api.post(`/user-progress/alive-decks/unlock/${deckId}`);
  return response.data; // UserProgressDto
}
