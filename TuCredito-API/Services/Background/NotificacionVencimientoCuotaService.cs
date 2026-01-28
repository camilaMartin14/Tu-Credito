
using Microsoft.EntityFrameworkCore;
using TuCredito.Models;
using TuCredito.Services.Interfaces;

namespace TuCredito.Services.Background
{
    public class NotificacionVencimientoCuotaService : BackgroundService
    {
        private readonly IServiceScopeFactory _scopeFactory;
        private readonly ILogger<NotificacionVencimientoCuotaService> _logger;
        private readonly TimeSpan _period = TimeSpan.FromHours(24);

        public NotificacionVencimientoCuotaService(IServiceScopeFactory scopeFactory, ILogger<NotificacionVencimientoCuotaService> logger)
        {
            _scopeFactory = scopeFactory;
            _logger = logger;
        }

        protected override async Task ExecuteAsync(CancellationToken stoppingToken)
        {
            _logger.LogInformation("NotificacionVencimientoCuotaService is starting.");

            // Wait a bit for the application to fully start
            await Task.Delay(TimeSpan.FromSeconds(30), stoppingToken);

            // Execute immediately once
            await ProcessAsync(stoppingToken);

            using var timer = new PeriodicTimer(_period);
            while (await timer.WaitForNextTickAsync(stoppingToken))
            {
                 await ProcessAsync(stoppingToken);
            }
        }

        private async Task ProcessAsync(CancellationToken stoppingToken)
        {
            _logger.LogInformation("Checking for expiring installments...");
            try
            {
                using (var scope = _scopeFactory.CreateScope())
                {
                    var context = scope.ServiceProvider.GetRequiredService<TuCreditoContext>();
                    var emailService = scope.ServiceProvider.GetRequiredService<IEmailService>();

                    var targetDate = DateTime.Today.AddDays(2);

                    // Find installments expiring in 2 days that are not paid (IdEstado != 2)
                    // Assuming IdEstado 2 is "Saldada" based on previous investigation
                    var cuotas = await context.Cuotas
                        .Include(c => c.IdPrestamoNavigation)
                            .ThenInclude(p => p.IdPrestamistaNavigation)
                        .Include(c => c.IdPrestamoNavigation)
                            .ThenInclude(p => p.DniPrestatarioNavigation)
                        .Where(c => c.IdEstado != 2 && c.FecVto.Date == targetDate)
                        .ToListAsync(stoppingToken);
                    
                    if (cuotas.Count == 0)
                    {
                        _logger.LogInformation("No installments found expiring on {TargetDate}", targetDate.ToShortDateString());
                        return;
                    }

                    _logger.LogInformation("Found {Count} installments expiring on {TargetDate}", cuotas.Count, targetDate.ToShortDateString());

                    foreach (var cuota in cuotas)
                    {
                        var prestamo = cuota.IdPrestamoNavigation;
                        var prestamista = prestamo.IdPrestamistaNavigation;
                        var prestatario = prestamo.DniPrestatarioNavigation;

                        if (prestamista == null || string.IsNullOrEmpty(prestamista.Correo))
                        {
                            _logger.LogWarning("Prestamista email missing for loan {IdPrestamo}", prestamo.IdPrestamo);
                            continue;
                        }

                        var subject = $"Aviso de Vencimiento de Cuota - Préstamo #{prestamo.IdPrestamo}";
                        var body = $@"
                            <html>
                            <body>
                                <h2>Aviso de Vencimiento de Cuota</h2>
                                <p>Estimado {prestamista.Nombre} {prestamista.Apellido},</p>
                                <p>Le informamos que la cuota Nro <strong>{cuota.NroCuota}</strong> del préstamo <strong>#{prestamo.IdPrestamo}</strong> está próxima a vencer.</p>
                                
                                <h3>Detalle de la Cuota:</h3>
                                <ul>
                                    <li>Monto: {cuota.Monto:C}</li>
                                    <li>Fecha de Vencimiento: {cuota.FecVto:dd/MM/yyyy}</li>
                                </ul>

                                <h3>Datos del Cliente:</h3>
                                <ul>
                                    <li>Nombre: {prestatario.Nombre} {prestatario.Apellido}</li>
                                    <li>DNI: {prestatario.Dni}</li>
                                    <li>Teléfono: {prestatario.Telefono}</li>
                                    <li>Correo: {prestatario.Correo}</li>
                                </ul>

                                <p>Saludos,<br/>El equipo de TuCrédito</p>
                            </body>
                            </html>";

                        await emailService.SendEmailAsync(prestamista.Correo, subject, body);
                    }
                }
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error occurred while executing NotificacionVencimientoCuotaService.");
            }
        }
    }
}
