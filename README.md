# 🚀 GELI - Gestor de Equipos de Laboratorio Institucional

**GELI** es un sistema integral de gestión para equipos de laboratorio universitario. Facilita el registro, seguimiento, asignación y reporte del uso de equipos, incluyendo módulos de control de sesiones, usuarios, laboratorios y funciones.

---

## 📌 Características Principales

- ✅ Gestión de Sesiones: Registro de uso, historial personal y trazabilidad completa.
- 🧑‍🔧 Administración de Usuarios: Control por roles (`QUALITY-ADMIN-USER` / `AUTHORIZED-USER`).
- 🧪 Gestión de Equipos: Registro, permisos de uso y trazabilidad detallada.
- 🏫 Gestión de Laboratorios: Alta y edición de laboratorios con ubicación, estado y observaciones.
- 📊 Sistema de Reportes: Filtros avanzados, gráficas dinámicas y exportación a PDF, Excel y CSV.
- 🧩 Arquitectura Modular: Implementado en Angular con componentes standalone y SCSS personalizado.

---

## 🧱 Estructura del Proyecto

```plaintext
src/
├── app/
│   ├── features/
│   │   ├── auth/          # Login, cambio y recuperación de contraseña
│   │   ├── dashboard/     # Navegación principal por rol
│   │   ├── reports/       # Reportes exportables con gráficas
│   │   └── session/       # Registro y seguimiento de uso
│   ├── core/              # Servicios, modelos, guards, interceptors
│   └── shared/            # Componentes y directivas reutilizables
└── styles.scss            # Estilos globales del sistema

## 👥 Roles de Usuario

| Rol                | Descripción                                                                 |
|--------------------|------------------------------------------------------------------------------|
| QUALITY-ADMIN-USER | Acceso total: usuarios, equipos, funciones, laboratorios y reportes.        |
| AUTHORIZED-USER    | Acceso limitado: puede registrar sesiones y consultar su historial propio.  |

---

## 🛠️ Tecnologías Utilizadas

- Angular 18+
- TypeScript
- SCSS modularizado
- ng2-charts para gráficas
- html2canvas + jsPDF para exportar visualizaciones a PDF
- xlsx + FileSaver para exportar datos a Excel/CSV
- Keycloak (opcional) para autenticación basada en tokens JWT

---

## 📦 Instalación y Ejecución

```bash
git clone https://github.com/juanitomanoplateada/geli.git
cd geli
npm install
ng serve
