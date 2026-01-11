CREATE DATABASE TuCredito9;
GO

USE TuCredito9;
GO

CREATE TABLE Estados_Prestamos (
    idEstado INT IDENTITY(1,1) PRIMARY KEY,
    descripcion VARCHAR(50) NOT NULL
);

CREATE TABLE Estados_Cuotas (
    idEstado INT IDENTITY(1,1) PRIMARY KEY,
    descripcion VARCHAR(50) NOT NULL
);

CREATE TABLE MediosDePago (
    idMedio_Pago INT IDENTITY(1,1) PRIMARY KEY,
    descripcion VARCHAR(50) NOT NULL,
    moneda VARCHAR(10) NOT NULL
);

CREATE TABLE SistAmortizacion (
    idSistAmortizacion INT IDENTITY(1,1) PRIMARY KEY,
    descripcion VARCHAR(50) NOT NULL
);


CREATE TABLE Prestamistas (
    id INT IDENTITY(1,1) PRIMARY KEY,
    nombre VARCHAR(50) NOT NULL,
    apellido VARCHAR(50) NOT NULL,
    esActivo BIT NOT NULL,
    correo VARCHAR(100),
    usuario VARCHAR(50) NOT NULL,
    contraseniaHash VARCHAR(255) NOT NULL
);

CREATE TABLE Garantes (
    idGarante INT IDENTITY(1,1) PRIMARY KEY,
    nombre VARCHAR(50) NOT NULL,
    apellido VARCHAR(50) NOT NULL,
    telefono VARCHAR(20),
    domicilio VARCHAR(100),
    correo VARCHAR(100),
    esActivo BIT NOT NULL
);

CREATE TABLE Prestatarios (
    DNI INT PRIMARY KEY,
    nombre VARCHAR(50) NOT NULL,
    apellido VARCHAR(50) NOT NULL,
    telefono VARCHAR(20),
    domicilio VARCHAR(100),
    correo VARCHAR(100),
    esActivo BIT NOT NULL,
    idGarante INT NULL,
    CONSTRAINT FK_Prestatario_Garante
        FOREIGN KEY (idGarante) REFERENCES Garantes(idGarante)
);


CREATE TABLE Prestamos (
    idPrestamo INT IDENTITY(1,1) PRIMARY KEY,
    idPrestamista INT NOT NULL,
    DNI_Prestatario INT NOT NULL,
    MontoOtorgado DECIMAL(12,2) NOT NULL,
    Cantidad_ctas INT NOT NULL,
    idEstado INT NOT NULL,
    tasaInteres DECIMAL(5,2) NOT NULL,
    fechaFinEstimada DATE,
    fechaOtorgamiento DATE NOT NULL,
    Fec_1erVto DATE NOT NULL,
    idSistAmortizacion INT NOT NULL,
    CONSTRAINT FK_Prestamos_Prestamista
        FOREIGN KEY (idPrestamista) REFERENCES Prestamistas(id),
    CONSTRAINT FK_Prestamos_Prestatario
        FOREIGN KEY (DNI_Prestatario) REFERENCES Prestatarios(DNI),
    CONSTRAINT FK_Prestamos_Estado
        FOREIGN KEY (idEstado) REFERENCES Estados_Prestamos(idEstado),
    CONSTRAINT FK_Prestamos_SistAmort
        FOREIGN KEY (idSistAmortizacion) REFERENCES SistAmortizacion(idSistAmortizacion)
);



CREATE TABLE Cuotas (
    idCuota INT IDENTITY(1,1) PRIMARY KEY,
    idPrestamo INT NOT NULL,
    nroCuota INT NOT NULL,
    Monto DECIMAL(12,2) NOT NULL,
    Fec_Vto DATE NOT NULL,
    idEstado INT NOT NULL,
    Interes DECIMAL(12,2),
    CONSTRAINT FK_Cuotas_Prestamo
        FOREIGN KEY (idPrestamo) REFERENCES Prestamos(idPrestamo),
    CONSTRAINT FK_Cuotas_Estado
        FOREIGN KEY (idEstado) REFERENCES Estados_Cuotas(idEstado)
);



CREATE TABLE Pagos (
    idPago INT IDENTITY(1,1) PRIMARY KEY,
    idCuota INT NOT NULL,
    Fec_Pago DATE NOT NULL,
    idMedioPago INT NOT NULL,
    saldo decimal NOT NULL,
    Estado varchar(20) NOT NULL,
    Monto DECIMAL(12,2) NOT NULL,
    Observaciones VARCHAR(255),
    CONSTRAINT FK_Pagos_Cuota
        FOREIGN KEY (idCuota) REFERENCES Cuotas(idCuota),
    CONSTRAINT FK_Pagos_MedioPago
        FOREIGN KEY (idMedioPago) REFERENCES MediosDePago(idMedio_Pago)
);


INSERT INTO Estados_Cuotas (descripcion) VALUES
('Pendiente'),
('Saldada');

INSERT INTO Estados_Prestamos (descripcion) VALUES
('Activo'),
('Finalizado');

INSERT INTO MediosDePago (descripcion, moneda) VALUES
('Transferencia', 'ARS'),
('Efectivo', 'ARS'),
('Efectivo', 'USD');
go

-- nvos inserts

insert into estados_cuotas (descripcion)
values ('Vencida'), ('Reprogramada')


select * from Estados_Prestamos 


insert into Estados_Prestamos (descripcion)
values ('Eliminado')


---------------------------- Datos de prueba --------------------------
---- Cliente responsable
--INSERT INTO SistAmortizacion (descripcion)
--VALUES ('Personal'),('Franc�s'), ('Alem�n');

--INSERT INTO Prestamistas (nombre, apellido, esActivo, correo, usuario, contraseniaHash)
--VALUES ('Juan', 'P�rez', 1, 'juan.perez@mail.com', 'jperez', 'HASH_FAKE_123');

--INSERT INTO Garantes (nombre, apellido, telefono, domicilio, correo, esActivo)
--VALUES ('Carlos', 'G�mez', '3511234567', 'Av. Siempre Viva 123', 'cgomez@mail.com', 1);

--INSERT INTO Prestatarios (DNI, nombre, apellido, telefono, domicilio, correo, esActivo, idGarante)
--VALUES (30123456, 'Mar�a', 'L�pez', '3517654321', 'C�rdoba 456', 'mlopez@mail.com', 1, 1);

---- prest finalizado

--INSERT INTO Prestamos (
--    idPrestamista,
--    DNI_Prestatario,
--    MontoOtorgado,
--    Cantidad_ctas,
--    idEstado,
--    tasaInteres,
--    fechaFinEstimada,
--    fechaOtorgamiento,
--    Fec_1erVto,
--    idSistAmortizacion
--)
--VALUES (
--    1,                  -- prestamista
--    30123456,            -- prestatario
--    100000.00,           -- monto
--    3,                   -- cuotas
--    2,                   -- Finalizado
--    20.00,               -- inter�s
--    '2024-06-10',
--    '2024-03-10',
--    '2024-04-10',
--    1                    -- Personal
--);

--INSERT INTO Cuotas (idPrestamo, nroCuota, Monto, Fec_Vto, idEstado, Interes)
--VALUES
--(1, 1, 40000.00, '2024-04-10', 3, 5000.00),
--(1, 2, 35000.00, '2024-05-10', 3, 4000.00),
--(1, 3, 30000.00, '2024-06-10', 3, 3000.00);

--INSERT INTO Pagos (idCuota, Fec_Pago, idMedioPago, Monto, Observaciones)
--VALUES
--(1, '2024-04-09', 1, 40000.00, 'Pago anticipado'),
--(2, '2024-05-10', 2, 35000.00, 'Pago en efectivo'),
--(3, '2024-06-10', 1, 30000.00, 'Pago final del pr�stamo');

---- Cliente irresponsable
--INSERT INTO Garantes (nombre, apellido, telefono, domicilio, correo, esActivo)
--VALUES ('Laura', 'Mart�nez', '3519988776', 'San Mart�n 890', 'lmartinez@mail.com', 1);

--INSERT INTO Prestatarios (DNI, nombre, apellido, telefono, domicilio, correo, esActivo, idGarante)
--VALUES (28999888, 'Diego', 'Fern�ndez', '3514455667', 'Bv. Illia 1200', 'dfernandez@mail.com', 1, 2);

--INSERT INTO Prestamos (
--    idPrestamista,
--    DNI_Prestatario,
--    MontoOtorgado,
--    Cantidad_ctas,
--    idEstado,
--    tasaInteres,
--    fechaFinEstimada,
--    fechaOtorgamiento,
--    Fec_1erVto,
--    idSistAmortizacion
--)
--VALUES (
--    1,                -- prestamista
--    28999888,         -- prestatario
--    150000.00,
--    3,
--    1,                -- Activo
--    25.00,
--    '2024-08-15',
--    '2024-05-15',
--    '2024-06-15',
--    1                 -- Personal
--);

---- Prestamo activo

--INSERT INTO Prestamos (
--    idPrestamista,
--    DNI_Prestatario,
--    MontoOtorgado,
--    Cantidad_ctas,
--    idEstado,
--    tasaInteres,
--    fechaFinEstimada,
--    fechaOtorgamiento,
--    Fec_1erVto,
--    idSistAmortizacion
--)
--VALUES (
--    1,                -- prestamista
--    28999888,         -- prestatario
--    150000.00,
--    3,
--    1,                -- Activo
--    25.00,
--    '2024-08-15',
--    '2024-05-15',
--    '2024-06-15',
--    1                 -- Personal
--);

--INSERT INTO Cuotas (idPrestamo, nroCuota, Monto, Fec_Vto, idEstado, Interes)
--VALUES
---- cuota pagada
--(2, 1, 55000.00, '2024-06-15', 3, 7000.00),

---- cuota vencida (morosa)
--(2, 2, 50000.00, '2024-07-15', 4, 6000.00),

---- cuota a�n no vencida
--(2, 3, 45000.00, '2024-08-15', 1, 5000.00);

--INSERT INTO Pagos (idCuota, Fec_Pago, idMedioPago, Monto, Observaciones)
--VALUES
--(4, '2024-06-14', 1, 55000.00, 'Pago en termino');

-- Tabla de auditoría (Agregada recientemente)
CREATE TABLE AuditLogs (
    Id INT IDENTITY(1,1) PRIMARY KEY,
    EntityName NVARCHAR(100) NOT NULL,
    Action NVARCHAR(20) NOT NULL,
    Timestamp DATETIME2 NOT NULL DEFAULT GETDATE(),
    UserId NVARCHAR(100),
    Changes NVARCHAR(MAX),
    EntityId NVARCHAR(100)
);
GO
