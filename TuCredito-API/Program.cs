using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.DependencyInjection;
using TuCredito.Models;
using TuCredito.Repositories.Interfaces;
using TuCredito.Services.Interfaces;
using TuCredito.Mappings;

var builder = WebApplication.CreateBuilder(args);

// Add services to the container.

builder.Services.AddControllers();
// Learn more about configuring Swagger/OpenAPI at https://aka.ms/aspnetcore/swashbuckle
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();

builder.Services.AddDbContext<TuCreditoContext>(options =>
    options.UseSqlServer(builder.Configuration.GetConnectionString("CamilaConnection")));
    //options.UseSqlServer(builder.Configuration.GetConnectionString("AylenConnection")));
// herencia
builder.Services.AddScoped<IPrestamoRepository, IPrestamoRepository>();
builder.Services.AddScoped<IPrestatarioRepository, IPrestatarioRepository>();
builder.Services.AddScoped<IPrestamoService, IPrestamoService>();
builder.Services.AddScoped<IPrestatarioRepository,  IPrestatarioRepository>();


//AutoMapper
builder.Services.AddAutoMapper(AppDomain.CurrentDomain.GetAssemblies()); //Esto le dice a AutoMapper:
                                                                         //“buscá todos los perfiles (Profile)
                                                                         //en el proyecto”.

var app = builder.Build();

// Configure the HTTP request pipeline.
if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}



app.UseHttpsRedirection();

app.UseAuthorization();

app.MapControllers();

app.Run();
