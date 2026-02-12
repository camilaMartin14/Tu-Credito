# Tu Crédito - Sistema de Gestión de Préstamos

![.NET](https://img.shields.io/badge/.NET-10.0-512BD4?style=for-the-badge&logo=.net&logoColor=white)
![React](https://img.shields.io/badge/React-18-61DAFB?style=for-the-badge&logo=react&logoColor=black)
![TypeScript](https://img.shields.io/badge/TypeScript-5.0-3178C6?style=for-the-badge&logo=typescript&logoColor=white)
![SQL Server](https://img.shields.io/badge/SQL%20Server-CC2927?style=for-the-badge&logo=microsoft-sql-server&logoColor=white)
![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white)

> **Transforma la gestión de préstamos con una plataforma moderna, segura y escalable.**


### 📊 Dashboard Ejecutivo en Tiempo Real
Visualiza la salud de tu cartera en un solo vistazo.
- **KPIs Financieros:** Capital prestado, interés ganado, tasa de morosidad y proyecciones de cobro.
- **Gráficos Interactivos:** Evolución de préstamos y análisis de tendencias.
- **Alertas:** Notificaciones automáticas de cuotas vencidas y pagos pendientes.

### 🤝 Gestión 360° de Prestatarios
Conoce a tus clientes a fondo para minimizar riesgos.
- **Perfil Digital Completo:** Datos personales, historial de contacto y score interno.
- **Evaluación Crediticia (BCRA):** Integración directa para consultar antecedentes financieros y situación crediticia en tiempo real.
- **Digitalización de Legajos:** Carga y gestión segura de documentos (DNI, recibos, garantías) con soporte para PDF e imágenes, respaldado por **MinIO**.

### 💰 Motor de Préstamos Flexible
Adapta la financiación a las necesidades del negocio.
- **Simulador de Créditos:** Cálculo instantáneo de planes de pago (Sistema Francés, Alemán, Americano).
- **Multi-Moneda:** Integración con APIs de cotización (Dólar Oficial/Blue) para operaciones en moneda extranjera.
- **Control de Cobranzas:** Registro de pagos parciales/totales, refinanciación y cálculo automático de punitorios.

### 🛡️ Seguridad y Auditoría Bancaria
Protege tu información crítica con estándares empresariales.
- **Trazabilidad Total:** Cada operación queda registrada en un log de auditoría inmutable (Quién, Qué, Cuándo).
- **Acceso Seguro:** Autenticación robusta vía **JWT** y hashing de contraseñas.
- **Arquitectura Clean:** Backend desacoplado y testearle basado en principios SOLID.

---

## ➡️ [Prueba la aplicación](https://tu-credito.vercel.app/) 


🪪 usuario: demo
🔐 contraseña: demo

---
## 🛠️ Stack Tecnológico

### Backend 
- **Framework:** .NET 10 (Web API)
- **ORM:** Entity Framework Core (Code First)
- **Base de Datos:** SQL Server
- **Almacenamiento:** MinIO (S3 Compatible) para gestión documental
- **Arquitectura:** Clean Architecture + CQRS pattern inspiration + Repository Pattern

### Frontend 
- **Framework:** React 18 + Vite
- **Lenguaje:** TypeScript
- **Estilos:** Tailwind CSS (Diseño responsivo y moderno)
- **UI Components:** Shadcn/UI (inspiración), Lucide Icons
- **Estado:** React Hooks & Context API

---

## 🚀 Despliegue

### Prerrequisitos
- [.NET 10 SDK](https://dotnet.microsoft.com/download)
- [Node.js](https://nodejs.org/) (v18+)
- [SQL Server](https://www.microsoft.com/sql-server/)
- [MinIO](https://min.io/) (Opcional, si se usa almacenamiento local)

### 1️⃣ Configuración del Backend

```bash
# Clonar el repositorio
git clone https://github.com/tu-usuario/tu-credito.git

# Navegar al backend
cd Tu-Credito/TuCredito-API

# Restaurar dependencias
dotnet restore

# Configurar conexión a BD en appsettings.json
# Actualizar "DefaultConnection" con tu cadena de conexión local

# Aplicar migraciones (o ejecutar scripts SQL provistos)
dotnet ef database update

# Iniciar el servidor
dotnet run
```

### 2️⃣ Configuración del Frontend

```bash
# Navegar al frontend (en nueva terminal)
cd Tu-Credito/tu-credito-front

# Instalar dependencias
npm install

# Iniciar servidor de desarrollo
npm run dev
```

¡Listo! Accede a la aplicación en `http://localhost:5173`.

---

## 📂 Estructura del Proyecto

```
Tu-Credito/
├── TuCredito-API/          # 🧠 Backend (.NET 10)
│   ├── Controllers/        # API Endpoints
│   ├── Core/               # Lógica compartida (Result pattern)
│   ├── Services/           # Reglas de Negocio
│   ├── Models/             # Entidades de Dominio (EF Core)
│   ├── DTOs/               # Objetos de Transferencia de Datos
│   ├── Security/           # Autenticación y JWT
│   └── Storage/            # Gestión de archivos (MinIO/Local)
│
├── tu-credito-front/       # 🖍️ Frontend (React)
│   ├── src/
│   │   ├── components/     # Componentes UI Reutilizables
│   │   ├── pages/          # Vistas Principales
│   │   ├── services/       # Comunicación con API (Axios)
│   │   ├── hooks/          # Custom Hooks
│   │   ├── context/        # Estado Global (Auth, Toast)
│   │   └── types/          # Definiciones TypeScript
│
└── *.sql                   # Scripts de BD 
```

## 👩‍💻 Equipo de Desarrollo

| Nombre | Rol | LinkedIn |
|--------|-----|----------|
| **Camila Martín** | Full Stack Developer | [Ver Perfil](https://www.linkedin.com/in/camilamartindev/) |
| **Aylen García Maestri** | Full Stack Developer | [Ver Perfil](https://www.linkedin.com/in/aylen-garcia-maestri/) |
