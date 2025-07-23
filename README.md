# RetoMate API

## 🧠 Introducción

Esta es la API que conecta con la aplicación móvil **RetoMate**, una app educativa centrada en el aprendizaje de aritmética de forma lúdica e interactiva.  
La API está construida con **Node.js**, **Express** y **MongoDB** (mediante **Mongoose**), y expone endpoints para gestionar usuarios, progresos, ejercicios, autenticación, entre otros.

---

## Tecnologías usadas

- **Node.js** – Entorno de ejecución para JavaScript en el backend.
- **Express** – Framework para gestionar rutas y middleware del servidor.
- **MongoDB** – Base de datos NoSQL utilizada para almacenar la información.
- **Mongoose** – ODM para modelar datos en MongoDB con validaciones y esquemas.
- **dotenv** – Carga variables de entorno desde un archivo `.env`.
- **bcryptjs** – Para el hash y la verificación segura de contraseñas.
- **jsonwebtoken** – Generación y verificación de tokens JWT para autenticación.
- **axios** – Cliente HTTP para hacer peticiones (útil en la comunicación con el frontend).
- **cors** – Permite compartir recursos entre distintos orígenes (CORS).
- **qr-image** – Generación de códigos QR desde el backend.

## ⚙️ Instalación

Clona el repositorio e instala las dependencias:

```bash
git clone https://github.com/luisillo2048/mongodb-app-api
cd mongodb-app-api
npm install
```

Crea un archivo .env en la raíz con tus variables de entorno (ver sección correspondiente).

## 🧪 Scripts disponibles

```
npm run dev      # Inicia el servidor con nodemon
npm start        # Inicia el servidor en producción
```

## 🌐 Endpoints principales

| Método  | Ruta                    | Descripción                                 1                               |
| ------  | ----------------------- | --------------------------------------------------------------------------- |
| DELETE  | /:id                    | Elimina tarea por IDs                                                       |
| DELETE  | /:id                    | Elimina un logro desbloqueado (uso administrativo)                          |
| GET     | /:id                    | Obtiene un logro desbloqueado específico                                    |
| GET     | /:id_usuario/resumen    | Obtiene el resumen del progreso (total de puntaje) de un usuario específico |
| POST    | /:id/responder          | Responde a una tarea y guardar el progreso                                  |
| POST    | /add                    | Añade una nueva tarea                                                       |
| POST    | /add                    | Añade un desbloqueo de logro                                                |
| GET     | /allogros               | Obtiene todos los logros                                                    |
| GET     | /alltareas              | Obtiene todas las tareas                                                    |
| POST    | /login                  | Inicio de sesión (auth)                                                     |
| POST    | /logout                 | Cierre de sesión (auth)                                                     |
| PUT     | /logro/:id              | Actualiza un logro                                                          |
| DELETE  | /logros:id              | Elimina un logro                                                            |
| GET     | /me                     | Obtiene datos del usuario autenticado                                       |
| POST    | /newlogro               | Crea un nuevo logro                                                         |
| POST    | /newlogros              | Crea múltiples logros                                                       |
| POST    | /prediccion             | Endpoint para predecir la dificultad (Flask)                                |
| GET     | /progreso/:id_usuario   | Obtiene el progreso de un usuario específico                                |
| POST    | /register               | Registra un usuario                                                         |
| POST    | /send-notification      | Envía una notificación usando FastAPI                                       |
| GET     | /tareas/bloque/:bloque  | Obtiene tareas por bloque                                                   |
| GET     | /users                  | Obtiene todos los usuarios                                                  |


## 📁 Estructura del proyecto

```
mongodb-app-api/
  ├── README.md
  ├── config.js
  ├── controllers
  ├── generar_progresos.js
  ├── generar_tareas.js
  ├── middlewares
  ├── models
  ├── package-lock.json
  ├── package.json
  ├── routes
  └── server.js
```

## 🧩 Variables de entorno

Crea un archivo .env con las siguientes variables:

```
MONGO_URI=mongodb://localhost:27017/[nombre_de_tu_base_de_datos]
API_URL=http://localhost:[puerto]                                 # Ej: http://localhost:3000
JWT_SECRET=[tu_clave_secreta]                                     # Usa una cadena segura y única
````

## 📦 Conexión con el frontend

Esta API está diseñada para interactuar con la app móvil hecha en React Native + Expo, consumiendo los endpoints usando Axios desde el frontend.

## 📌 Estatus del proyecto

🚧 En desarrollo activo. Se están integrando funcionalidades de ludificación, progreso y personalización de ejercicios adaptativos con IA/ML en futuras versiones.