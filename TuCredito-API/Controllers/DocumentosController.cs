using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using TuCredito.DTOs.Documentos;
using TuCredito.MinIO;
using TuCredito.Services.Implementations;

namespace TuCredito.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class DocumentosController : ControllerBase
    {
        private readonly DocumentoService _service;

        public DocumentosController(DocumentoService service)
        {
            _service = service;
        }

        [HttpPost]
        public async Task<IActionResult> Subir([FromForm] SubirDocumentoRequestDTO request)
        {
            await _service.SubirAsync(request);
            return Ok();
        }

        [HttpGet]
        public async Task<IActionResult> Listar(
            [FromQuery] string entidadTipo,
            [FromQuery] int entidadId)
        {
            var docs = await _service.ListarAsync(entidadTipo, entidadId);
            return Ok(docs);
        }

        [HttpGet("{idDocumento}/download")]
        public async Task<IActionResult> Descargar(int idDocumento)
        {
            var archivo = await _service.DescargarAsync(idDocumento);
            return File(
                archivo.Stream,
                archivo.ContentType,
                archivo.NombreOriginal);
        }

        [HttpDelete("{idDocumento}")]
        public async Task<IActionResult> Eliminar(int idDocumento)
        {
            await _service.EliminarAsync(idDocumento);
            return NoContent();
        }
    }
}
