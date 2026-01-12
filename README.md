# 📌 Tu Crédito – Sistema de Gestión de Préstamos

**Tu Crédito** es una plataforma integral diseñada para la administración eficiente de créditos y prestatarios. Desarrollada con un enfoque profesional, implementa una arquitectura robusta y escalable que permite gestionar el ciclo de vida completo de un préstamo, desde la solicitud hasta la cancelación total.

Este proyecto destaca por su **backend sólido en .NET**, implementación de **seguridad con JWT**, **auditoría de datos** y **consumo de APIs externas** para enriquecer la experiencia del usuario.

🔗 **[Deploy del Frontend](https://tu-credito.vercel.app/)**

---

## 🎯 Contexto y Objetivo del Proyecto

Este proyecto nace de una **necesidad real de negocio**. Fue desarrollado a medida para un cliente del sector financiero, quien participó activamente en el proceso, definiendo los requerimientos funcionales y flujos de trabajo específicos.

El objetivo principal es proveer una herramienta personalizada que automatice su gestión diaria de créditos, reemplazando procesos manuales por un sistema **auditable, seguro y eficiente**.

### 🔄️ Estado Actual y Roadmap
El proyecto se encuentra en **desarrollo activo y continuo**, evolucionando iterativamente en base al feedback del cliente.

- **Backend**: ✅ Etapa avanzada. Arquitectura consolidada, lógica de negocio robusta e integraciones completadas.
- **Frontend**: 🔄 **Próximo paso**. Actualmente estamos enfocadas en el rediseño y modernización de la interfaz de usuario para mejorar la experiencia (UX/UI).

---

## Características Destacadas del Backend

El backend ha sido construido siguiendo las mejores prácticas de la industria, asegurando mantenibilidad, escalabilidad y seguridad.

### 🏗️ Arquitectura y Patrones de Diseño
- **Arquitectura en Capas (Clean Architecture)**: Separación clara de responsabilidades en Controladores, Servicios, Repositorios, DTOs y Modelos. Esto facilita el testing y el mantenimiento.
- **Patrón Repositorio**: Abstracción de la capa de acceso a datos, permitiendo cambiar la fuente de datos sin afectar la lógica de negocio.
- **Inyección de Dependencias (DI)**: Uso extensivo de DI para desacoplar componentes y mejorar la testabilidad.
- **DTOs (Data Transfer Objects)**: Uso de objetos específicos para la transferencia de datos entre el cliente y el servidor, evitando exponer las entidades de base de datos directamente.

### 🔐 Seguridad y Auditoría
- **Autenticación JWT (JSON Web Tokens)**: Implementación segura de autenticación mediante tokens Bearer, protegiendo los endpoints sensibles.
- **Hashing de Contraseñas**: Almacenamiento seguro de credenciales utilizando algoritmos de hash robustos.
- **Auditoría Avanzada (Audit Interceptor)**: Sistema automático de auditoría mediante **Entity Framework Core Interceptors**.
  - Registra automáticamente cambios (creación, modificación, eliminación) en entidades sensibles como `Prestamo`, `Pago`, `Prestatario` y `Garante`.
  - Guarda el historial detallado de valores anteriores y nuevos en formato JSON, junto con el usuario responsable y la fecha.

### 🌐 Integraciones y APIs Externas
- **Servicio BCRA (Banco Central)**: Integración para consultar la situación crediticia de los prestatarios en tiempo real, ayudando en la toma de decisiones de riesgo.
- **Cotización de Monedas**: Consumo de API externa para obtener la cotización del Dólar (Oficial, Blue, etc.) en tiempo real, permitiendo conversiones y visualización de datos en múltiples monedas.

### 🛠️ Funcionalidades Técnicas Adicionales
- **Paginación y Filtrado**: Endpoints optimizados con soporte para paginación y filtros dinámicos (por nombre, estado, fecha), mejorando el rendimiento en grandes volúmenes de datos.
- **Swagger / OpenAPI**: Documentación interactiva de la API generada automáticamente, facilitando la exploración y prueba de los endpoints durante el desarrollo.
- **Manejo de Errores**: Estructura consistente para el manejo de excepciones y respuestas HTTP.

---

## 💻 Funcionalidades Principales

### 🔹 Gestión de Créditos
- Alta, baja y modificación de préstamos.
- Consulta detallada de créditos activos y finalizados.
- Cálculo automático de estados y seguimiento de vencimientos.

### 🔹 Gestión de Prestatarios
- Registro completo de información personal y financiera.
- Historial crediticio y scoring interno.

### 🔹 Control de Pagos y Cuotas
- Generación de planes de cuotas con diferentes sistemas de amortización.
- Registro de pagos parciales o totales.
- Detección automática de mora y cálculo de intereses punitorios.

### 🔹 Dashboard y Métricas
- Visualización de KPIs financieros.
- Gráficos de evolución de cartera y morosidad.

---

## 🛠️ Stack Tecnológico

### Backend
- **Lenguaje**: C#
- **Framework**: .NET 8 Web API
- **ORM**: Entity Framework Core
- **Base de Datos**: SQL Server
- **Autenticación**: JWT Bearer
- **Mapeo**: AutoMapper

### Frontend
- **Framework**: Angular / Vanilla JS (según implementación actual)
- **Estilos**: CSS3, HTML5
- **Hosting**: Vercel

### Herramientas
- **Control de Versiones**: Git & GitHub
- **API Testing**: Postman / Swagger UI

---

## 👩‍💻 Equipo de Desarrollo

| Nombre | Rol | LinkedIn |
|--------|-----|----------|
| **Camila Martín** | Full Stack Developer | [Ver Perfil](https://www.linkedin.com/in/camilamartindev/) |
| **Aylen García Maestri** | Full Stack Developer | [Ver Perfil](https://www.linkedin.com/in/aylen-garcia-maestri/) |
