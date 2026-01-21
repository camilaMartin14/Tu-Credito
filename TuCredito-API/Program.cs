using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.IdentityModel.Tokens;
using Microsoft.OpenApi;
using System.Text;
using TuCredito.Interceptors;
using TuCredito.MinIO;
using TuCredito.Models;
using TuCredito.Profiles;
using TuCredito.Repositories.Implementations;
using TuCredito.Repositories.Interfaces;
using TuCredito.Security;
using TuCredito.Services.Implementations;
using TuCredito.Services.Implementations.Clients;
using TuCredito.Services.Interfaces;
using TuCredito.Services.Interfaces.Clients;

var builder = WebApplication.CreateBuilder(args);

var jwtSection = builder.Configuration.GetSection("Jwt");
if (!jwtSection.Exists())
    throw new InvalidOperationException("La sección Jwt no está configurada en appsettings.json");

var jwtKey = jwtSection["Key"];
var jwtIssuer = jwtSection["Issuer"];
var jwtAudience = jwtSection["Audience"];

if (string.IsNullOrWhiteSpace(jwtKey) ||
    string.IsNullOrWhiteSpace(jwtIssuer) ||
    string.IsNullOrWhiteSpace(jwtAudience))
{
    throw new InvalidOperationException("La configuraci�n JWT es inv�lida o incompleta.");
}

var keyBytes = Encoding.UTF8.GetBytes(jwtKey);

builder.Services
    .AddAuthentication(JwtBearerDefaults.AuthenticationScheme)
    .AddJwtBearer(options =>
    {
        options.TokenValidationParameters = new TokenValidationParameters
        {
            ValidateIssuer = true,
            ValidateAudience = true,
            ValidateLifetime = true,
            ValidateIssuerSigningKey = true,
            ValidIssuer = jwtIssuer,
            ValidAudience = jwtAudience,
            IssuerSigningKey = new SymmetricSecurityKey(keyBytes),
            ClockSkew = TimeSpan.Zero
        };
    });

builder.Services.AddAuthorization();

builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowFrontend", policy =>
    {
        if (builder.Environment.IsDevelopment())
        {
            policy.AllowAnyOrigin()
                  .AllowAnyHeader()
                  .AllowAnyMethod();
        }
        else
        {
            policy.WithOrigins("https://tudominio.com")
                  .AllowAnyHeader()
                  .AllowAnyMethod();
        }
    });
});

builder.Services.AddControllers()
    .AddJsonOptions(options =>
    {
        options.JsonSerializerOptions.ReferenceHandler = System.Text.Json.Serialization.ReferenceHandler.IgnoreCycles;
    });
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen(options =>
{

options.SwaggerDoc("v1", new OpenApiInfo
{
    Title = "TuCredito",
    Version = "v1"
});

    options.AddSecurityDefinition("Bearer", new OpenApiSecurityScheme
    {
        Name = "Authorization",
        Type = SecuritySchemeType.Http,
        Scheme = "Bearer",
        BearerFormat = "JWT",
        In = ParameterLocation.Header,
        Description = "Bearer {token}"
    });

    options.AddSecurityRequirement(document => new OpenApiSecurityRequirement
    {
        [new OpenApiSecuritySchemeReference("Bearer", document)] = new List<string>()
    });
});

builder.Services.AddDbContext<TuCreditoContext>(options =>
    options.UseSqlServer(
        //builder.Configuration.GetConnectionString("AylenConnection")
        builder.Configuration.GetConnectionString("CamilaConnection")
    )
);

builder.Services.AddScoped<IPrestamoRepository, PrestamoRepository>();
builder.Services.AddScoped<IPrestatarioRepository, PrestatarioRepository>();
builder.Services.AddScoped<IPrestamistaRepository, PrestamistaRepository>();
builder.Services.AddScoped<ICuotaRepository, CuotaRepository>();
builder.Services.AddScoped<IPagoRepository, PagoRepository>();
builder.Services.AddScoped<IDocumentoRepository, DocumentoRepository>();
builder.Services.AddScoped<IPrestamoService, PrestamoService>();
builder.Services.AddScoped<IPrestatarioService, PrestatarioService>();
builder.Services.AddScoped<IPrestamistaService, PrestamistaService>();
builder.Services.AddScoped<ICuotaService, CuotaService>();
builder.Services.AddScoped<IDashboardService, DashboardService>();
builder.Services.AddScoped<IPagoService, PagoService>();
builder.Services.AddScoped<ICalculadoraService, CalculadoraService>();
builder.Services.AddScoped<IDolarService, DolarService>();
builder.Services.AddScoped<IEvaluacionCrediticiaService, EvaluacionCrediticiaService>();
builder.Services.AddHttpClient<IBcraDeudoresService, BcraDeudoresService>((sp, client) =>
{
    var configuration = sp.GetRequiredService<IConfiguration>();
    var baseUrl = configuration["BcraApi:BaseUrl"];
    if (string.IsNullOrEmpty(baseUrl))
    {
        throw new InvalidOperationException("La URL base de la API del BCRA no está configurada.");
    }
    client.BaseAddress = new Uri(baseUrl);
});

builder.Services.AddHttpContextAccessor(); 

builder.Services.AddScoped<JwtTokenGenerator>();

builder.Services.AddAutoMapper(cfg => { }, AppDomain.CurrentDomain.GetAssemblies());

builder.Services.AddScoped<IFileStorage, MinioFileStorage>();
builder.Services.AddScoped<IDocumentoService, DocumentoService>();
builder.Services.AddScoped<AuditInterceptor>();


var app = builder.Build();

if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

app.UseHttpsRedirection();
app.UseCors("AllowFrontend");
app.UseAuthentication();
app.UseAuthorization();
app.MapControllers();

app.Run();
