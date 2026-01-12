using TuCredito.DTOs.Documentos;
using TuCredito.MinIO;
using TuCredito.Models.Documentos;
using TuCredito.Repositories.Interfaces;

public class DocumentoService
{
    private readonly IDocumentoRepository _documentoRepo;
    private readonly IFileStorage _fileStorage;
    private readonly IPrestatarioRepository _clienteRepo;
    private readonly IPrestamoRepository _prestamoRepo;

    public DocumentoService(
        IDocumentoRepository documentoRepo,
        IFileStorage fileStorage,
        IPrestatarioRepository clienteRepo,
        IPrestamoRepository prestamoRepo)
    {
        _documentoRepo = documentoRepo;
        _fileStorage = fileStorage;
        _clienteRepo = clienteRepo;
        _prestamoRepo = prestamoRepo;
    }

    public async Task SubirAsync(SubirDocumentoRequestDTO request)
    {
        await ValidarEntidadAsync(request.EntidadTipo, request.EntidadId);

        var ruta = $"{request.EntidadTipo.ToLower()}/" +
                   $"{request.EntidadId}/" +
                   $"{request.TipoDocumento.ToLower()}/" +
                   $"{Guid.NewGuid()}_{request.Archivo.FileName}"; // Use GUID to avoid collision

        using var stream = request.Archivo.OpenReadStream();
        await _fileStorage.SubirAsync(
            stream,
            ruta,
            request.Archivo.ContentType);

        var documento = new Documento(
            request.EntidadTipo,
            request.EntidadId,
            request.TipoDocumento,
            request.Archivo.FileName,
            ruta,
            request.Archivo.ContentType,
            request.UsuarioId
        );

        await _documentoRepo.AgregarAsync(documento);
    }

    public async Task<List<RespuestaDocumentoDto>> ListarAsync(
        string entidadTipo,
        int entidadId)
    {
        await ValidarEntidadAsync(entidadTipo, entidadId);

        var documentos = await _documentoRepo
            .ListarAsync(entidadTipo, entidadId);

        return documentos
            .Select(d => new RespuestaDocumentoDto
            {
                IdDocumento = d.IdDocumento,
                TipoDocumento = d.TipoDocumento,
                NombreOriginal = d.NombreOriginal,
                FechaSubida = d.FechaSubida
            })
            .ToList();
    }

    public async Task<(Stream Stream, string ContentType, string NombreOriginal)>
        DescargarAsync(int idDocumento)
    {
        var documento = await _documentoRepo
            .ObtenerPorIdAsync(idDocumento)
            ?? throw new Exception("Documento no encontrado");

        var stream = await _fileStorage
            .DescargarAsync(documento.RutaStorage);

        return (stream, documento.ContentType, documento.NombreOriginal);
    }

    public async Task EliminarAsync(int idDocumento)
    {
        var documento = await _documentoRepo.ObtenerPorIdAsync(idDocumento);
        if (documento == null)
            throw new Exception("Documento no encontrado");

        // Soft delete in DB
        documento.Desactivar();
        await _documentoRepo.ActualizarAsync(documento);
    }

    private async Task ValidarEntidadAsync(
        string entidadTipo,
        int entidadId)
    {
        switch (entidadTipo)
        {
            case "Cliente":
                var cliente = await _clienteRepo.ObtenerPorDniAsync(entidadId);
                if (cliente == null)
                    throw new Exception("Cliente inexistente");
                break;

            case "Prestamo":
                var prestamo = await _prestamoRepo.GetPrestamoById(entidadId);
                if (prestamo == null)
                    throw new Exception("Préstamo inexistente");
                break;

            default:
                throw new Exception("EntidadTipo inválido");
        }
    }
}
