using System.IO;

namespace TuCredito.MinIO;

public class LocalFileStorage : IFileStorage
{
    private readonly string _basePath;

    public LocalFileStorage(IConfiguration config)
    {
        // Use a local folder, default to "Uploads" in the current directory
        _basePath = Path.Combine(Directory.GetCurrentDirectory(), "Uploads");
        if (!Directory.Exists(_basePath))
        {
            Directory.CreateDirectory(_basePath);
        }
    }

    public async Task SubirAsync(Stream archivo, string ruta, string contentType)
    {
        var fullPath = Path.Combine(_basePath, ruta.Replace("/", Path.DirectorySeparatorChar.ToString()));
        var directory = Path.GetDirectoryName(fullPath);
        
        if (!Directory.Exists(directory))
        {
            Directory.CreateDirectory(directory);
        }

        using var fileStream = new FileStream(fullPath, FileMode.Create, FileAccess.Write);
        archivo.Position = 0;
        await archivo.CopyToAsync(fileStream);
    }

    public async Task<Stream> DescargarAsync(string ruta)
    {
        var fullPath = Path.Combine(_basePath, ruta.Replace("/", Path.DirectorySeparatorChar.ToString()));
        
        if (!File.Exists(fullPath))
        {
            throw new FileNotFoundException("El archivo no existe.");
        }

        var memoryStream = new MemoryStream();
        using (var fileStream = new FileStream(fullPath, FileMode.Open, FileAccess.Read))
        {
            await fileStream.CopyToAsync(memoryStream);
        }
        
        memoryStream.Position = 0;
        return memoryStream;
    }

    public Task EliminarAsync(string ruta)
    {
        var fullPath = Path.Combine(_basePath, ruta.Replace("/", Path.DirectorySeparatorChar.ToString()));
        
        if (File.Exists(fullPath))
        {
            File.Delete(fullPath);
        }
        
        return Task.CompletedTask;
    }
}
