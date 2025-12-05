// frontend/src/services/authService.js
import axios from "axios";
import api from "../api/api";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { API_BASE_URL } from "../config/env";
import { log } from "../utils/logger";

// petit helper pour gérer un éventuel wrapper ApiResponse<T>
const unwrap = (apiData) => {
  if (
    apiData &&
    typeof apiData === "object" &&
    "data" in apiData &&
    "success" in apiData
  ) {
    // ApiResponse<T> → T
    return apiData.data;
  }
  return apiData;
};

const saveSession = async ({ accessToken, refreshToken, userId, expiresAt }) => {
  if (accessToken) {
    await AsyncStorage.setItem("accessToken", accessToken);
    // utilisé par ton interceptor api
    global.authToken = accessToken;
  }
  if (refreshToken) {
    await AsyncStorage.setItem("refreshToken", refreshToken);
  }
  if (userId) {
    await AsyncStorage.setItem("userId", userId);
  }
  if (expiresAt) {
    await AsyncStorage.setItem("expiresAt", String(expiresAt));
  }
};

export async function login({ email, password }) {
  log("authService.login", { email });

  // via la gateway → /api/auth/login (ton instance api gère déjà le /api)
  const { data } = await api.post("/auth/login", { email, password });

  const payload = unwrap(data);

  await saveSession({
    accessToken:
      payload?.accessToken ||
      payload?.AccessToken ||
      payload?.access_token,
    refreshToken: payload?.refreshToken || payload?.RefreshToken,
    userId: payload?.userId || payload?.UserId,
    expiresAt: payload?.expiresAt || payload?.ExpiresAt,
  });

  // on renvoie la réponse brute (comme avant)
  return data;
}

// ------------------------------------------------------
//  REFRESH TOKEN : axios "nu" (pas l'instance api)
// ------------------------------------------------------
export async function refresh() {
  const refreshToken = await AsyncStorage.getItem("refreshToken");
  if (!refreshToken) {
    log("authService.refresh → no refreshToken in storage");
    return null;
  }

  // directement sur la gateway : /api/auth/refresh
  const { data } = await axios.post(`${API_BASE_URL}/api/auth/refresh`, {
    refreshToken,
  });

  const payload = unwrap(data);

  await saveSession({
    accessToken:
      payload?.accessToken ||
      payload?.AccessToken ||
      payload?.access_token,
    refreshToken: payload?.refreshToken || payload?.RefreshToken,
    userId: payload?.userId || payload?.UserId,
    expiresAt: payload?.expiresAt || payload?.ExpiresAt,
  });

  return data;
}

// ------------------------------------------------------
//  PROFIL "SKATE" = PROGRESSION JOUEUR (UserProgressDto)
//  GET /api/progress → ContentMicroservice /progress
// ------------------------------------------------------
export async function getProfile() {
  try {
    const { data } = await api.get("/progress");
    // backend : renvoie UserProgressDto direct OU ApiResponse<UserProgressDto>
    return unwrap(data);
  } catch (err) {
    log("authService.getProfile error", err);
    throw err;
  }
}

export async function logout() {
  const refreshToken = await AsyncStorage.getItem("refreshToken");

  try {
    if (refreshToken) {
      // via gateway : /api/auth/logout
      await api.post("/auth/logout", { refreshToken });
    }
  } catch (e) {
    log("remote logout error (ignored)", e);
  }

  await AsyncStorage.multiRemove([
    "accessToken",
    "refreshToken",
    "userId",
    "expiresAt",
  ]);

  global.authToken = null;
  return true;
}
