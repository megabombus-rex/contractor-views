using ContractorsAPI.Model.Common;
using ContractorsAPI.Services.Business.Interfaces;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using QuestPDF.Fluent;

namespace ContractorsAPI.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class ReportController : ControllerBase
    {
        private readonly ILogger<ReportController> _logger;
        private readonly IReportingService _reportingService;

        public ReportController(ILogger<ReportController> logger, IReportingService reportingService)
        {
            _logger = logger;
            _reportingService = reportingService;
        }

        [HttpGet]
        public async Task<IActionResult> GetReport([FromHeader] int userId, CancellationToken ct)
        {
            var document = await _reportingService.CreateReportAsync(userId, ct);


            if (document.IsSuccess)
            {
                return File(document.Value!, "application/pdf", fileDownloadName: $"document.{Guid.NewGuid()}.pdf");
            }
            else
            {
                switch (document.ErrorCode)
                {
                    case (StatusCodes.Status404NotFound):
                        return NotFound(document);
                    default:
                        return BadRequest(document);
                }
            }
        }
    }
}