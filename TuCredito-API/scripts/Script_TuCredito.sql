CREATE DATABASE TuCredito;
GO

USE TuCredito;
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
    Dni VARCHAR(20),
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
    SaldoRestante DECIMAL(12,2) NOT NULL,
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
    SaldoPendiente DECIMAL(12,2),
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
    saldo DECIMAL(12,2) NOT NULL,
    Estado varchar(20) NOT NULL,
    Monto DECIMAL(12,2) NOT NULL,
    Descuento DECIMAL(12,2) NOT NULL DEFAULT 0,
    Recargo DECIMAL(12,2) NOT NULL DEFAULT 0,
    Observaciones VARCHAR(255),
    CONSTRAINT FK_Pagos_Cuota
        FOREIGN KEY (idCuota) REFERENCES Cuotas(idCuota),
    CONSTRAINT FK_Pagos_MedioPago
        FOREIGN KEY (idMedioPago) REFERENCES MediosDePago(idMedio_Pago)
);

-- Tabla para carga de docs (Agregada recientemente)
CREATE TABLE Documentos (
    IdDocumento INT IDENTITY PRIMARY KEY,
    EntidadTipo VARCHAR(50) NOT NULL,      -- 'Prestamo', 'Cliente'
    EntidadId INT NOT NULL,
    TipoDocumento VARCHAR(50) NOT NULL,    -- 'Pagare', 'ReciboSueldo'
    NombreOriginal VARCHAR(255) NOT NULL,
    RutaStorage VARCHAR(500) NOT NULL,
    ContentType VARCHAR(100) NOT NULL,
    FechaSubida DATETIME NOT NULL DEFAULT GETDATE(),
    SubidoPor INT NOT NULL,
    Activo BIT NOT NULL DEFAULT 1
);

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

-- Estados de cuotas
INSERT INTO Estados_Cuotas (descripcion) VALUES
('Pendiente'),
('Saldada'),
('Vencida'),
('Reprogramada');

-- Estados de préstamos
INSERT INTO Estados_Prestamos (descripcion) VALUES
('Activo'),
('Finalizado'),
('Eliminado');

-- Medios de pago
INSERT INTO MediosDePago (descripcion, moneda) VALUES
('Transferencia', 'ARS'),
('Efectivo', 'ARS'),
('Efectivo', 'USD'),
('Transferencia', 'USD');

-- Sistemas de amortización
INSERT INTO SistAmortizacion (descripcion) VALUES
('Personal'),
('Francés'),
('Alemán');
GO

-- Prestamista (FALTANTE)
INSERT INTO Prestamistas (nombre, apellido, esActivo, correo, usuario, contraseniaHash)
VALUES
('Juan', 'Pérez', 1, 'jperez@mail.com', 'admin', 'hash1234');

-- Garante
INSERT INTO Garantes (nombre, apellido, telefono, domicilio, correo, esActivo)
VALUES
('Laura', 'Martínez', '3519988776', 'San Martín 890', 'lmartinez@mail.com', 1);

-- Prestatario
INSERT INTO Prestatarios (
    DNI, nombre, apellido, telefono, domicilio, correo, esActivo, idGarante
)
VALUES
(28999888, 'Diego', 'Fernández', '3514455667', 'Bv. Illia 1200', 'dfernandez@mail.com', 1, 1);

-- Préstamo 1
INSERT INTO Prestamos (
    idPrestamista,
    DNI_Prestatario,
    MontoOtorgado,
    SaldoRestante,
    Cantidad_ctas,
    idEstado,
    tasaInteres,
    fechaFinEstimada,
    fechaOtorgamiento,
    Fec_1erVto,
    idSistAmortizacion
)
VALUES
(1, 28999888, 50000, 50000, 12, 1, 5, '2024-12-31', '2024-01-01', '2024-02-01', 2);
GO

-- Modificación para soportar multimoneda (Path A)
ALTER TABLE Prestamos ADD Moneda VARCHAR(3) NOT NULL DEFAULT 'ARS';
GO


-- Modificaciones para soportar Multimoneda (Path A)

-- 1. Agregar columna Moneda a la tabla Prestamos (si no existe)
IF NOT EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID(N'[dbo].[Prestamos]') AND name = 'Moneda')
BEGIN
    ALTER TABLE Prestamos ADD Moneda VARCHAR(3) NOT NULL DEFAULT 'ARS';
END
GO

-- 2. Agregar columna Cotizacion a la tabla Pagos (si no existe)
IF NOT EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID(N'[dbo].[Pagos]') AND name = 'Cotizacion')
BEGIN
    ALTER TABLE Pagos ADD Cotizacion DECIMAL(12,2) NOT NULL DEFAULT 1;
END
GO