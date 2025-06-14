using ContractorsAPI.Services.Interfaces;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;

namespace ContractorsAPI.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class ContractorsController : ControllerBase
    {
        private ILogger<ContractorsController> _logger;
        private readonly IContractorService _contractorService;

        public ContractorsController(ILogger<ContractorsController> logger, IContractorService contractorService)
        {
            _logger = logger;
            _contractorService = contractorService;
        }

        [Route("{contractorId:guid}")]
        [HttpGet]
        public async Task<IActionResult> GetContractorByIdAsync(int contractorId, CancellationToken ct)
        { 
            if (contractorId < 0)
            {
                return NotFound("Contractor id cannot be lesser than 0.");
            }

            var result = await _contractorService.GetContractorByIdAsync(contractorId, ct);

            if (result.IsSuccess)
            {
                return Ok(result);
            }
            else
            {
                switch (result.ErrorCode)
                {
                    case (StatusCodes.Status404NotFound):
                        return NotFound(result);
                    case (StatusCodes.Status500InternalServerError):
                        return BadRequest(result);
                    default:
                        return BadRequest(result);
                }
            }
        }

        [Route("{contractorId:guid}")]
        [HttpGet]
        public async Task<IActionResult> GetContractorsAsync(int userId, string query, int page, int count, bool orderByAsc, CancellationToken ct)
        {
            if (userId < 0)
            {
                return NotFound("User id cannot be lesser than 0.");
            }

            var result = await _contractorService.GetContractorsAsync(userId, query, page, count, orderByAsc, ct);

            if (result.IsSuccess)
            {
                return Ok(result);
            }
            else
            {
                switch (result.ErrorCode)
                {
                    case (StatusCodes.Status404NotFound):
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
