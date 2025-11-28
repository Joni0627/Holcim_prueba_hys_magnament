# H&S Management System

Sistema integral de gestión de Seguridad e Higiene (EHS) diseñado para plantas industriales. Esta aplicación permite digitalizar y controlar flujos de trabajo críticos, capacitaciones y activos.

## 🚀 Características Principales

### 1. Manejo del Cambio (MDC / MOC)
Gestión completa del ciclo de vida de un cambio operativo.
- **Workflow de Aprobación:** Solicitud -> Aprobación (Gerencia) -> Ejecución -> Cierre.
- **Tablero Kanban:** Visualización de estados en columnas (Solicitudes, En Proceso, Finalizado).
- **Gestión de Riesgos:** Selección de riesgos y estándares asociados.
- **Geolocalización:** Registro de coordenadas del cambio.

### 2. Inspección de Andamios
Digitalización del proceso de habilitación de estructuras.
- **Checklist Dinámico:** Configurable por administradores (Base, Cuerpo, Plataforma).
- **Dictamen:** Habilitación (Tarjeta Verde) o Clausura (Tarjeta Roja).
- **Evidencias:** Registro de observaciones y simulación de fotos.
- **Ciclo de Vida:** Armado -> Inspeccionado -> A Desmontar -> Desmontado (Kanban).

### 3. Formación (LMS - Academia)
Sistema de gestión de aprendizaje para operarios.
- **Planes de Capacitación:** Asignación automática de cursos según el Puesto Laboral.
- **Agrupación Inteligente:** Cursos que comparten la misma evaluación se rinden una sola vez.
- **Exámenes:** Cuestionarios con puntaje de corte (80%).
- **Validación Práctica:** Flujo para que H&S valide habilidades manuales post-teoría.
- **Historial:** Registro de intentos fallidos y preguntas erróneas.

### 4. Habilitaciones (Credencial Digital)
- **Tarjeta Virtual:** Perfil del operario con foto.
- **Código QR:** Para escaneo en campo por supervisores.
- **Estado en Tiempo Real:** Visualización de certificaciones vigentes y vencidas.

### 5. Datos Maestros
Panel de administración centralizado.
- **Organización:** Usuarios, Empresas, Áreas, Puestos.
- **Activos:** Vehículos, Máquinas.
- **Academia:** Constructor de Exámenes, Gestión de Cursos y Planes.

## 🛠️ Tecnologías Utilizadas

- **Frontend:** React 18
- **Lenguaje:** TypeScript
- **Estilos:** Tailwind CSS
- **Iconos:** Lucide React
- **Navegación:** React Router DOM

## 📦 Instalación y Uso

1. Clonar el repositorio:
   ```bash
   git clone https://github.com/tu-usuario/hs-management.git
   ```

2. Instalar dependencias:
   ```bash
   npm install
   ```

3. Correr en desarrollo:
   ```bash
   npm run dev
   ```

## 🔐 Seguridad y Roles (Demo)

La aplicación cuenta con una simulación de roles en el frontend.
- **Operario:** Acceso a "Mis Capacitaciones", "Mis Habilitaciones".
- **Supervisor/H&S:** Acceso a "Validación Práctica", "Aprobación de MDC".
- **Administrador:** Acceso total a "Datos Maestros" y Configuraciones.

---
**Nota:** Este proyecto está configurado para despliegue automático en plataformas como Vercel o Netlify.
Desarrollado para optimizar la seguridad en planta.