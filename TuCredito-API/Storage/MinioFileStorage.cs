using Minio;
using Minio.DataModel.Args;

namespace TuCredito.MinIO;
    public class MinioFileStorage : IFileStorage
    {
        private readonly IMinioClient _minio;
        private readonly string _bucket;

        public MinioFileStorage(IConfiguration config)
        {
            _bucket = config["Minio:Bucket"] ?? "default-bucket";
            var endpoint = config["Minio:Endpoint"] ?? "localhost:9000";
            var accessKey = config["Minio:AccessKey"] ?? "minioadmin";
            var secretKey = config["Minio:SecretKey"] ?? "minioadmin";
            var useSslStr = config["Minio:UseSSL"];
            bool useSsl = false;
            
            if (!string.IsNullOrEmpty(useSslStr))
            {
                bool.TryParse(useSslStr, out useSsl);
            }

            _minio = new MinioClient()
                .WithEndpoint(endpoint)
                .WithCredentials(accessKey, secretKey)
                .WithSSL(useSsl)
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
