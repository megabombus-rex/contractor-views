namespace ContractorsAPI.Configuration
{
    public class AuthorizationJWTOptions
    {
        public string Secret { get; set; }
        public string Issuer { get; set; }
        // not used for now
        public string Audience { get; set; }
        public long ExpireInMinutes { get; set; }
    }
}
