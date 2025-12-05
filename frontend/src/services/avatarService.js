// frontend/src/services/avatarService.js
import api from "../api/api";

// Si tu veux, tu peux réutiliser unwrap d'authService ; ici on renvoie brut.
export async function selectBubbleAvatar(avatarId) {
  const { data } = await api.post("/progress/avatar/bubble/select", {
    avatarId,
  });

  // data ~ { success: true, data: UserProgressDto }
  return data;
}
