using Microsoft.EntityFrameworkCore;
using TuCredito.Models;

namespace TuCredito.Data
{
    public static class DbInitializer
    {
        public static void Initialize(TuCreditoContext context)
        {
            context.Database.EnsureCreated();

            SeedLookups(context);
            SeedUsers(context);
            SeedGarantes(context);
            SeedPrestatarios(context);
            SeedPrestamos(context);
        }

        private static void SeedLookups(TuCreditoContext context)
        {
            if (!context.EstadosPrestamos.Any())
            {
                context.EstadosPrestamos.AddRange(
                    new EstadosPrestamo { IdEstado = 1, Descripcion = "Activo" },
                    new EstadosPrestamo { IdEstado = 2, Descripcion = "Finalizado" },
                    new EstadosPrestamo { IdEstado = 3, Descripcion = "Eliminado" },
                    new EstadosPrestamo { IdEstado = 4, Descripcion = "Archivado" }
                );
            }

            if (!context.EstadosCuotas.Any())
            {
                context.EstadosCuotas.AddRange(
                    new EstadosCuota { IdEstado = 1, Descripcion = "Pendiente" },
                    new EstadosCuota { IdEstado = 2, Descripcion = "Saldada" },
                    new EstadosCuota { IdEstado = 3, Descripcion = "Vencida" },
                    new EstadosCuota { IdEstado = 4, Descripcion = "Reprogramada" }
                );
            }

            if (!context.SistAmortizacions.Any())
            {
                context.SistAmortizacions.AddRange(
                    new SistAmortizacion { IdSistAmortizacion = 1, Descripcion = "Francés" },
                    new SistAmortizacion { IdSistAmortizacion = 2, Descripcion = "Alemán" },
                    new SistAmortizacion { IdSistAmortizacion = 3, Descripcion = "Americano" },
                    new SistAmortizacion { IdSistAmortizacion = 4, Descripcion = "Tasa Fija" }
                );
            }

            if (!context.MediosDePagos.Any())
            {
                context.MediosDePagos.AddRange(
                    new MediosDePago { IdMedioPago = 1, Descripcion = "Efectivo", Moneda = "ARS" },
                    new MediosDePago { IdMedioPago = 2, Descripcion = "Transferencia", Moneda = "ARS" },
                    new MediosDePago { IdMedioPago = 3, Descripcion = "Depósito", Moneda = "ARS" }
                );
            }
            context.SaveChanges();
        }

        private static void SeedUsers(TuCreditoContext context)
        {
            if (!context.Prestamistas.Any(p => p.Usuario == "demo"))
            {
                context.Prestamistas.Add(new Prestamista
                {
                    Usuario = "demo",
                    ContraseniaHash = "AQAAAAIAAYagAAAAEGFF3lpqazHBXTkRe0B04cMQ7LcTpdBLR8g52s/2y/LriCUC7sDYlhlu2DpM2/R05w==",
                    Nombre = "Usuario",
                    Apellido = "Demo",
                    Correo = "demo@tucredito.com",
                    EsActivo = true
                });
            }

            if (!context.Prestamistas.Any(p => p.Usuario == "admin"))
            {
                context.Prestamistas.Add(new Prestamista
                {
                    Usuario = "admin",
                    ContraseniaHash = "AQAAAAIAAYagAAAAEGFF3lpqazHBXTkRe0B04cMQ7LcTpdBLR8g52s/2y/LriCUC7sDYlhlu2DpM2/R05w==",
                    Nombre = "Admin",
                    Apellido = "General",
                    Correo = "admin@tucredito.com",
                    EsActivo = true
                });
            }
            context.SaveChanges();
        }

        private static void SeedGarantes(TuCreditoContext context)
        {
            if (!context.Garantes.Any())
            {
                context.Garantes.AddRange(
                    new Garante { Nombre = "Roberto", Apellido = "Sanchez", Telefono = "11111111", Domicilio = "Calle 1", Correo = "roberto@mail.com", EsActivo = true },
                    new Garante { Nombre = "Lucia", Apellido = "Mendez", Telefono = "22222222", Domicilio = "Calle 2", Correo = "lucia@mail.com", EsActivo = true },
                    new Garante { Nombre = "Carlos", Apellido = "Tevez", Telefono = "33333333", Domicilio = "Calle 3", Correo = "carlos@mail.com", EsActivo = true }
                );
                context.SaveChanges();
            }
        }

        private static void SeedPrestatarios(TuCreditoContext context)
        {
            if (!context.Prestatarios.Any())
            {
                var g1 = context.Garantes.FirstOrDefault(g => g.Nombre == "Roberto");
                var g2 = context.Garantes.FirstOrDefault(g => g.Nombre == "Lucia");
                var g3 = context.Garantes.FirstOrDefault(g => g.Nombre == "Carlos");

                context.Prestatarios.AddRange(
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
                );
                context.SaveChanges();
            }
        }

        private static void SeedPrestamos(TuCreditoContext context)
        {
            var prestamista = context.Prestamistas.FirstOrDefault(p => p.Usuario == "demo");
            if (prestamista == null) return;

            // Check if demo user has loans
            if (context.Prestamos.Any(p => p.IdPrestamista == prestamista.Id)) return;

            var p1 = context.Prestatarios.FirstOrDefault(p => p.Dni == 10000001);
            if (p1 != null)
            {
                var prestamo1 = new Prestamo
                {
                    DniPrestatario = p1.Dni,
                    IdPrestamista = prestamista.Id,
                    MontoOtorgado = 50000.00m,
                    TasaInteres = 10.00m,
                    CantidadCtas = 6,
                    FechaOtorgamiento = DateTime.Now.AddMonths(-7), // 7 meses atrás
                    Fec1erVto = DateTime.Now.AddMonths(-6),
                    FechaFinEstimada = DateTime.Now.AddMonths(-1),
                    IdEstado = 2, // Finalizado
                    IdSistAmortizacion = 4, // Tasa Fija
                    SaldoRestante = 0.00m
                };
                context.Prestamos.Add(prestamo1);
                context.SaveChanges();

                var cuotasP1 = new List<Cuota>();
                for (int i = 1; i <= 6; i++)
                {
                    cuotasP1.Add(new Cuota 
                    { 
                        IdPrestamo = prestamo1.IdPrestamo, 
                        NroCuota = i, 
                        FecVto = DateTime.Now.AddMonths(-7 + i), 
                        Monto = 10000, 
                        Interes = 1666, 
                        SaldoPendiente = 0, 
                        IdEstado = 2 // Saldada
                    });
                }
                context.Cuotas.AddRange(cuotasP1);
                context.SaveChanges();

                var pagos = new List<Pago>();
                foreach (var c in cuotasP1)
                {
                    pagos.Add(new Pago { IdCuota = c.IdCuota, Monto = 10000, FecPago = c.FecVto.AddDays(-2), IdMedioPago = 1, Estado = "Aprobado", Observaciones = "Pago en termino", Saldo = 0 });
                }
                context.Pagos.AddRange(pagos);
                context.SaveChanges();
            }

            var p2 = context.Prestatarios.FirstOrDefault(p => p.Dni == 10000002);
            if (p2 != null)
            {
                var prestamo2 = new Prestamo
                {
                    DniPrestatario = p2.Dni,
                    IdPrestamista = prestamista.Id,
                    MontoOtorgado = 120000.00m,
                    TasaInteres = 5.00m,
                    CantidadCtas = 12,
                    FechaOtorgamiento = DateTime.Now.AddMonths(-4),
                    Fec1erVto = DateTime.Now.AddMonths(-3),
                    FechaFinEstimada = DateTime.Now.AddMonths(8),
                    IdEstado = 1, // Activo
                    IdSistAmortizacion = 1, // Frances
                    SaldoRestante = 80000.00m
                };
                context.Prestamos.Add(prestamo2);
                context.SaveChanges();

                var cuotasP2 = new List<Cuota>();
                for (int i = 1; i <= 12; i++)
                {
                    bool pagada = i <= 4;
                    cuotasP2.Add(new Cuota 
                    { 
                        IdPrestamo = prestamo2.IdPrestamo, 
                        NroCuota = i, 
                        FecVto = DateTime.Now.AddMonths(-4 + i), 
                        Monto = 10000 + (12-i)*100, // Variación simulada sistema francés
                        Interes = 500, 
                        SaldoPendiente = pagada ? 0 : 10000 + (12-i)*100, 
                        IdEstado = pagada ? 2 : 1 // Saldada o Pendiente
                    });
                }
                context.Cuotas.AddRange(cuotasP2);
                context.SaveChanges();

                var pagos2 = new List<Pago>();
                foreach (var c in cuotasP2.Where(c => c.IdEstado == 2))
                {
                    pagos2.Add(new Pago { IdCuota = c.IdCuota, Monto = c.Monto, FecPago = c.FecVto.AddDays(-1), IdMedioPago = 2, Estado = "Aprobado", Observaciones = "Transferencia", Saldo = 0 });
                }
                context.Pagos.AddRange(pagos2);
                context.SaveChanges();
            }

            var p3 = context.Prestatarios.FirstOrDefault(p => p.Dni == 10000006);
            if (p3 != null)
            {
                var prestamo3 = new Prestamo
                {
                    DniPrestatario = p3.Dni,
                    IdPrestamista = prestamista.Id,
                    MontoOtorgado = 500000.00m,
                    TasaInteres = 15.00m,
                    CantidadCtas = 24,
                    FechaOtorgamiento = DateTime.Now.AddDays(-10),
                    Fec1erVto = DateTime.Now.AddDays(20),
                    FechaFinEstimada = DateTime.Now.AddMonths(24),
                    IdEstado = 1, // Activo
                    IdSistAmortizacion = 2, // Aleman
                    SaldoRestante = 500000.00m
                };
                context.Prestamos.Add(prestamo3);
                context.SaveChanges();

                var cuotasP3 = new List<Cuota>();
                for (int i = 1; i <= 24; i++)
                {
                    cuotasP3.Add(new Cuota 
                    { 
                        IdPrestamo = prestamo3.IdPrestamo, 
                        NroCuota = i, 
                        FecVto = DateTime.Now.AddDays(20).AddMonths(i-1), 
                        Monto = 25000, 
                        Interes = 2000, 
                        SaldoPendiente = 25000, 
                        IdEstado = 1 // Pendiente
                    });
                }
                context.Cuotas.AddRange(cuotasP3);
                context.SaveChanges();
            }

            var p4 = context.Prestatarios.FirstOrDefault(p => p.Dni == 10000005);
            if (p4 != null)
            {
                var prestamo4 = new Prestamo
                {
                    DniPrestatario = p4.Dni,
                    IdPrestamista = prestamista.Id,
                    MontoOtorgado = 200000.00m,
                    TasaInteres = 12.00m,
                    CantidadCtas = 10,
                    FechaOtorgamiento = DateTime.Now.AddMonths(-5),
                    Fec1erVto = DateTime.Now.AddMonths(-4),
                    FechaFinEstimada = DateTime.Now.AddMonths(5),
                    IdEstado = 1, // Activo pero con deuda
                    IdSistAmortizacion = 4, 
                    SaldoRestante = 120000.00m
                };
                context.Prestamos.Add(prestamo4);
                context.SaveChanges();

                var cuotasP4 = new List<Cuota>();
                for (int i = 1; i <= 10; i++)
                {
                    int estado = 1; // Pendiente
                    decimal saldo = 20000;
                    
                    if (i <= 3) { estado = 2; saldo = 0; } // Saldada
                    else if (i == 4) { estado = 3; saldo = 20000; } // Vencida

                    cuotasP4.Add(new Cuota 
                    { 
                        IdPrestamo = prestamo4.IdPrestamo, 
                        NroCuota = i, 
                        FecVto = DateTime.Now.AddMonths(-5 + i), 
                        Monto = 20000, 
                        Interes = 2400, 
                        SaldoPendiente = saldo, 
                        IdEstado = estado
                    });
                }
                context.Cuotas.AddRange(cuotasP4);
                context.SaveChanges();

                var pagos4 = new List<Pago>();
                foreach (var c in cuotasP4.Where(c => c.IdEstado == 2))
                {
                    pagos4.Add(new Pago { IdCuota = c.IdCuota, Monto = c.Monto, FecPago = c.FecVto, IdMedioPago = 3, Estado = "Aprobado", Observaciones = "Deposito", Saldo = 0 });
                }
                context.Pagos.AddRange(pagos4);
                context.SaveChanges();
            }
        }
    }
}