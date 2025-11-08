namespace ContentMicroservice.Infrastructure.Config
{
    public class MongoDbConfig
    {
        public string ConnectionString { get; set; } = "mongodb://localhost:27017";
        public string Database { get; set; } = "bowo-db";
        public string TrickCollection { get; set; } = "tricks";
        public string VideoCollection { get; set; } = "videos";
        public string UserProfileCollection { get; set; } = "profiles";

    }
}
