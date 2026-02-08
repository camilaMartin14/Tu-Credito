using Microsoft.EntityFrameworkCore;
using TuCredito.Models;

namespace TuCredito.Data
{
    public static class DbInitializer
    {
        public static void Initialize(TuCreditoContext context)
        {
            // Ensure database is created
            context.Database.EnsureCreated();

            // Check if DB has been seeded
            if (context.EstadosPrestamos.Any())
            {
                return;   // DB has been seeded
            }

            // 1. Estados Prestamos
            var estadosPrestamos = new EstadosPrestamo[]
            {
                new EstadosPrestamo { IdEstado = 1, Descripcion = "Activo" },
                new EstadosPrestamo { IdEstado = 2, Descripcion = "Finalizado" },
                new EstadosPrestamo { IdEstado = 3, Descripcion = "Eliminado" },
                new EstadosPrestamo { IdEstado = 4, Descripcion = "Archivado" }
            };
            // Use explicit SQL identity insert strategy or just add them if the provider supports identity insert on add
            // For simplicity in EF Core, if we want specific IDs, we can just add them. 
            // SQL Server requires Identity Insert ON, Postgres usually handles it if you provide the value.
            context.EstadosPrestamos.AddRange(estadosPrestamos);
            context.SaveChanges();

            // 2. Estados Cuotas
            var estadosCuotas = new EstadosCuota[]
            {
                new EstadosCuota { IdEstado = 1, Descripcion = "Pendiente" },
                new EstadosCuota { IdEstado = 2, Descripcion = "Saldada" },
                new EstadosCuota { IdEstado = 3, Descripcion = "Vencida" },
                new EstadosCuota { IdEstado = 4, Descripcion = "Reprogramada" }
            };
            context.EstadosCuotas.AddRange(estadosCuotas);
            context.SaveChanges();

            // 3. Sistemas de Amortizacion
            var sistAmortizacion = new SistAmortizacion[]
            {
                new SistAmortizacion { IdSistAmortizacion = 1, Descripcion = "Francés" },
                new SistAmortizacion { IdSistAmortizacion = 2, Descripcion = "Alemán" },
                new SistAmortizacion { IdSistAmortizacion = 3, Descripcion = "Americano" },
                new SistAmortizacion { IdSistAmortizacion = 4, Descripcion = "Tasa Fija" }
            };
            context.SistAmortizacions.AddRange(sistAmortizacion);
            context.SaveChanges();

            // 4. Medios de Pago
            var mediosPago = new MediosDePago[]
            {
                new MediosDePago { IdMedioPago = 1, Descripcion = "Efectivo", Moneda = "ARS" },
                new MediosDePago { IdMedioPago = 2, Descripcion = "Transferencia", Moneda = "ARS" },
                new MediosDePago { IdMedioPago = 3, Descripcion = "Depósito", Moneda = "ARS" }
            };
            context.MediosDePagos.AddRange(mediosPago);
            context.SaveChanges();

            // 5. Prestamistas
            // Note: Password hash from original seed
            var prestamistas = new Prestamista[]
            {
                new Prestamista { 
                    Usuario = "demo", 
                    ContraseniaHash = "AQAAAAIAAYagAAAAEGFF3lpqazHBXTkRe0B04cMQ7LcTpdBLR8g52s/2y/LriCUC7sDYlhlu2DpM2/R05w==", 
                    Nombre = "Usuario", 
                    Apellido = "Demo", 
                    Correo = "demo@tucredito.com", 
                    EsActivo = true 
                },
                new Prestamista { 
                    Usuario = "admin", 
                    ContraseniaHash = "AQAAAAIAAYagAAAAEGFF3lpqazHBXTkRe0B04cMQ7LcTpdBLR8g52s/2y/LriCUC7sDYlhlu2DpM2/R05w==", 
                    Nombre = "Admin", 
                    Apellido = "General", 
                    Correo = "admin@tucredito.com", 
                    EsActivo = true 
                }
            };
            context.Prestamistas.AddRange(prestamistas);
            context.SaveChanges();

            // 6. Garantes
            var garantes = new Garante[]
            {
                new Garante { Nombre = "Roberto", Apellido = "Sanchez", Telefono = "11111111", Domicilio = "Calle 1", Correo = "roberto@mail.com", EsActivo = true },
                new Garante { Nombre = "Lucia", Apellido = "Mendez", Telefono = "22222222", Domicilio = "Calle 2", Correo = "lucia@mail.com", EsActivo = true },
                new Garante { Nombre = "Carlos", Apellido = "Tevez", Telefono = "33333333", Domicilio = "Calle 3", Correo = "carlos@mail.com", EsActivo = true }
            };
            context.Garantes.AddRange(garantes);
            context.SaveChanges();

            // 7. Prestatarios
            // We need to fetch references to link FKs correctly if we didn't force IDs
            var g1 = context.Garantes.Local.FirstOrDefault(g => g.Nombre == "Roberto");
            var g2 = context.Garantes.Local.FirstOrDefault(g => g.Nombre == "Lucia");
            var g3 = context.Garantes.Local.FirstOrDefault(g => g.Nombre == "Carlos");

            var prestatarios = new Prestatario[]
            {
                new Prestatario { Dni = 10000001, Nombre = "Juan", Apellido = "Perez", Telefono = "1144444444", Domicilio = "Av. Corrientes 1000", Correo = "juan.p@mail.com", EsActivo = true, IdGarante = g1?.IdGarante },
                new Prestatario { Dni = 10000002, Nombre = "Maria", Apellido = "Gonzalez", Telefono = "1155555555", Domicilio = "Av. Santa Fe 2000", Correo = "maria.g@mail.com", EsActivo = true, IdGarante = g2?.IdGarante },
                new Prestatario { Dni = 10000003, Nombre = "Pedro", Apellido = "Rodriguez", Telefono = "1166666666", Domicilio = "Calle Florida 500", Correo = "pedro.r@mail.com", EsActivo = true, IdGarante = g3?.IdGarante },
                new Prestatario { Dni = 10000004, Nombre = "Ana", Apellido = "Fernandez", Telefono = "1177777777", Domicilio = "Av. de Mayo 300", Correo = "ana.f@mail.com", EsActivo = true, IdGarante = g1?.IdGarante },
                new Prestatario { Dni = 10000005, Nombre = "Diego", Apellido = "Maradona", Telefono = "1188888888", Domicilio = "Segurola y Habana", Correo = "diego10@mail.com", EsActivo = true, IdGarante = g2?.IdGarante },
                new Prestatario { Dni = 10000006, Nombre = "Lionel", Apellido = "Messi", Telefono = "1199999999", Domicilio = "Rosario 10", Correo = "lio@mail.com", EsActivo = true, IdGarante = g3?.IdGarante },
                new Prestatario { Dni = 10000007, Nombre = "Gabriela", Apellido = "Sabatini", Telefono = "1100000001", Domicilio = "Tenis Club", Correo = "gaby@mail.com", EsActivo = true, IdGarante = g1?.IdGarante },
                new Prestatario { Dni = 10000008, Nombre = "Ricardo", Apellido = "Darin", Telefono = "1100000002", Domicilio = "Palermo Hollywood", Correo = "ricardo@mail.com", EsActivo = true, IdGarante = g2?.IdGarante },
                new Prestatario { Dni = 10000009, Nombre = "Susana", Apellido = "Gimenez", Telefono = "1100000003", Domicilio = "Barrio Parque", Correo = "su@mail.com", EsActivo = true, IdGarante = g3?.IdGarante },
                new Prestatario { Dni = 10000010, Nombre = "Mirtha", Apellido = "Legrand", Telefono = "1100000004", Domicilio = "Av. Libertador", Correo = "mirtha@mail.com", EsActivo = true, IdGarante = g1?.IdGarante }
            };
            context.Prestatarios.AddRange(prestatarios);
            context.SaveChanges();

            // 8. Prestamos (Sample data logic)
            var p1 = context.Prestatarios.Local.FirstOrDefault(p => p.Dni == 10000001);
            var prestamista = context.Prestamistas.Local.FirstOrDefault(p => p.Usuario == "demo");

            if (p1 != null && prestamista != null)
            {
                var prestamo1 = new Prestamo
                {
                    DniPrestatario = p1.Dni,
                    IdPrestamista = prestamista.Id,
                    MontoOtorgado = 50000.00m,
                    TasaInteres = 10.00m,
                    CantidadCtas = 6,
                    FechaOtorgamiento = DateTime.Parse("2025-01-10"),
                    Fec1erVto = DateTime.Parse("2025-02-10"),
                    FechaFinEstimada = DateTime.Parse("2025-07-10"),
                    IdEstado = 2, // Finalizado
                    IdSistAmortizacion = 4, // Tasa Fija
                    SaldoRestante = 0.00m
                };
                context.Prestamos.Add(prestamo1);
                context.SaveChanges();

                // Cuotas for Prestamo 1
                var cuotasP1 = new Cuota[]
                {
                    new Cuota { IdPrestamo = prestamo1.IdPrestamo, NroCuota = 1, FecVto = DateTime.Parse("2025-02-10"), Monto = 10000, Interes = 1666, SaldoPendiente = 0, IdEstado = 2 },
                    new Cuota { IdPrestamo = prestamo1.IdPrestamo, NroCuota = 2, FecVto = DateTime.Parse("2025-03-10"), Monto = 10000, Interes = 1666, SaldoPendiente = 0, IdEstado = 2 },
                    new Cuota { IdPrestamo = prestamo1.IdPrestamo, NroCuota = 3, FecVto = DateTime.Parse("2025-04-10"), Monto = 10000, Interes = 1666, SaldoPendiente = 0, IdEstado = 2 },
                    new Cuota { IdPrestamo = prestamo1.IdPrestamo, NroCuota = 4, FecVto = DateTime.Parse("2025-05-10"), Monto = 10000, Interes = 1666, SaldoPendiente = 0, IdEstado = 2 },
                    new Cuota { IdPrestamo = prestamo1.IdPrestamo, NroCuota = 5, FecVto = DateTime.Parse("2025-06-10"), Monto = 10000, Interes = 1666, SaldoPendiente = 0, IdEstado = 2 },
                    new Cuota { IdPrestamo = prestamo1.IdPrestamo, NroCuota = 6, FecVto = DateTime.Parse("2025-07-10"), Monto = 10000, Interes = 1666, SaldoPendiente = 0, IdEstado = 2 }
                };
                context.Cuotas.AddRange(cuotasP1);
                context.SaveChanges();

                // Pagos for Cuotas P1
                var pagos = new List<Pago>();
                foreach(var c in cuotasP1)
                {
                    pagos.Add(new Pago { IdCuota = c.IdCuota, Monto = 10000, FecPago = c.FecVto.AddDays(-1), IdMedioPago = 2, Estado = "Aprobado", Observaciones = "Ok", Saldo = 0 });
                }
                context.Pagos.AddRange(pagos);
                context.SaveChanges();
            }

            // Prestamo 2
            var p2 = context.Prestatarios.Local.FirstOrDefault(p => p.Dni == 10000002);
            if (p2 != null && prestamista != null)
            {
                var prestamo2 = new Prestamo
                {
                    DniPrestatario = p2.Dni,
                    IdPrestamista = prestamista.Id,
                    MontoOtorgado = 100000.00m,
                    TasaInteres = 5.00m,
                    CantidadCtas = 12,
                    FechaOtorgamiento = DateTime.Parse("2025-10-01"),
                    Fec1erVto = DateTime.Parse("2025-11-01"),
                    FechaFinEstimada = DateTime.Parse("2026-10-01"),
                    IdEstado = 1, // Activo
                    IdSistAmortizacion = 1, // Frances
                    SaldoRestante = 66666.00m
                };
                context.Prestamos.Add(prestamo2);
                context.SaveChanges();
                
                // Add cuotas for Prestamo 2 (truncated for brevity, adding logic based on seed)
                 var cuotasP2 = new Cuota[]
                {
                    new Cuota { IdPrestamo = prestamo2.IdPrestamo, NroCuota = 1, FecVto = DateTime.Parse("2025-11-01"), Monto = 9000, Interes = 500, SaldoPendiente = 0, IdEstado = 2 },
                    new Cuota { IdPrestamo = prestamo2.IdPrestamo, NroCuota = 2, FecVto = DateTime.Parse("2025-12-01"), Monto = 9000, Interes = 480, SaldoPendiente = 0, IdEstado = 2 },
                    new Cuota { IdPrestamo = prestamo2.IdPrestamo, NroCuota = 3, FecVto = DateTime.Parse("2026-01-01"), Monto = 9000, Interes = 460, SaldoPendiente = 0, IdEstado = 2 },
                    new Cuota { IdPrestamo = prestamo2.IdPrestamo, NroCuota = 4, FecVto = DateTime.Parse("2026-02-01"), Monto = 9000, Interes = 440, SaldoPendiente = 9000, IdEstado = 3 },
                    new Cuota { IdPrestamo = prestamo2.IdPrestamo, NroCuota = 5, FecVto = DateTime.Parse("2026-03-01"), Monto = 9000, Interes = 420, SaldoPendiente = 9000, IdEstado = 1 },
                };
                context.Cuotas.AddRange(cuotasP2);
                context.SaveChanges();
            }
        }
    }
}
