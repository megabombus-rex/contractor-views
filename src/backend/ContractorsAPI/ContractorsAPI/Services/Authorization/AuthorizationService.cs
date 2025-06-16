using ContractorsAPI.Configuration;
using ContractorsAPI.Database;
using ContractorsAPI.Entities;
using ContractorsAPI.Model.Common;
using ContractorsAPI.Model.User;
using ContractorsAPI.Services.Authorization.Interfaces;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Options;
using Microsoft.IdentityModel.Tokens;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Security.Cryptography;
using System.Text;
using System.Text.Unicode;

namespace ContractorsAPI.Services.Authorization
{
    public class AuthorizationService : IAuthenticationService
    {
        private readonly ContractorsDbContext _dbContext;
        private readonly AuthorizationJWTOptions _jwtOptions;
        private readonly ILogger<AuthorizationService> _logger;

        // no administrators in the system
        public AuthorizationService(ContractorsDbContext dbContext, IOptions<AuthorizationJWTOptions> jwtOptions, ILogger<AuthorizationService> logger)
        {
            _dbContext = dbContext;
            _jwtOptions = jwtOptions.Value;
            _logger = logger;
        }

        public async Task<Result<string>> AuthenticateUserAsync(AuthenticateUserDTO userDTO, CancellationToken ct)
        {
            if (string.IsNullOrEmpty(userDTO.EmailAddress) || string.IsNullOrEmpty(userDTO.Password))
            {
                return Result<string>.Failure("Provided password or email address is empty.", StatusCodes.Status422UnprocessableEntity);
            }

            var user = await _dbContext.Users.FirstOrDefaultAsync(u => u.EmailAddress.Equals(userDTO.EmailAddress), ct);

            if (user == null || user.PasswordHash.Equals(CreateHash(userDTO.Password)))
            {
                return Result<string>.Failure("Provided password or email address is invalid.", StatusCodes.Status404NotFound);
            }

            return Result<string>.Success(CreateJWT(user));
        }

        public async Task<Result<string>> RegisterUserAsync(RegisterUserDTO userDTO, CancellationToken ct)
        {
            if (string.IsNullOrEmpty(userDTO.UserName) || string.IsNullOrEmpty(userDTO.Password))
            {
                return Result<string>.Failure("Provided password or username is empty.", StatusCodes.Status422UnprocessableEntity);
            }

            if (!IsValidEmail(userDTO.EmailAddress))
            {
                return Result<string>.Failure("Provided email address not a valid email address.", StatusCodes.Status422UnprocessableEntity);
            }

            if (await _dbContext.Users.AnyAsync(x => x.EmailAddress.Equals(userDTO.EmailAddress), ct))
            {
                return Result<string>.Failure("Provided email address is already in use.", StatusCodes.Status422UnprocessableEntity);
            }

            var user = new User()
            {
                UserName = userDTO.UserName,
                EmailAddress = userDTO.EmailAddress,
                PasswordHash = CreateHash(userDTO.Password),
            };

            try
            {
                _dbContext.Users.Add(user);
                await _dbContext.SaveChangesAsync(ct);
            }
            catch (Exception ex) 
            {
                _logger.LogError($"Exception thrown while registering a user. Exception: {ex.Message}.", ex);
                return Result<string>.Failure("Encountered an issue while registering a user.", StatusCodes.Status500InternalServerError);
            }


            return Result<string>.Success(CreateJWT(user));
        }

        public async Task<Result> RemoveUserAsync(int userId, CancellationToken ct)
        {
            if (userId < 0) { 
                return Result.Failure("Bad user id.", StatusCodes.Status404NotFound);
            }

            var user = await _dbContext.Users.FirstOrDefaultAsync(u => u.Id == userId, ct);

            if (user == null)
            {
                return Result.Failure("User with provided user id could not be found.", StatusCodes.Status404NotFound);
            }

            return Result.Success();
        }

        private string CreateJWT(User user)
        {
            var claims = new List<Claim>()
            {
                new Claim(ClaimTypes.Name, user.UserName),
                new Claim(ClaimTypes.NameIdentifier, user.Id.ToString())
            };

            var key = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(_jwtOptions.Secret)); 
            var credentials = new SigningCredentials(key, SecurityAlgorithms.HmacSha256);
            var expires = DateTime.Now.AddMinutes(_jwtOptions.ExpireInMinutes);

            var token = new JwtSecurityToken(_jwtOptions.Issuer,
                _jwtOptions.Audience,
                claims,
                expires: expires,
                signingCredentials: credentials);

            return new JwtSecurityTokenHandler().WriteToken(token);
        }

        // no salt
        private string CreateHash(string textToHash)
        {
            byte[] bytes = Encoding.UTF8.GetBytes(textToHash);
            StringBuilder stringBuilder = new StringBuilder();
            using (SHA256 hashstring = SHA256.Create())
            {
                byte[] hash = hashstring.ComputeHash(bytes);
                for (int i = 0; i < bytes.Length; i++)
                {
                    stringBuilder.Append(bytes[i].ToString("x2"));
                }
            }
            return stringBuilder.ToString();
        }

        private bool IsValidEmail(string email)
        {
            var trimmedEmail = email.Trim();

            if (trimmedEmail.EndsWith("."))
            {
                return false;
            }
            try
            {
                var addr = new System.Net.Mail.MailAddress(email);
                return addr.Address == trimmedEmail;
            }
            catch
            {
                return false;
            }
        }
    }
}
