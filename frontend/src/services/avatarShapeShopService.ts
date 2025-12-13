import api from "../api/api";

export type AvatarShopDto = {
  currentShapeAvatarId?: string | null;
  families: AvatarShopFamilyDto[];
};

export type AvatarShopFamilyDto = {
  key: string;
  label: string;
  items: AvatarShopItemDto[];
};

export type AvatarShopItemDto = {
  id: string;
  displayName: string;
  family: string;
  priceCents: number;
  owned: boolean;
};

const unwrap = (apiData: any) => {
  if (apiData && typeof apiData === "object" && "data" in apiData && "success" in apiData) {
    return apiData.data;
  }
  return apiData;
};

export async function getAvatarShapeShop(): Promise<AvatarShopDto> {
  const { data } = await api.get("/progress/avatar/shop/shapes");
  console.log("SHOP RAW =", data);
  return unwrap(data);
}

export async function unlockAvatarShapeShop(shapeAvatarId: string) {
  const { data } = await api.post(`/progress/avatar/shop/shapes/${encodeURIComponent(shapeAvatarId)}/unlock`);
  return unwrap(data);
}
