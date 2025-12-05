// ContentMicroservice.Application/UseCases/UserProgress/AvatarCatalog.cs
using System.Collections.Generic;
using System.Linq;
using ProgressEntity = ContentMicroservice.Infrastructure.Persistence.Entities.UserProgress;

namespace ContentMicroservice.Application.UseCases.UserProgress
{
    /// <summary>
    /// Catalogue des avatars bulle + avatars "forme skateur".
    ///  - Bulle : choix unique à partir du niveau 2 (5 avatars).
    ///  - Forme : un sticker automatiquement débloqué à chaque niveau >= 3.
    /// </summary>
    internal static class AvatarCatalog
    {
        // 5 avatars bulle de base (portraits ronds).
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

        // Un avatar "forme skateur" par niveau >= 3.
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

        /// <summary>
        /// Renvoie les avatars bulle sélectionnables MAINTENANT.
        /// - Level < 2 → aucun avatar bulle.
        /// - Level >= 2 & avatar déjà choisi → liste vide (plus de choix).
        /// - Level >= 2 & pas encore de choix → les 5 bulles.
        /// </summary>
        public static List<string> GetAvailableBubbleAvatars(int level, string? currentBubbleAvatarId)
        {
            if (level < 2)
                return new List<string>();

            if (!string.IsNullOrWhiteSpace(currentBubbleAvatarId))
                return new List<string>(); // choix déjà fait → plus de sélection.

            return BubbleAvatars.ToList();
        }

        /// <summary>
        /// Vérifie qu'un ID de bulle est valide.
        /// </summary>
        public static bool IsValidBubbleAvatar(string avatarId)
            => BubbleAvatarSet.Contains(avatarId);

        /// <summary>
        /// Retourne la liste complète des IDs de bulles disponibles.
        /// </summary>
        public static IReadOnlyCollection<string> GetAllBubbleAvatarIds()
            => BubbleAvatars;

        /// <summary>
        /// Synchronise la liste des avatars forme débloqués par rapport au niveau.
        /// </summary>
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

        /// <summary>
        /// Méthode utilitaire pour mettre à jour proprement UserProgress
        /// à partir de son niveau actuel.
        /// </summary>
        public static void ApplyToUserProgress(ProgressEntity progress, int level)
        {
            // Bulle : le choix vient d'un autre endpoint (SelectBubbleAvatar).

            // Forme : sync auto en fonction du level
            var (updated, active) = SyncShapeAvatars(level, progress.UnlockedShapeAvatarIds);
            progress.UnlockedShapeAvatarIds = updated;
            progress.ShapeAvatarId = active;
        }
    }
}
