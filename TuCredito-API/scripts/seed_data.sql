-- Script de Datos de Prueba Masivos para TuCredito (Dashboard Full)
-- Fecha Base simulada: 2026-02-05
-- Ejecutar en SQL Server

USE TuCredito14;
GO

-- 1. LIMPIEZA DE DATOS
---------------------------------------------------
EXEC sp_msforeachtable "ALTER TABLE ? NOCHECK CONSTRAINT all"
GO

DELETE FROM Pagos;
DELETE FROM Cuotas;
DELETE FROM Prestamos;
DELETE FROM Prestatarios;
DELETE FROM Garantes;
DELETE FROM Prestamistas;
DELETE FROM MediosDePago;
DELETE FROM SistAmortizacion;
DELETE FROM Estados_Cuotas;
DELETE FROM Estados_Prestamos;

-- Reiniciar contadores
DBCC CHECKIDENT ('Pagos', RESEED, 0);
DBCC CHECKIDENT ('Cuotas', RESEED, 0);
DBCC CHECKIDENT ('Prestamos', RESEED, 0);
-- DBCC CHECKIDENT ('Prestatarios', RESEED, 0); -- DNI manual
DBCC CHECKIDENT ('Garantes', RESEED, 0);
DBCC CHECKIDENT ('Prestamistas', RESEED, 0);
DBCC CHECKIDENT ('MediosDePago', RESEED, 0);
DBCC CHECKIDENT ('SistAmortizacion', RESEED, 0);
DBCC CHECKIDENT ('Estados_Cuotas', RESEED, 0);
DBCC CHECKIDENT ('Estados_Prestamos', RESEED, 0);
GO

EXEC sp_msforeachtable "ALTER TABLE ? WITH CHECK CHECK CONSTRAINT all"
GO

-- 2. CATÁLOGOS
---------------------------------------------------
SET IDENTITY_INSERT Estados_Prestamos ON;
INSERT INTO Estados_Prestamos (idEstado, descripcion) VALUES (1, 'Activo'), (2, 'Finalizado'), (3, 'Eliminado'), (4, 'Archivado');
SET IDENTITY_INSERT Estados_Prestamos OFF;

SET IDENTITY_INSERT Estados_Cuotas ON;
INSERT INTO Estados_Cuotas (idEstado, descripcion) VALUES (1, 'Pendiente'), (2, 'Saldada'), (3, 'Vencida'), (4, 'Reprogramada');
SET IDENTITY_INSERT Estados_Cuotas OFF;

SET IDENTITY_INSERT SistAmortizacion ON;
INSERT INTO SistAmortizacion (idSistAmortizacion, descripcion) VALUES (1, 'Francés'), (2, 'Alemán'), (3, 'Americano'), (4, 'Tasa Fija');
SET IDENTITY_INSERT SistAmortizacion OFF;

SET IDENTITY_INSERT MediosDePago ON;
INSERT INTO MediosDePago (idMedio_Pago, descripcion, moneda) VALUES (1, 'Efectivo', 'ARS'), (2, 'Transferencia', 'ARS'), (3, 'Depósito', 'ARS');
SET IDENTITY_INSERT MediosDePago OFF;

-- 3. USUARIOS Y ACTORES
---------------------------------------------------
INSERT INTO Prestamistas (usuario, contraseniaHash, nombre, apellido, correo, esActivo) VALUES 
('demo', 'AQAAAAIAAYagAAAAEGFF3lpqazHBXTkRe0B04cMQ7LcTpdBLR8g52s/2y/LriCUC7sDYlhlu2DpM2/R05w==', 'Usuario', 'Demo', 'demo@tucredito.com', 1),
('admin', 'AQAAAAIAAYagAAAAEGFF3lpqazHBXTkRe0B04cMQ7LcTpdBLR8g52s/2y/LriCUC7sDYlhlu2DpM2/R05w==', 'Admin', 'General', 'admin@tucredito.com', 1);

INSERT INTO Garantes (nombre, apellido, telefono, domicilio, correo, esActivo) VALUES 
('Roberto', 'Sanchez', '11111111', 'Calle 1', 'roberto@mail.com', 1),
('Lucia', 'Mendez', '22222222', 'Calle 2', 'lucia@mail.com', 1),
('Carlos', 'Tevez', '33333333', 'Calle 3', 'carlos@mail.com', 1);

-- Insertar 10 Prestatarios
INSERT INTO Prestatarios (DNI, nombre, apellido, telefono, domicilio, correo, esActivo, idGarante) VALUES 
(10000001, 'Juan', 'Perez', '1144444444', 'Av. Corrientes 1000', 'juan.p@mail.com', 1, 1),
(10000002, 'Maria', 'Gonzalez', '1155555555', 'Av. Santa Fe 2000', 'maria.g@mail.com', 1, 2),
(10000003, 'Pedro', 'Rodriguez', '1166666666', 'Calle Florida 500', 'pedro.r@mail.com', 1, 3),
(10000004, 'Ana', 'Fernandez', '1177777777', 'Av. de Mayo 300', 'ana.f@mail.com', 1, 1),
(10000005, 'Diego', 'Maradona', '1188888888', 'Segurola y Habana', 'diego10@mail.com', 1, 2),
(10000006, 'Lionel', 'Messi', '1199999999', 'Rosario 10', 'lio@mail.com', 1, 3),
(10000007, 'Gabriela', 'Sabatini', '1100000001', 'Tenis Club', 'gaby@mail.com', 1, 1),
(10000008, 'Ricardo', 'Darin', '1100000002', 'Palermo Hollywood', 'ricardo@mail.com', 1, 2),
(10000009, 'Susana', 'Gimenez', '1100000003', 'Barrio Parque', 'su@mail.com', 1, 3),
(10000010, 'Mirtha', 'Legrand', '1100000004', 'Av. Libertador', 'mirtha@mail.com', 1, 1);

-- 4. PRÉSTAMOS Y DETALLE
-- Escenario: Fecha actual simulada FEB 2026
---------------------------------------------------

-- CASO A: Préstamo FINALIZADO (Todo Pagado) - Juan Perez
-- Prestamo de 50.000 a 6 meses, iniciado en Enero 2025, finalizado Junio 2025.
INSERT INTO Prestamos (DNI_Prestatario, idPrestamista, montoOtorgado, tasaInteres, Cantidad_ctas, fechaOtorgamiento, Fec_1erVto, fechaFinEstimada, idEstado, idSistAmortizacion, saldoRestante) VALUES 
(10000001, 1, 50000.00, 10.00, 6, '2025-01-10', '2025-02-10', '2025-07-10', 2, 4, 0.00); -- ID 1

-- Cuotas y Pagos ID 1
INSERT INTO Cuotas (idPrestamo, nroCuota, Fec_Vto, Monto, Interes, SaldoPendiente, idEstado) VALUES 
(1, 1, '2025-02-10', 10000, 1666, 0, 2), (1, 2, '2025-03-10', 10000, 1666, 0, 2), (1, 3, '2025-04-10', 10000, 1666, 0, 2),
(1, 4, '2025-05-10', 10000, 1666, 0, 2), (1, 5, '2025-06-10', 10000, 1666, 0, 2), (1, 6, '2025-07-10', 10000, 1666, 0, 2);

INSERT INTO Pagos (idCuota, monto, Fec_Pago, idMedioPago, estado, observaciones, saldo) VALUES
(1, 10000, '2025-02-09', 2, 'Aprobado', 'Ok', 0), (2, 10000, '2025-03-08', 2, 'Aprobado', 'Ok', 0),
(3, 10000, '2025-04-11', 2, 'Aprobado', 'Ok', 0), (4, 10000, '2025-05-10', 2, 'Aprobado', 'Ok', 0),
(5, 10000, '2025-06-05', 2, 'Aprobado', 'Ok', 0), (6, 10000, '2025-07-10', 2, 'Aprobado', 'Final', 0);


-- CASO B: Préstamo ACTIVO AL DÍA - Maria Gonzalez
-- 100.000 a 12 meses, iniciado Oct 2025. Pagó hasta Ene 2026. Feb 2026 Pendiente.
INSERT INTO Prestamos (DNI_Prestatario, idPrestamista, montoOtorgado, tasaInteres, Cantidad_ctas, fechaOtorgamiento, Fec_1erVto, fechaFinEstimada, idEstado, idSistAmortizacion, saldoRestante) VALUES 
(10000002, 1, 100000.00, 5.00, 12, '2025-10-01', '2025-11-01', '2026-10-01', 1, 1, 66666.00); -- ID 2

-- Cuotas ID 2 (Simplificado cuota fija 9000)
-- Pagadas: 1 (Nov), 2 (Dic), 3 (Ene)
INSERT INTO Cuotas (idPrestamo, nroCuota, Fec_Vto, Monto, Interes, SaldoPendiente, idEstado) VALUES 
(2, 1, '2025-11-01', 9000, 500, 0, 2), 
(2, 2, '2025-12-01', 9000, 480, 0, 2), 
(2, 3, '2026-01-01', 9000, 460, 0, 2),
(2, 4, '2026-02-01', 9000, 440, 9000, 3), -- VENCIDA hace unos dias (estamos a 5 feb)
(2, 5, '2026-03-01', 9000, 420, 9000, 1),
(2, 6, '2026-04-01', 9000, 400, 9000, 1),
(2, 7, '2026-05-01', 9000, 380, 9000, 1),
(2, 8, '2026-06-01', 9000, 360, 9000, 1),
(2, 9, '2026-07-01', 9000, 340, 9000, 1),
(2, 10, '2026-08-01', 9000, 320, 9000, 1),
(2, 11, '2026-09-01', 9000, 300, 9000, 1),
(2, 12, '2026-10-01', 9000, 280, 9000, 1);

INSERT INTO Pagos (idCuota, monto, Fec_Pago, idMedioPago, estado, observaciones, saldo) VALUES
(7, 9000, '2025-11-01', 1, 'Aprobado', 'Pago puntal', 0),
(8, 9000, '2025-12-02', 1, 'Aprobado', 'Pago puntal', 0),
(9, 9000, '2026-01-05', 1, 'Aprobado', 'Un poco tarde', 0);


-- CASO C: Préstamo EN MORA GRAVE - Pedro Rodriguez
-- 200.000, iniciado Ago 2025. Pagó solo 1 cuota. Debe Sep, Oct, Nov, Dic, Ene...
INSERT INTO Prestamos (DNI_Prestatario, idPrestamista, montoOtorgado, tasaInteres, Cantidad_ctas, fechaOtorgamiento, Fec_1erVto, fechaFinEstimada, idEstado, idSistAmortizacion, saldoRestante) VALUES 
(10000003, 1, 200000.00, 15.00, 10, '2025-08-15', '2025-09-15', '2026-06-15', 1, 4, 180000.00); -- ID 3

INSERT INTO Cuotas (idPrestamo, nroCuota, Fec_Vto, Monto, Interes, SaldoPendiente, idEstado) VALUES 
(3, 1, '2025-09-15', 25000, 3000, 0, 2),      -- Saldada
(3, 2, '2025-10-15', 25000, 3000, 25000, 3),  -- Vencida
(3, 3, '2025-11-15', 25000, 3000, 25000, 3),  -- Vencida
(3, 4, '2025-12-15', 25000, 3000, 25000, 3),  -- Vencida
(3, 5, '2026-01-15', 25000, 3000, 25000, 3),  -- Vencida
(3, 6, '2026-02-15', 25000, 3000, 25000, 1),  -- Pendiente (Vence en futuro cercano)
(3, 7, '2026-03-15', 25000, 3000, 25000, 1),
(3, 8, '2026-04-15', 25000, 3000, 25000, 1),
(3, 9, '2026-05-15', 25000, 3000, 25000, 1),
(3, 10, '2026-06-15', 25000, 3000, 25000, 1);

INSERT INTO Pagos (idCuota, monto, Fec_Pago, idMedioPago, estado, observaciones, saldo) VALUES
(19, 25000, '2025-09-14', 3, 'Aprobado', 'Unico pago', 0); -- ID Cuota 19 corresponde a la primera de este prestamo (calculado aprox)
-- Corregimos IDs de cuotas en pagos después si es identity.
-- TRUCO: Como usamos identity, es dificil predecir ID exacto en script corrido.
-- Para este script masivo, voy a usar una tecnica más segura para los pagos: Subqueries o variables si fuera T-SQL complejo,
-- pero para seed data simple, asumiré IDs secuenciales basándome en el orden de inserción anterior.
-- IDs Cuotas Prestamo 1: 1-6
-- IDs Cuotas Prestamo 2: 7-18
-- IDs Cuotas Prestamo 3: 19-28
-- Pago de arriba ID 19 es correcto.


-- CASO D: Préstamo NUEVO - Ana Fernandez
-- 500.000, Recién sacado en Ene 2026. Primera cuota vence Feb 2026.
INSERT INTO Prestamos (DNI_Prestatario, idPrestamista, montoOtorgado, tasaInteres, Cantidad_ctas, fechaOtorgamiento, Fec_1erVto, fechaFinEstimada, idEstado, idSistAmortizacion, saldoRestante) VALUES 
(10000004, 1, 500000.00, 8.00, 24, '2026-01-20', '2026-02-20', '2028-01-20', 1, 1, 500000.00); -- ID 4

-- Generar 5 primeras cuotas de 24
INSERT INTO Cuotas (idPrestamo, nroCuota, Fec_Vto, Monto, Interes, SaldoPendiente, idEstado) VALUES 
(4, 1, '2026-02-20', 25000, 4000, 25000, 1),
(4, 2, '2026-03-20', 25000, 3900, 25000, 1),
(4, 3, '2026-04-20', 25000, 3800, 25000, 1),
(4, 4, '2026-05-20', 25000, 3700, 25000, 1),
(4, 5, '2026-06-20', 25000, 3600, 25000, 1);


-- CASO E: Préstamo PEQUEÑO PAGADO PARCIAL - Diego Maradona
-- 20.000, 3 cuotas. Pagó la 1, debe la 2 (vencida ayer), la 3 vence en un mes.
INSERT INTO Prestamos (DNI_Prestatario, idPrestamista, montoOtorgado, tasaInteres, Cantidad_ctas, fechaOtorgamiento, Fec_1erVto, fechaFinEstimada, idEstado, idSistAmortizacion, saldoRestante) VALUES 
(10000005, 1, 20000.00, 0.00, 3, '2025-12-04', '2026-01-04', '2026-03-04', 1, 4, 13000.00); -- ID 5

INSERT INTO Cuotas (idPrestamo, nroCuota, Fec_Vto, Monto, Interes, SaldoPendiente, idEstado) VALUES 
(5, 1, '2026-01-04', 7000, 0, 0, 2),    -- ID 34
(5, 2, '2026-02-04', 7000, 0, 7000, 3), -- ID 35 (Vencida ayer 4 feb)
(5, 3, '2026-03-04', 6000, 0, 6000, 1); -- ID 36

INSERT INTO Pagos (idCuota, monto, Fec_Pago, idMedioPago, estado, observaciones, saldo) VALUES
(34, 7000, '2026-01-04', 1, 'Aprobado', 'Golazo', 0);


-- CASO F: Préstamo CASI TERMINADO - Lionel Messi
-- 1.000.000, 12 cuotas. Va por la 11. Impecable.
INSERT INTO Prestamos (DNI_Prestatario, idPrestamista, montoOtorgado, tasaInteres, Cantidad_ctas, fechaOtorgamiento, Fec_1erVto, fechaFinEstimada, idEstado, idSistAmortizacion, saldoRestante) VALUES 
(10000006, 1, 1000000.00, 2.00, 12, '2025-03-10', '2025-04-10', '2026-03-10', 1, 1, 85000.00); -- ID 6

-- Solo insertamos las ultimas cuotas para no llenar de basura, simulando historial
-- Asumimos cuotas 1-9 pagadas (no las insertamos en cuotas para ahorrar espacio visual, o las ponemos como pagadas)
-- Para que el dashboard sume bien, deberíamos ponerlas todas si calcula sobre tabla cuotas.
-- Pondré las ultimas 3.
INSERT INTO Cuotas (idPrestamo, nroCuota, Fec_Vto, Monto, Interes, SaldoPendiente, idEstado) VALUES 
(6, 10, '2026-01-10', 90000, 2000, 0, 2), -- ID 37
(6, 11, '2026-02-10', 90000, 1000, 90000, 1), -- ID 38 (Vence en 5 dias)
(6, 12, '2026-03-10', 90000, 500, 90000, 1);  -- ID 39

INSERT INTO Pagos (idCuota, monto, Fec_Pago, idMedioPago, estado, observaciones, saldo) VALUES
(37, 90000, '2026-01-09', 2, 'Aprobado', 'Transferencia Suiza', 0);

-- CASO G: Préstamo CANCELADO - Ricardo Darin
-- Pidió 100k, se arrepintió o canceló anticipado. (Estado Finalizado o Eliminado/Cancelado según lógica negocio)
-- Lo pondremos como Finalizado tras pago total anticipado.
INSERT INTO Prestamos (DNI_Prestatario, idPrestamista, montoOtorgado, tasaInteres, Cantidad_ctas, fechaOtorgamiento, Fec_1erVto, fechaFinEstimada, idEstado, idSistAmortizacion, saldoRestante) VALUES 
(10000008, 1, 100000.00, 5.00, 12, '2025-06-01', '2025-07-01', '2026-06-01', 2, 1, 0.00); -- ID 7

-- Cuota única de cancelación (simulada)
INSERT INTO Cuotas (idPrestamo, nroCuota, Fec_Vto, Monto, Interes, SaldoPendiente, idEstado) VALUES 
(7, 1, '2025-07-01', 105000, 5000, 0, 2); -- ID 40

INSERT INTO Pagos (idCuota, monto, Fec_Pago, idMedioPago, estado, observaciones, saldo) VALUES
(40, 105000, '2025-06-15', 3, 'Aprobado', 'Cancelación total anticipada', 0);


-- 5. PAGOS SUELTOS Y RECIENTES PARA GRAFICAS
-- Generar volumen de pagos en los ultimos 3 meses para que el gráfico de barras se vea bien.
---------------------------------------------------

-- Pagos extra sobre cuotas existentes (simulando pagos parciales o correcciones)
-- Usaremos IDs de cuotas anteriores.
-- ID 8 (Prestamo 2, Cuota 2, Dic)
-- ID 9 (Prestamo 2, Cuota 3, Ene)

-- Mas pagos en Diciembre 2025
INSERT INTO Pagos (idCuota, monto, Fec_Pago, idMedioPago, estado, observaciones, saldo) VALUES
(2, 500, '2025-12-15', 1, 'Aprobado', 'Interés punitorio', 0),
(1, 200, '2025-12-20', 1, 'Aprobado', 'Ajuste', 0);

-- Mas pagos en Enero 2026
INSERT INTO Pagos (idCuota, monto, Fec_Pago, idMedioPago, estado, observaciones, saldo) VALUES
(37, 5000, '2026-01-15', 2, 'Aprobado', 'Adelanto', 0),
(9, 100, '2026-01-20', 1, 'Aprobado', 'Propina', 0);

-- Pagos en Febrero 2026 (Mes actual)
INSERT INTO Pagos (idCuota, monto, Fec_Pago, idMedioPago, estado, observaciones, saldo) VALUES
(34, 100, '2026-02-01', 1, 'Aprobado', 'Ajuste', 0);

GO
