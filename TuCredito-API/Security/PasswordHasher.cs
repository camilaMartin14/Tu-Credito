using Microsoft.AspNetCore.Identity;

namespace TuCredito.Security
{
    public class PasswordHasher
    {
        private static readonly PasswordHasher<object> _hasher = new();

        public static string Hash(string password)
        {
            return _hasher.HashPassword(new object(), password);
        }

        public static bool Verify(string password, string hash)
        {
            var result = _hasher.VerifyHashedPassword(new object(), hash, password);
            return result == PasswordVerificationResult.Success;
        }
    }
}
