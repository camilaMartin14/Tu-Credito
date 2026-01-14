using Minio;
using Minio.DataModel.Args;

namespace TuCredito.MinIO
{
    public class MinioFileStorage : IFileStorage
    {
        private readonly IMinioClient _minio;
        private readonly string _bucket;

        public MinioFileStorage(IConfiguration config)
        {
            _bucket = config["Minio:Bucket"];

            _minio = new MinioClient()
                .WithEndpoint(config["Minio:Endpoint"])
                .WithCredentials(
                    config["Minio:AccessKey"],
                    config["Minio:SecretKey"])
                .WithSSL(bool.Parse(config["Minio:UseSSL"]))
                .Build();
        }

        public async Task SubirAsync(Stream archivo, string ruta, string contentType)
        {
            await _minio.PutObjectAsync(
                new PutObjectArgs()
                    .WithBucket(_bucket)
                    .WithObject(ruta)
                    .WithStreamData(archivo)
                    .WithObjectSize(archivo.Length)
                    .WithContentType(contentType)
            );
        }

        public async Task<Stream> DescargarAsync(string ruta)
        {
            var ms = new MemoryStream();

            await _minio.GetObjectAsync(
                new GetObjectArgs()
                    .WithBucket(_bucket)
                    .WithObject(ruta)
                    .WithCallbackStream(s => s.CopyTo(ms))
            );

            ms.Position = 0;
            return ms;
        }

        public async Task EliminarAsync(string ruta)
        {
            await _minio.RemoveObjectAsync(
                new RemoveObjectArgs()
                    .WithBucket(_bucket)
                    .WithObject(ruta)
            );
        }
    }
}
