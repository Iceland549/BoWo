// src/assets/avatarImages.ts
// Adapte les chemins "../" si ton fichier n'est pas à côté de /assets

export const bubbleAvatarImages: Record<string, any> = {
  bubble_lvl2_01: require("./bubbles/bubble_lvl2_01.png"),
  bubble_lvl2_02: require("./bubbles/bubble_lvl2_02.png"),
  bubble_lvl2_03: require("./bubbles/bubble_lvl2_03.png"),
  bubble_lvl2_04: require("./bubbles/bubble_lvl2_04.png"),
  bubble_lvl2_05: require("./bubbles/bubble_lvl2_05.png"),
  bubble_lvl2_06: require("./bubbles/bubble_lvl2_06.png"),
  bubble_lvl2_07: require("./bubbles/bubble_lvl2_07.png"),
  bubble_lvl2_08: require("./bubbles/bubble_lvl2_08.png"),
  bubble_lvl2_09: require("./bubbles/bubble_lvl2_09.png"),
  bubble_lvl2_10: require("./bubbles/bubble_lvl2_10.png"),
  bubble_lvl2_11: require("./bubbles/bubble_lvl2_11.png"),
  bubble_lvl2_12: require("./bubbles/bubble_lvl2_12.png"),
  bubble_lvl2_13: require("./bubbles/bubble_lvl2_13.png"),
};

export const shapeAvatarImages: Record<string, any> = {
  shape_lvl3_rebel_shredder: require("./shapes/shape_lvl3_rebel_shredder.png"),
  shape_lvl4_sidewalk_slayer: require("./shapes/shape_lvl4_sidewalk_slayer.png"),
  shape_lvl5_rail_hunter: require("./shapes/shape_lvl5_rail_hunter.png"),
  shape_lvl6_sk8_samurai: require("./shapes/shape_lvl6_sk8_samurai.png"),
  shape_lvl7_backyard_menace: require("./shapes/shape_lvl7_backyard_menace.png"),
  shape_lvl8_urban_myth: require("./shapes/shape_lvl8_urban_myth.png"),
  shape_lvl9_snake_run_king: require("./shapes/shape_lvl9_snake_run_king.png"),
  shape_lvl10_bowl_dragon: require("./shapes/shape_lvl10_bowl_dragon.png"),
  shape_lvl11_airwalk_pilot: require("./shapes/shape_lvl11_airwalk_pilot.png"),
  shape_lvl12_gap_destroyer: require("./shapes/shape_lvl12_gap_destroyer.png"),
  shape_lvl13_ghost_shredder: require("./shapes/shape_lvl13_ghost_shredder.png"),
  shape_lvl14_night_session_lord: require("./shapes/shape_lvl14_night_session_lord.png"),
  shape_lvl15_concrete_tornado: require("./shapes/shape_lvl15_concrete_tornado.png"),
  shape_lvl16_park_warlord: require("./shapes/shape_lvl16_park_warlord.png"),
  shape_lvl17_neon_shred_ghost: require("./shapes/shape_lvl17_neon_shred_ghost.png"),
  shape_lvl18_eternal_shredlord: require("./shapes/shape_lvl18_eternal_shredlord.png"),
  shape_lvl19_cosmic_skater: require("./shapes/shape_lvl19_cosmic_skater.png"),
  shape_lvl20_bowo_demigod: require("./shapes/shape_lvl20_bowo_demigod.png"),
};


export const allAvatarImages: Record<string, any> = {
  ...bubbleAvatarImages,
  ...shapeAvatarImages,
};
