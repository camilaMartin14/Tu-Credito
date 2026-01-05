CREATE DATABASE TuCredito6;
GO

USE TuCredito6;
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
    Monto DECIMAL(12,2) NOT NULL,
    Observaciones VARCHAR(255),
    CONSTRAINT FK_Pagos_Cuota
        FOREIGN KEY (idCuota) REFERENCES Cuotas(idCuota),
    CONSTRAINT FK_Pagos_MedioPago
        FOREIGN KEY (idMedioPago) REFERENCES MediosDePago(idMedio_Pago)
);


INSERT INTO Estados_Cuotas (descripcion) VALUES
('Pendiente'),
('Al día'),
('Saldada');

INSERT INTO Estados_Prestamos (descripcion) VALUES
('Activo'),
('Finalizado');

INSERT INTO MediosDePago (descripcion, moneda) VALUES
('Transferencia', 'ARS'),
('Efectivo', 'ARS'),
('Efectivo', 'USD');

