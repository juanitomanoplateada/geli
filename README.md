# 🚀 GELI - Gestor de Equipos de Laboratorio Institucional

**GELI** es un sistema integral de gestión para equipos de laboratorio universitario. Facilita el registro, seguimiento, asignación y reporte del uso de equipos, incluyendo módulos de control de sesiones, usuarios, laboratorios y funciones.

---

## 📌 Características Principales

- ✅ **Gestión de Sesiones**: Registro de uso, historial personal y trazabilidad completa.
- 🧑‍🔧 **Administración de Usuarios**: Control por roles (QUALITY-ADMIN-USER / AUTHORIZED-USER).
- 🧪 **Gestión de Equipos**: Registro, permisos de uso y trazabilidad.
- 🏫 **Gestión de Laboratorios**: Alta y edición de laboratorios con ubicación y estado.
- 📊 **Sistema de Reportes**: Filtros avanzados, gráficas, exportación a PDF, Excel y CSV.
- 🧩 **Arquitectura Modular**: Implementado en Angular, con componentes standalone y SCSS.

---

## 🧱 Estructura del Proyecto
src/
├── app/
│ ├── features/
│ │ ├── auth/ # Login, recuperación de contraseña
│ │ ├── dashboard/ # Vistas protegidas por rol
│ │ ├── reports/ # Reportes PDF/Excel/CSV con gráficas
│ │ └── session/ # Registro y control de sesiones
│ ├── core/ # Servicios, modelos, guards
│ └── shared/ # Componentes reutilizables
└── styles.scss # Estilos globales del sistema


---

## 👥 Roles de Usuario

| Rol                 | Descripción                                                       |
|---------------------|-------------------------------------------------------------------|
| `QUALITY-ADMIN-USER` | Acceso total: gestión de usuarios, equipos, reportes y sesiones. |
| `AUTHORIZED-USER`    | Solo puede iniciar y cerrar sesiones, y ver su historial.        |

---

## 🛠️ Tecnologías Utilizadas

- **Angular** 18+
- **TypeScript**
- **SCSS Modular**
- **ng2-charts** para visualización de gráficas
- **html2canvas + jsPDF** para exportación de reportes
- **XLSX + FileSaver** para exportación a Excel/CSV

---

## 📦 Instalación

```bash
git clone https://github.com/juanitomanoplateada/geli.git
cd geli
npm install
ng serve

Consulta la documentación oficial:
🔗 https://deepwiki.com/juanitomanoplateada/geli
