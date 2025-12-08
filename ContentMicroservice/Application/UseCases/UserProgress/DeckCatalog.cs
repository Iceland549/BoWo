//// ContentMicroservice/Application/UseCases/UserProgress/DeckCatalog.cs
//using System;
//using System.Collections.Generic;
//using System.Linq;

//namespace ContentMicroservice.Application.UseCases.UserProgress
//{
//    /// <summary>
//    /// Catalogue des decks collectables (Gen 1).
//    /// Ici on sépare :
//    /// - SkillDeckPool : 20 decks pour les 20 tricks MASTERED
//    /// - BonusDeckPool : le reste (badges, streak, events, time killers...)
//    /// </summary>
//    internal static class DeckCatalog
//    {
//        private static readonly Random _rng = new();

//        // 🧩 Tous les decks connus par le backend (alignés avec ton DECK_CATALOG côté front)
//        public static readonly string[] AllDeckIds =
//        {
//            //"deck_rust_riot",
//            //"deck_grunge_burner",
//            //"deck_toxic_trash",
//            //"deck_anarchy_slash",
//            //"deck_street_chaos",

//            //"deck_kawaii_bubble",
//            //"deck_retro_arcade",
//            //"deck_comic_boom",
//            //"deck_emoji_madness",
//            //"deck_candy_swirl",

//            //"deck_lucha_flame",
//            //"deck_aztec_jaguar",
//            //"deck_sugar_skull",
//            //"deck_favela_vibes",
//            //"deck_samba_spirit",

//            //"deck_venice_sunset",
//            //"deck_surfline_blue",
//            //"deck_palm_drift",
//            //"deck_skate_n_surf",
//            //"deck_pacific_breeze",

//            //"deck_rising_sun_oni",
//            //"deck_sakura_wind",
//            //"deck_koi_guardian",
//            //"deck_katana_slash",
//            //"deck_anime_speed",

//            //"deck_neon_pulse",
//            //"deck_laser_grid",
//            //"deck_circuit_overload",
//            //"deck_hologram_drift",
//            //"deck_ultracyber",

//            //"deck_shadow_demon",
//            //"deck_cursed_totem",
//            //"deck_dragon_ember",
//            //"deck_phantom_rider",
//            //"deck_abyss_serpent",

//            //"deck_minimal_frost",
//        };

//        // 🎯 20 decks pour les 20 tricks MASTERED
//        // (1 trick masterisé = 1 deck tiré dans cette pool)
//        public static readonly string[] SkillDeckPool =
//        {
//            "deck_rust_riot",
//            "deck_grunge_burner",
//            "deck_toxic_trash",
//            "deck_anarchy_slash",
//            "deck_street_chaos",

//            "deck_kawaii_bubble",
//            "deck_retro_arcade",
//            "deck_comic_boom",
//            "deck_emoji_madness",
//            "deck_candy_swirl",

//            "deck_lucha_flame",
//            "deck_aztec_jaguar",
//            "deck_sugar_skull",
//            "deck_favela_vibes",
//            "deck_samba_spirit",

//            "deck_venice_sunset",
//            "deck_surfline_blue",
//            "deck_palm_drift",
//            "deck_skate_n_surf",
//            "deck_pacific_breeze",
//        };

//        // 🧿 Tous les autres decks = BONUS (badges, streak, events, time-killers…)
//        public static readonly string[] BonusDeckPool =
//            AllDeckIds.Except(SkillDeckPool).ToArray();

//        /// <summary>
//        /// Tire un deck dans la pool SKILL, en préférant ceux que l'utilisateur ne possède pas encore.
//        /// Fallback : si tous les skill decks sont possédés, renvoie un deck skill aléatoire.
//        /// </summary>
//        public static string GetRandomNewSkillDeck(IReadOnlyCollection<string> alreadyOwned)
//        {
//            var candidates = SkillDeckPool
//                .Where(id => !alreadyOwned.Contains(id))
//                .ToList();

//            if (candidates.Count == 0)
//            {
//                // Tous les skill decks sont déjà possédés → on renvoie un skill deck random
//                var idx = _rng.Next(SkillDeckPool.Length);
//                return SkillDeckPool[idx];
//            }

//            var randomIndex = _rng.Next(candidates.Count);
//            return candidates[randomIndex];
//        }

//        /// <summary>
//        /// Compatibilité avec l'ancien nom utilisé dans SubmitQuestionAnswerUseCase.
//        /// => Désormais, ça NE PIQUE QUE dans SkillDeckPool.
//        /// </summary>
//        public static string GetRandomNewDeckId(IReadOnlyCollection<string> alreadyOwned)
//            => GetRandomNewSkillDeck(alreadyOwned);

//        /// <summary>
//        /// Pour plus tard : tirer un deck BONUS (badges, streak, events, time-killers...)
//        /// Renvoie null si aucun deck bonus neuf n'est disponible.
//        /// </summary>
//        public static string? GetRandomNewBonusDeck(IReadOnlyCollection<string> alreadyOwned)
//        {
//            var candidates = BonusDeckPool
//                .Where(id => !alreadyOwned.Contains(id))
//                .ToList();

//            if (candidates.Count == 0)
//                return null;

//            var randomIndex = _rng.Next(candidates.Count);
//            return candidates[randomIndex];
//        }
//    }
//}

// ContentMicroservice/Application/UseCases/UserProgress/DeckCatalog.cs
using System;
using System.Collections.Generic;
using System.Linq;

namespace ContentMicroservice.Application.UseCases.UserProgress
{
    /// <summary>
    /// Catalogue des decks collectables (Gen 1).
    /// V1 : 20 decks liés aux 20 tricks MASTERED.
    /// </summary>
    internal static class DeckCatalog
    {
        private static readonly Random _rng = new();

        // 🔥 Tous les decks connus en V1 (20 decks)
        public static readonly string[] AllDeckIds =
        {
            "deck_abyssal_demon",
            "deck_anarchy_slash",
            "deck_candy_swirl",
            "deck_aztec_jaguar",
            "deck_emoji_madness",
            "deck_favela_vibes",
            "deck_grunge_burner",
            "deck_kanji_rebellion",
            "deck_kawaii_bubble_2",
            "deck_koi",
            "deck_lucha_flame",
            "deck_power_man",
            "deck_rising_sun_oni",
            "deck_rust_riot",
            "deck_sakura",
            "deck_street_chaos",
            "deck_sugar_skull",
            "deck_toxic_trash",
            "deck_tron",
            "deck_venice_sunset",
        };

        // 🎯 V1 : tous les decks sont des “Skill decks” (1 trick MASTERED = 1 deck tiré ici)
        public static readonly string[] SkillDeckPool = AllDeckIds;

        // V1 : pas encore de pool bonus → vide pour l’instant
        public static readonly string[] BonusDeckPool = Array.Empty<string>();

        /// <summary>
        /// Tire un deck dans la pool SKILL, en préférant ceux que l'utilisateur ne possède pas encore.
        /// Si tous sont possédés, renvoie un deck skill aléatoire.
        /// </summary>
        public static string GetRandomNewSkillDeck(IReadOnlyCollection<string> alreadyOwned)
        {
            var candidates = SkillDeckPool
                .Where(id => !alreadyOwned.Contains(id))
                .ToList();

            if (candidates.Count == 0)
            {
                var idx = _rng.Next(SkillDeckPool.Length);
                return SkillDeckPool[idx];
            }

            var randomIndex = _rng.Next(candidates.Count);
            return candidates[randomIndex];
        }

        /// <summary>
        /// Compatibilité avec le nom utilisé dans SubmitQuestionAnswerUseCase.
        /// </summary>
        public static string GetRandomNewDeckId(IReadOnlyCollection<string> alreadyOwned)
            => GetRandomNewSkillDeck(alreadyOwned);

        /// <summary>
        /// Pour plus tard : tirer un deck BONUS (badges, streak, events, time-killers...).
        /// </summary>
        public static string? GetRandomNewBonusDeck(IReadOnlyCollection<string> alreadyOwned)
        {
            if (BonusDeckPool.Length == 0)
                return null;

            var candidates = BonusDeckPool
                .Where(id => !alreadyOwned.Contains(id))
                .ToList();

            if (candidates.Count == 0)
                return null;

            var randomIndex = _rng.Next(candidates.Count);
            return candidates[randomIndex];
        }
    }
}

