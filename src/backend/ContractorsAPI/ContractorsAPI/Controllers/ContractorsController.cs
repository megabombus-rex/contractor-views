using ContractorsAPI.Model.Contractor;
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

        [Route("{contractorId:int}")]
        [HttpGet]
        public async Task<IActionResult> GetContractorByIdAsync([FromRoute] int contractorId, CancellationToken ct)
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

        [HttpGet]
        public async Task<IActionResult> GetContractorsAsync([FromHeader] int userId, [FromQuery] string? query, [FromQuery] int? page, [FromQuery] int? count, [FromQuery] bool? orderByAsc, CancellationToken ct)
        {
            page ??= 1;
            count ??= 10;
            orderByAsc ??= true;

            if (userId < 0)
            {
                return NotFound("User id cannot be lesser than 0.");
            }

            var result = await _contractorService.GetContractorsAsync(userId, query, page.Value, count.Value, orderByAsc.Value, ct);

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
                    default:
                        return BadRequest(result);
                }
            }
        }

        [HttpPost]
        public async Task<IActionResult> AddContractorAsync([FromBody] AddUpdateContractorDTO dto, CancellationToken ct)
        {

            var result = await _contractorService.CreateNewContractorAsync(dto, ct);

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
                    case (StatusCodes.Status422UnprocessableEntity):
                        return UnprocessableEntity(result);
                    default:
                        return BadRequest(result);
                }
            }
        }

        [Route("{contractorId:int}")]
        [HttpPut]
        public async Task<IActionResult> UpdateContractorAsync([FromHeader(Name = "UserId")] int userId, [FromRoute] int contractorId, [FromBody] AddUpdateContractorDTO dto, CancellationToken ct)
        {
            var result = await _contractorService.UpdateContractorAsync(userId, contractorId, dto, ct);

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
                    case (StatusCodes.Status422UnprocessableEntity):
                        return UnprocessableEntity(result);
                    default:
                        return BadRequest(result);
                }
            }
        }

        [Route("{contractorId:int}")]
        [HttpDelete]
        public async Task<IActionResult> DeleteContractorAsync([FromHeader(Name = "UserId")] int userId, [FromRoute] int contractorId, CancellationToken ct)
        {
            var result = await _contractorService.DeleteContractorAsync(userId, contractorId, ct);

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
                    default:
                        return BadRequest(result);
                }
            }
        }
    }
}
