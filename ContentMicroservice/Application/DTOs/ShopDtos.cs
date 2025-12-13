using System.Collections.Generic;

namespace ContentMicroservice.Application.DTOs
{
    // DTO commun pour tous les Shops (Avatar / Classic Deck / Alive Deck)
    public class ShopDto
    {
        // Generic "currently equipped/selected" item (optional)
        public string? CurrentSelectedId { get; set; }

        public List<ShopFamilyDto> Families { get; set; } = new();
    }

    public class ShopFamilyDto
    {
        public string Key { get; set; } = "";
        public string Label { get; set; } = "";
        public List<ShopItemDto> Items { get; set; } = new();
    }

    public class ShopItemDto
    {
        public string Id { get; set; } = "";
        public string DisplayName { get; set; } = "";
        public string Family { get; set; } = "";
        public int PriceCents { get; set; }
        public bool Owned { get; set; }
    }
}
