// ContentMicroservice/Application/DTOs/AvatarShopDto.cs
using System.Collections.Generic;

namespace ContentMicroservice.Application.DTOs
{
    public class AvatarShopDto
    {
        public string? CurrentShapeAvatarId { get; set; }
        public List<AvatarShopFamilyDto> Families { get; set; } = new List<AvatarShopFamilyDto>();
    }

    public class AvatarShopFamilyDto
    {
        public string Key { get; set; } = string.Empty;   // "Archetype" | "Mascot" | "Emotion"
        public string Label { get; set; } = string.Empty; // label affichage
        public List<AvatarShopItemDto> Items { get; set; } = new List<AvatarShopItemDto>();
    }

    public class AvatarShopItemDto
    {
        public string Id { get; set; } = string.Empty;
        public string DisplayName { get; set; } = string.Empty;
        public string Family { get; set; } = string.Empty;
        public int PriceCents { get; set; }
        public bool Owned { get; set; }
    }
}
