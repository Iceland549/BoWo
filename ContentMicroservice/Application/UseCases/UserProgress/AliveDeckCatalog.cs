// ContentMicroservice/Application/UseCases/UserProgress/AliveDeckCatalog.cs
using System.Collections.Generic;
using ProgressEntity = ContentMicroservice.Infrastructure.Persistence.Entities.UserProgress;

namespace ContentMicroservice.Application.UseCases.UserProgress
{
    /// <summary>
    /// Catalogue des decks spéciaux "Alive" (illusions animées).
    /// V2 : 25 decks (Spiral / Moiré / Fluid / Tunnel / Phena)
    /// + logique de "tokens" dérivés via XP.
    /// </summary>
    internal static class AliveDeckCatalog
    {
        // === SPIRAL (7) ===
        public const string Spiral = "deck_alive_spiral";
        public const string SpiralColor2 = "deck_alive_spiral_color_2";
        public const string SpiralCosmicIris= "deck_alive_spiral_cosmic_iris";
        public const string SpiralFractal = "deck_alive_spiral_fractal";
        public const string SpiralGalaxy = "deck_alive_spiral_galaxy";
        public const string SpiralRings = "deck_alive_spiral_rings";
        public const string SpiralSun = "deck_alive_spiral_sun";

        // === MOIRÉ (1) ===
        public const string MoireHexagon = "deck_alive_moire_hexagon";


        // === FLUID (5) ===
        public const string FluidChrome = "deck_alive_fluid_chrome";
        public const string FluidCosmic = "deck_alive_fluid_cosmic";
        public const string FluidLava = "deck_alive_fluid_lava";
        public const string FluidNeon = "deck_alive_fluid_neon";
        public const string FluidSea = "deck_alive_fluid_sea";

        // === TUNNEL (6) ===
        public const string TunnelAstronautBlackHole = "deck_alive_tunnel_astronaute_black_hole";
        public const string TunnelChurch = "deck_alive_tunnel_church";
        public const string TunnelDragon = "deck_alive_tunnel_dragon";
        public const string TunnelNeon = "deck_alive_tunnel_neon";
        public const string TunnelSkateBlackHole = "deck_alive_tunnel_skate_black_hole";
        public const string TunnelTronSkate = "deck_alive_tunnel_tron_skate";
        public const string TunnelShark = "deck_alive_tunnel_shark";

        // === PHENAKISTO (5) ===
        public const string PhenaDragon = "deck_alive_phena_dragon";
        public const string PhenaEye = "deck_alive_phena_eye";
        public const string PhenaFlip = "deck_alive_phena_flip";
        public const string PhenaGhost = "deck_alive_phena_ghost";
        public const string PhenaHeart = "deck_alive_phena_heart";

        private static readonly string[] AllAliveDecks =
        {
            // Spiral
            Spiral, SpiralColor2, SpiralCosmicIris, SpiralFractal, SpiralGalaxy, SpiralRings, SpiralSun, 
            // Moiré
            MoireHexagon,
            // Fluid
            FluidChrome, FluidCosmic, FluidLava, FluidNeon,
            FluidSea,
            // Tunnel
            TunnelAstronautBlackHole, TunnelChurch, TunnelDragon,
            TunnelNeon, TunnelSkateBlackHole, TunnelTronSkate, TunnelShark,
            // Phena
            PhenaDragon, PhenaEye, PhenaFlip, PhenaGhost, PhenaHeart
        };

        private static readonly HashSet<string> AliveDeckSet =
            new HashSet<string>(AllAliveDecks);

        /// <summary>
        /// Liste complète des decks Alive connus du backend.
        /// </summary>
        public static IReadOnlyCollection<string> GetAll() => AllAliveDecks;

        /// <summary>
        /// Compat : ancienne méthode (V1).
        /// </summary>
        public static bool IsValid(string deckId) => AliveDeckSet.Contains(deckId);

        /// <summary>
        /// Vérifie qu'un id fait bien partie des decks Alive.
        /// </summary>
        public static bool IsValidAliveDeckId(string deckId) => AliveDeckSet.Contains(deckId);

        /// <summary>
        /// Nettoie la liste : enlève doublons / ids inconnus / nulls.
        /// </summary>
        public static List<string> SanitizeUnlockedAliveDecks(List<string> unlocked)
        {
            if (unlocked == null)
                return new List<string>();

            var cleaned = new List<string>();
            var seen = new HashSet<string>();

            foreach (var id in unlocked)
            {
                if (string.IsNullOrWhiteSpace(id))
                    continue;

                if (!AliveDeckSet.Contains(id))
                    continue;

                if (seen.Add(id))
                    cleaned.Add(id);
            }

            return cleaned;
        }

        private const int TokenXpStep = 1000;

        /// <summary>
        /// Calcule les "Alive tokens" disponibles :
        /// tokensEarned = XP / 1000
        /// tokensSpent  = nb de decks Alive valides déjà débloqués
        /// tokens       = max(0, tokensEarned - tokensSpent)
        /// </summary>
        public static int ComputeAvailableTokens(ProgressEntity progress)
        {
            if (progress == null) return 0;

            var tokensEarned = progress.XP / TokenXpStep;

            progress.UnlockedAliveDecks ??= new List<string>();
            var validUnlocked = SanitizeUnlockedAliveDecks(progress.UnlockedAliveDecks);
            var tokensSpent = validUnlocked.Count;

            var remaining = tokensEarned - tokensSpent;
            return remaining < 0 ? 0 : remaining;
        }

        /// <summary>
        /// Utilitaire de test (si tu veux forcer tous les decks débloqués).
        /// </summary>
        public static void EnsureAllAliveDecksUnlockedForTesting(ProgressEntity progress)
        {
            progress.UnlockedAliveDecks ??= new List<string>();

            foreach (var id in AllAliveDecks)
            {
                if (!progress.UnlockedAliveDecks.Contains(id))
                {
                    progress.UnlockedAliveDecks.Add(id);
                }
            }
        }
    }
}
