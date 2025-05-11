GELI - Gestor de Equipos de Laboratorio Institucional
GELI es un sistema integral de gestión de equipos de laboratorio, diseñado para registrar, monitorear y reportar el uso de equipos dentro de entornos institucionales. Proporciona un control estructurado de sesiones de uso, administración de usuarios y equipos, y generación de informes, todo ello con controles de acceso basados en roles.

🚀 Características Principales
Gestión de Sesiones: Registro y seguimiento de sesiones de uso de equipos, con historial personal y general.

Administración de Usuarios: Control de acceso basado en roles (QUALITY-ADMIN-USER y AUTHORIZED-USER), con funcionalidades para búsqueda y actualización de información de usuarios.

Gestión de Equipos: Registro de equipos, asignación de permisos y seguimiento de su uso.

Gestión de Laboratorios: Registro y búsqueda de laboratorios dentro de la institución.

Sistema de Reportes: Generación de informes detallados sobre el uso de equipos y sesiones registradas.

Interfaz Modular: Aplicación web desarrollada con Angular, organizada en módulos funcionales para facilitar la navegación y el mantenimiento.

🛠️ Tecnologías Utilizadas
Frontend: Angular

Control de Acceso: Implementación de RoleGuard para proteger rutas según el rol del usuario.

Estilos: SCSS para la personalización de la interfaz de usuario.

📦 Estructura del Proyecto
src/app/features/auth/: Componentes relacionados con la autenticación y seguridad.

src/app/features/dashboard/: Componentes del panel principal, incluyendo rutas y vistas de reportes.

src/styles.scss: Archivo principal de estilos.

🔐 Roles de Usuario
QUALITY-ADMIN-USER: Acceso completo a todas las funcionalidades, incluyendo administración de usuarios, configuración de equipos y generación de reportes.

AUTHORIZED-USER: Acceso limitado al registro de sesiones y visualización de su historial personal.

📄 Documentación
Para una descripción detallada de cada subsistema, consulta las siguientes secciones:

Gestión de Sesiones

Administración de Usuarios

Gestión de Equipos

Gestión de Laboratorios

Sistema de Reportes

📥 Instalación y Uso
Clona el repositorio:

bash
Copiar
Editar
git clone https://github.com/juanitomanoplateada/geli.git
Navega al directorio del proyecto:

bash
Copiar
Editar
cd geli
Instala las dependencias:

bash
Copiar
Editar
npm install
Inicia la aplicación:

bash
Copiar
Editar
ng serve
