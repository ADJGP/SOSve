# SOS Venezuela — Registro de Personas Terremoto 2026

Sistema de registro de personas encontradas y buscadas tras el terremoto en Venezuela. Funciona como página estática en **GitHub Pages**, con datos almacenados en **Google Sheets**.

---

## 🗂 Estructura del proyecto

```
SOS/
├── index.html          ← Aplicación principal
├── css/
│   └── style.css       ← Estilos
├── js/
│   ├── data.js         ← Datos estáticos y datos de demo
│   └── app.js          ← Lógica de la aplicación
└── README.md
```

---

## 🚀 Despliegue en GitHub Pages

1. Crea un repositorio en GitHub (ej: `sos-venezuela`)
2. Sube todos los archivos
3. Ve a **Settings → Pages → Branch: main → Save**
4. Tu sitio estará en `https://tu-usuario.github.io/sos-venezuela/`

---

## 🔧 Configuración de Google Sheets

### Paso 1 — Crear la hoja de cálculo

1. Ve a [Google Sheets](https://sheets.google.com) y crea una nueva hoja
2. Crea **2 pestañas**: `Registros` y `Anuncios`
3. Copia el **ID** de la URL (entre `/d/` y `/edit`)

### Paso 2 — Crear el Google Apps Script (Web App)

1. Abre tu hoja de cálculo
2. Ve a **Extensiones → Apps Script**
3. Borra el código por defecto
4. Pega el código que aparece en la pestaña **Configurar** de la web
5. Guarda (`Ctrl+S`)
6. Haz clic en **Implementar → Nueva implementación**
   - Tipo: **Aplicación web**
   - Ejecutar como: **Yo**
   - Quién tiene acceso: **Cualquier persona**
7. Autoriza los permisos y **copia la URL** del Web App

### Paso 3 — Obtener API Key de Google (solo para lectura)

1. Ve a [Google Cloud Console](https://console.cloud.google.com/)
2. Crea un proyecto nuevo
3. Busca y activa **Google Sheets API**
4. Ve a **Credenciales → Crear credenciales → Clave de API**
5. Restringe la clave a la API de Sheets y a tu dominio de GitHub Pages

### Paso 4 — Configurar la web

1. Ve a la pestaña **⚙️ Configurar** en la aplicación
2. Ingresa:
   - **ID de la hoja** (del URL de Google Sheets)
   - **API Key** (de Google Cloud)
   - **URL del Web App** (del Apps Script)
3. Haz clic en **Guardar configuración**
4. Haz clic en **Probar conexión** para verificar

> ⚠️ La configuración se guarda **solo en tu navegador** (localStorage). Cada usuario que administre el sistema debe configurarlo una vez.

---

## 📊 Estructura de datos en Google Sheets

### Hoja `Registros`
| Columna | Descripción |
|---------|-------------|
| Timestamp | Fecha/hora de registro |
| Nombre | Nombre completo |
| Edad | Edad en años |
| TipoPersn | adulto / nino / adulto_mayor |
| Genero | femenino / masculino / otro |
| Cedula | Número de documento |
| Telefono | Teléfono |
| Estado | Estado de Venezuela |
| Municipio | Municipio o ciudad |
| Direccion | Dirección o referencia |
| EstadoSalud | sano / leve / grave / critico / fallecido / desconocido |
| TipoRegistro | encontrado / buscado / en_refugio / hospitalizado |
| DescSalud | Descripción de salud |
| ReporterNombre | Nombre de quien reporta |
| ReporterContacto | Contacto de quien reporta |
| Notas | Notas adicionales |
| ID | Identificador único |

### Hoja `Anuncios`
| Columna | Descripción |
|---------|-------------|
| Timestamp | Fecha/hora del anuncio |
| NombreBuscado | Nombre de la persona buscada |
| Edad | Edad aproximada |
| Estado | Último estado conocido |
| Ubicacion | Última ubicación |
| Descripcion | Descripción/señas particulares |
| Contacto | Contacto del publicador |
| NombreReporter | Nombre de quien publica |
| ID | Identificador único |

---

## 🛡 Modo demostración

Si no hay configuración guardada, la app carga **datos de ejemplo** locales. Los registros en modo demo **no se guardan** en ningún servidor.

---

## 📱 Características

- ✅ Formulario de registro de personas (encontradas/buscadas)
- ✅ Anuncios de búsqueda pública
- ✅ Búsqueda con filtros (estado, tipo de registro, salud)
- ✅ Listado por estado venezolano
- ✅ Estadísticas en tiempo real
- ✅ Diseño responsivo (móvil y escritorio)
- ✅ Sin backend — funciona en GitHub Pages
- ✅ Datos almacenados en Google Sheets
- ✅ Modo demo offline con datos de ejemplo

---

## ⚠️ Aviso legal

Esta plataforma es de **uso civil voluntario**. Los datos publicados son responsabilidad de quienes los registran. No es un sistema oficial del gobierno venezolano.
