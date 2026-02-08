USE TuCredito14;
GO

-- Actualizar Garantes
IF NOT EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID(N'[dbo].[Garantes]') AND name = 'Dni')
BEGIN
    ALTER TABLE Garantes ADD Dni VARCHAR(20) NULL;
END
GO

-- Actualizar Pagos
IF NOT EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID(N'[dbo].[Pagos]') AND name = 'Descuento')
BEGIN
    ALTER TABLE Pagos ADD Descuento DECIMAL(12,2) NOT NULL DEFAULT 0;
END

IF NOT EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID(N'[dbo].[Pagos]') AND name = 'Recargo')
BEGIN
    ALTER TABLE Pagos ADD Recargo DECIMAL(12,2) NOT NULL DEFAULT 0;
END
GO
