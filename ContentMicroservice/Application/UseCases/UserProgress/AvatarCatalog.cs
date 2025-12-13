using System.Collections.Generic;
using System.Linq;
using ProgressEntity = ContentMicroservice.Infrastructure.Persistence.Entities.UserProgress;

namespace ContentMicroservice.Application.UseCases.UserProgress
{
    /// <summary>
    /// Catalogue des avatars :
    ///  - Bubble : choix unique à partir du niveau 2.
    ///  - Shape (level) : un sticker automatiquement débloqué à chaque niveau >= 3.
    ///  - Shape (shop) : 3 familles payantes (Archetype / Mascot / Emotion).
    /// </summary>
    internal static class AvatarCatalog
    {
        // -------------------------
        // BUBBLES (assets/avatars/bubbles)
        // -------------------------
        private static readonly string[] BubbleAvatars =
        {
            "bubble_lvl2_01",
            "bubble_lvl2_02",
            "bubble_lvl2_03",
            "bubble_lvl2_04",
            "bubble_lvl2_05",
            "bubble_lvl2_06",
            "bubble_lvl2_07",
            "bubble_lvl2_08",
            "bubble_lvl2_09",
            "bubble_lvl2_10",
            "bubble_lvl2_11",
            "bubble_lvl2_12",
            "bubble_lvl2_13",
        };

        private static readonly HashSet<string> BubbleAvatarSet =
            new HashSet<string>(BubbleAvatars);

        // -------------------------
        // SHAPES (auto unlock by level)
        // -------------------------
        private static readonly Dictionary<int, string> ShapeAvatarsByLevel = new()
        {
            { 3,  "shape_lvl3_rebel_shredder" },
            { 4,  "shape_lvl4_sidewalk_slayer" },
            { 5,  "shape_lvl5_rail_hunter" },
            { 6,  "shape_lvl6_sk8_samurai" },
            { 7,  "shape_lvl7_backyard_menace" },
            { 8,  "shape_lvl8_urban_myth" },
            { 9,  "shape_lvl9_snake_run_king" },
            { 10, "shape_lvl10_bowl_dragon" },
            { 11, "shape_lvl11_airwalk_pilot" },
            { 12, "shape_lvl12_gap_destroyer" },
            { 13, "shape_lvl13_ghost_shredder" },
            { 14, "shape_lvl14_night_session_lord" },
            { 15, "shape_lvl15_concrete_tornado" },
            { 16, "shape_lvl16_park_warlord" },
            { 17, "shape_lvl17_neon_shred_ghost" },
            { 18, "shape_lvl18_eternal_shredlord" },
            { 19, "shape_lvl19_cosmic_skater" },
            { 20, "shape_lvl20_bowo_demigod" }
        };

        // -------------------------
        // SHAPES (shop)
        // -------------------------
        public record ShapeShopItem(string Id, string Family, string DisplayName, int PriceCents);

        private static readonly IReadOnlyList<ShapeShopItem> ShapeShopCatalog = new[]
        {
            // ARCHETYPE (assets/avatars/shapesFamily/Archetypes)
            new ShapeShopItem("archetype_1_punk",       "Archetype", "Punk", 19),
            new ShapeShopItem("archetype_2_retro",      "Archetype", "Retro", 19),
            new ShapeShopItem("archetype_3_cyber",      "Archetype", "Cyber", 19),
            new ShapeShopItem("archetype_4_favela",     "Archetype", "Favela", 19),
            new ShapeShopItem("archetype_5_french",     "Archetype", "French", 19),
            new ShapeShopItem("archetype_6_grime",      "Archetype", "Grime", 19),
            new ShapeShopItem("archetype_7_luchador",   "Archetype", "Luchador", 19),
            new ShapeShopItem("archetype_8_mechanic",   "Archetype", "Mechanic", 19),
            new ShapeShopItem("archetype_9_ronin",      "Archetype", "Ronin", 19),
            new ShapeShopItem("archetype_10_ghost",     "Archetype", "Ghost", 19),
            new ShapeShopItem("archetype_11_sexy",      "Archetype", "Sexy", 19),
            new ShapeShopItem("archetype_12_queen",     "Archetype", "Queen", 19),

            // MASCOT (assets/avatars/shapesFamily/Mascot)
            new ShapeShopItem("mascot_alien",     "Mascot", "Alien", 19),
            new ShapeShopItem("mascot_bear",      "Mascot", "Bear", 19),
            new ShapeShopItem("mascot_bunny",     "Mascot", "Bunny", 19),
            new ShapeShopItem("mascot_dog",       "Mascot", "Dog", 19),
            new ShapeShopItem("mascot_dragon",    "Mascot", "Dragon", 19),
            new ShapeShopItem("mascot_dragon_2",  "Mascot", "Dragon 2", 19),
            new ShapeShopItem("mascot_fox",       "Mascot", "Fox", 19),
            new ShapeShopItem("mascot_frog",      "Mascot", "Frog", 19),
            new ShapeShopItem("mascot_grumpy",    "Mascot", "Grumpy", 19),
            new ShapeShopItem("mascot_koala",     "Mascot", "Koala", 19),
            new ShapeShopItem("mascot_monkey",    "Mascot", "Monkey", 19),
            new ShapeShopItem("mascot_mouse",     "Mascot", "Mouse", 19),
            new ShapeShopItem("mascot_octo",      "Mascot", "Octopus", 19),
            new ShapeShopItem("mascot_owl",       "Mascot", "Owl", 19),
            new ShapeShopItem("mascot_panda",     "Mascot", "Panda", 19),
            new ShapeShopItem("mascot_panda_2",   "Mascot", "Panda 2", 19),
            new ShapeShopItem("mascot_panda_3",   "Mascot", "Panda 3", 19),
            new ShapeShopItem("mascot_penguin",   "Mascot", "Penguin", 19),
            new ShapeShopItem("mascot_pig",       "Mascot", "Pig", 19),
            new ShapeShopItem("mascot_robot",     "Mascot", "Robot", 19),
            new ShapeShopItem("mascot_shark",     "Mascot", "Shark", 19),
            new ShapeShopItem("mascot_shark_2",   "Mascot", "Shark 2", 19),
            new ShapeShopItem("mascot_sheep",     "Mascot", "Sheep", 19),
            new ShapeShopItem("mascot_tako",      "Mascot", "Tako", 19),
            new ShapeShopItem("mascot_tiger",     "Mascot", "Tiger", 19),
            new ShapeShopItem("mascot_turtle",    "Mascot", "Turtle", 19),
            new ShapeShopItem("mascot_unicorn",   "Mascot", "Unicorn", 19),

            // EMOTION (assets/avatars/shapesFamily/Emotion)
            new ShapeShopItem("emoji_1_rage",   "Emotion", "Rage", 19),
            new ShapeShopItem("emoji_2_chill",  "Emotion", "Chill", 19),
            new ShapeShopItem("emoji_3_pride",  "Emotion", "Pride", 19),
            new ShapeShopItem("emoji_4_joy",    "Emotion", "Joy", 19),
            new ShapeShopItem("emoji_5_fear",   "Emotion", "Fear", 19),
            new ShapeShopItem("emoji_6_greed",  "Emotion", "Greed", 19),
            new ShapeShopItem("emoji_7_turbo",  "Emotion", "Turbo", 19),
            new ShapeShopItem("emoji_8_lazy",   "Emotion", "Lazy", 19),
            new ShapeShopItem("emoji_9_donut",  "Emotion", "Donut", 19),
            new ShapeShopItem("emoji_10_envy",  "Emotion", "Envy", 19),
        };

        private static readonly HashSet<string> ShapeShopIdSet =
            new HashSet<string>(ShapeShopCatalog.Select(s => s.Id));

        // -------------------------
        // BUBBLES API
        // -------------------------
        public static List<string> GetAvailableBubbleAvatars(int level, string? currentBubbleAvatarId)
        {
            if (level < 2) return new List<string>();
            if (!string.IsNullOrWhiteSpace(currentBubbleAvatarId)) return new List<string>();
            return BubbleAvatars.ToList();
        }

        public static bool IsValidBubbleAvatar(string avatarId)
            => BubbleAvatarSet.Contains(avatarId);

        public static IReadOnlyCollection<string> GetAllBubbleAvatarIds()
            => BubbleAvatars;

        // -------------------------
        // SHAPES (level) API
        // -------------------------
        public static (List<string> UpdatedUnlocked, string? ActiveShapeId) SyncShapeAvatars(
            int level,
            List<string>? currentUnlocked)
        {
            var unlocked = currentUnlocked ?? new List<string>();

            foreach (var kv in ShapeAvatarsByLevel)
            {
                if (level >= kv.Key && !unlocked.Contains(kv.Value))
                {
                    unlocked.Add(kv.Value);
                }
            }

            var active = unlocked.Count > 0 ? unlocked[^1] : null;
            return (unlocked, active);
        }

        public static void ApplyToUserProgress(ProgressEntity progress, int level)
        {
            var (updated, active) = SyncShapeAvatars(level, progress.UnlockedShapeAvatarIds);
            progress.UnlockedShapeAvatarIds = updated;
            progress.ShapeAvatarId = active;
        }

        // -------------------------
        // SHAPES (shop) API
        // -------------------------
        public static IReadOnlyList<ShapeShopItem> GetShapeShopCatalog()
            => ShapeShopCatalog;

        public static bool IsValidShopShape(string id)
            => !string.IsNullOrWhiteSpace(id) && ShapeShopIdSet.Contains(id);
    }
}
