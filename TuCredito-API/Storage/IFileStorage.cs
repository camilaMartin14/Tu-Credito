namespace TuCredito.MinIO;
    public interface IFileStorage
    {
        Task SubirAsync(Stream archivo, string ruta, string contentType, CancellationToken cancellationToken = default);
        Task<Stream> DescargarAsync(string ruta, CancellationToken cancellationToken = default);
        Task EliminarAsync(string ruta, CancellationToken cancellationToken = default);
    }
