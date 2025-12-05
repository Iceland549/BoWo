using System;

namespace ContentMicroservice.Application.UseCases.UserProgress
{
    /// <summary>
    /// Calcule le niveau global, le titre et les infos associées à partir de l'XP.
    /// Séparé pour que le barème soit facilement ajustable.
    /// </summary>
    internal static class LevelCalculator
    {
        // 20 paliers XP → Level 1..20
        // Tu peux encore ajuster les valeurs si tu veux accélérer / ralentir la progression.
        private static readonly (int MinXp, string Emoji, string Title)[] LEVELS =
        {
            (0,     "🛹",  "Parking Rookie"),
            (100,   "🧢",  "Street Kid"),
            (250,   "🔥",  "Rebel Shredder"),
            (450,   "⚡",  "Sidewalk Slayer"),
            (700,   "💥",  "Rail Hunter"),
            (1000,  "🥷",  "Sk8 Samurai"),
            (1350,  "🦂",  "Backyard Menace"),
            (1750,  "💎",  "Urban Myth"),
            (2200,  "🐍",  "Snake Run King"),
            (2700,  "🐉",  "Bowl Dragon"),
            (3250,  "🚀",  "Airwalk Pilot"),
            (3850,  "🧨",  "Gap Destroyer"),
            (4500,  "👻",  "Ghost Shredder"),
            (5200,  "🦇",  "Night Session Lord"),
            (5950,  "🌪️", "Concrete Tornado"),
            (6750,  "🛡️", "Park Warlord"),
            (7600,  "🌙", "Neon Shred Ghost"),
            (8500,  "🌀", "Eternal Shredlord"),
            (9450,  "🌌", "Cosmic Skater"),
            (10450, "👑🛹","BoWo Demigod")
        };

        internal sealed class LevelInfo
        {
            public int Level { get; init; }
            public string LevelTitle { get; init; } = string.Empty;
            public string LevelEmoji { get; init; } = string.Empty;
            public int CurrentLevelMinXP { get; init; }
            public int NextLevelMinXP { get; init; }
            public int XPToNextLevel { get; init; }
            public int MaxDefinedLevel { get; init; }
            public bool IsMaxLevel { get; init; }
        }

        public static LevelInfo Compute(int rawXp)
        {
            var xp = Math.Max(0, rawXp);

            var def = LEVELS[0];
            var index = 0;

            for (var i = 0; i < LEVELS.Length; i++)
            {
                if (xp >= LEVELS[i].MinXp)
                {
                    def = LEVELS[i];
                    index = i;
                }
                else
                {
                    break;
                }
            }

            var currentLevel = index + 1;
            var maxLevel = LEVELS.Length;
            var isMax = currentLevel >= maxLevel;

            var nextDef = isMax ? def : LEVELS[index + 1];
            var xpToNext = isMax ? 0 : Math.Max(0, nextDef.MinXp - xp);

            return new LevelInfo
            {
                Level = currentLevel,
                LevelTitle = def.Title,
                LevelEmoji = def.Emoji,
                CurrentLevelMinXP = def.MinXp,
                NextLevelMinXP = nextDef.MinXp,
                XPToNextLevel = xpToNext,
                MaxDefinedLevel = maxLevel,
                IsMaxLevel = isMax
            };
        }
    }
}
