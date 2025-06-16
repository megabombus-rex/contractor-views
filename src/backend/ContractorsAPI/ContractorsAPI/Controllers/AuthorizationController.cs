using ContractorsAPI.Model.Common;
using ContractorsAPI.Model.User;
using ContractorsAPI.Services.Authorization.Interfaces;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;

namespace ContractorsAPI.Controllers
{
    [Route("api/auth")]
    [ApiController]
    public class AuthorizationController : ControllerBase
    {
        private readonly ILogger<AuthorizationController> _logger;
        private readonly IAuthenticationService _authenticationService;

        public AuthorizationController(ILogger<AuthorizationController> logger, IAuthenticationService authenticationService)
        {
            _logger = logger;
            _authenticationService = authenticationService;
        }

        [Route("login")]
        [HttpPost]
        public async Task<IActionResult> AuthenticateUserAsync([FromBody] AuthenticateUserDTO userDTO, CancellationToken ct)
        {
            var jwt = await _authenticationService.AuthenticateUserAsync(userDTO, ct);

            if (jwt.IsSuccess)
            {
                return Ok(jwt);
            }
            else
            {
                switch (jwt.ErrorCode)
                {
                    case (StatusCodes.Status404NotFound):
                        return NotFound(jwt);
                    case (StatusCodes.Status422UnprocessableEntity):
                        return NotFound(jwt);
                    case (StatusCodes.Status500InternalServerError):
                        return BadRequest(jwt);
                    default:
                        return BadRequest(jwt);
                }
            }
        }

        [Route("register")]
        [HttpPost]
        public async Task<IActionResult> RegisterUserAsync([FromBody] RegisterUserDTO userDTO, CancellationToken ct)
        {
            var jwt = await _authenticationService.RegisterUserAsync(userDTO, ct);

            if (jwt.IsSuccess)
            {
                return Ok(jwt);
            }
            else
            {
                switch (jwt.ErrorCode)
                {
                    case (StatusCodes.Status404NotFound):
                        return NotFound(jwt);
                    case (StatusCodes.Status422UnprocessableEntity):
                        return NotFound(jwt);
                    case (StatusCodes.Status500InternalServerError):
                        return BadRequest(jwt);
                    default:
                        return BadRequest(jwt);
                }
            }
        }

        [Route("remove")]
        [HttpDelete]
        public async Task<IActionResult> RemoveUserAsync([FromHeader(Name = "jwt")] string jwt, CancellationToken ct)
        {
            if (string.IsNullOrEmpty(jwt))
            {
                return NotFound("User could not be identified.");
            }

            var currentUserId = User.Claims.SingleOrDefault(c => c.Type == ClaimTypes.NameIdentifier)?.Value;

            if (string.IsNullOrEmpty(currentUserId))
            {
                return NotFound("User could not be identified.");
            }

            var result = await _authenticationService.RemoveUserAsync(int.Parse(currentUserId), ct);

            if (result.IsSuccess)
            {
                return NoContent();
            }
            else
            {
                switch (result.ErrorCode)
                {
                    case (StatusCodes.Status404NotFound):
                        return NotFound(result);
                    case (StatusCodes.Status422UnprocessableEntity):
                        return NotFound(result);
                    case (StatusCodes.Status500InternalServerError):
                        return BadRequest(result);
                    default:
                        return BadRequest(result);
                }
            }
        }
    }
}
