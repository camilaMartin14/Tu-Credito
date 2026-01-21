namespace TuCredito.MinIO;
    public interface IFileStorage
    {
        Task SubirAsync(Stream archivo, string ruta, string contentType);
        Task<Stream> DescargarAsync(string ruta);
        Task EliminarAsync(string ruta);
    }
