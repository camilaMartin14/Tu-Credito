using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using TuCredito.DTOs.Documentos;
using TuCredito.MinIO;
using TuCredito.Services.Interfaces;

namespace TuCredito.Controllers;
    [Route("api/documents")]
    [ApiController]
    public class DocumentosController : ControllerBase
    {
        private readonly IDocumentoService _service;

        public DocumentosController(IDocumentoService service)
        {
            _service = service;
        }

        [HttpPost]
        public async Task<IActionResult> Subir([FromForm] SubirDocumentoRequestDTO request)
        {
            try
            {
                await _service.SubirAsync(request);
                return Ok(new { message = "Documento subido correctamente." });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "Error al subir el documento.", error = ex.Message });
            }
        }

        [HttpGet]
        public async Task<IActionResult> Listar(
            [FromQuery] string entidadTipo,
            [FromQuery] int entidadId)
        {
            try
            {
                var docs = await _service.ListarAsync(entidadTipo, entidadId);
                return Ok(docs);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "Error al listar documentos.", error = ex.Message });
            }
        }

        [HttpGet("{idDocumento}/download")]
        public async Task<IActionResult> Descargar(int idDocumento)
        {
            try
            {
                var archivo = await _service.DescargarAsync(idDocumento);
                return File(
                    archivo.Stream,
                    archivo.ContentType,
                    archivo.NombreOriginal);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "Error al descargar el documento.", error = ex.Message });
            }
        }

        [HttpDelete("{idDocumento}")]
        public async Task<IActionResult> Eliminar(int idDocumento)
        {
            try
            {
                await _service.EliminarAsync(idDocumento);
                return NoContent();
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "Error al eliminar el documento.", error = ex.Message });
            }
        }
    }
