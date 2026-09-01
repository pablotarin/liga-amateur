# 🏆 Liga Amateur

Aplicación FullStack (**React + Node.js/Express + MongoDB**) para la gestión integral de una liga de fútbol amateur: equipos, jugadores, calendario de partidos y clasificación en tiempo real.

Proyecto final del bootcamp FullStack — pensado para aplicar de forma conjunta todo lo aprendido durante el curso (Node, Express, MongoDB/Mongoose, autenticación JWT, React, hooks avanzados, subida de ficheros) sobre un caso de uso real y con sentido.

---

## 1. Idea y sentido del proyecto

### 1.1 El problema

Cualquier liga amateur (fútbol, pero el modelo es extrapolable a otros deportes) organizada por una federación local, un ayuntamiento o un grupo de aficionados suele gestionarse hoy con **hojas de Excel sueltas, grupos de WhatsApp y PDFs**. Esto provoca:

- Clasificaciones desactualizadas o calculadas a mano y con errores.
- Los propios equipos no pueden actualizar sus datos (plantilla, escudo, entrenador) sin pedírselo a un organizador.
- Los aficionados no tienen un sitio único donde consultar resultados, calendario o estadísticas de jugadores.

### 1.2 La solución

**Liga Amateur** es una plataforma web centralizada con **tres públicos claramente diferenciados**, cada uno con su propio nivel de acceso:

| Rol | Quién es | Qué puede hacer |
|---|---|---|
| **Aficionado / jugador** (`player`) | Cualquier persona que se registra libremente | Consultar clasificación, equipos, jugadores y calendario. Editar su propio perfil y avatar. |
| **Entrenador / delegado de equipo** (`manager`) | Asignado por un admin a un equipo concreto | Todo lo anterior + gestionar la ficha de **su propio equipo** (datos, escudo) y **su propia plantilla** (altas, bajas, estadísticas de sus jugadores). No puede tocar otros equipos. |
| **Administrador de la liga** (`admin`) | Organizador de la competición | Control total: crea/edita/borra equipos, jugadores y partidos de toda la liga, gestiona el calendario y los resultados, y administra los roles de los usuarios. |

Este reparto de permisos no es un añadido técnico gratuito: **modela el funcionamiento real de una liga**, donde el organizador fija el calendario y las reglas, pero cada club es responsable de su propia información, y el público en general solo consume la información.

### 1.3 Público objetivo

Organizadores de ligas amateur (federaciones locales, peñas deportivas, ligas de empresa), entrenadores/delegados de equipo y los propios aficionados/familias que quieren seguir la competición.

---

## 2. Stack tecnológico

### Backend
- **Node.js + Express** — API REST.
- **MongoDB + Mongoose** — base de datos documental y modelado de esquemas/relaciones.
- **JWT (jsonwebtoken)** + **bcryptjs** — autenticación y hash de contraseñas.
- **Multer + Cloudinary** (`multer-storage-cloudinary`) — subida de imágenes (escudos, fotos de jugador, avatares), **opcional**.
- **csv-parse** + `fs` nativo — lectura de los CSV para la semilla de datos.
- **express-async-handler** — evita el boilerplate de try/catch en cada controlador.
- **morgan**, **cors**, **dotenv** — utilidades de servidor.

### Frontend
- **React 18 + Vite**.
- **React Router DOM** — enrutado y rutas protegidas por rol.
- **React Hook Form** — gestión y validación de formularios (login, registro, altas de equipos/jugadores/partidos).
- **Axios** — cliente HTTP con interceptores (token automático + normalización de errores).
- **Framer Motion** — animaciones (aparición de la home, modales).
- **React Icons** — iconografía.
- **CSS "vanilla" con variables (custom properties)** — sin librería de componentes visuales; se pedía expresamente demostrar dominio de la reutilización y estructuración de CSS.

> 💡 Se ha elegido deliberadamente **no usar** una librería de estilos como Chakra UI o Styled Components para poder demostrar la construcción de un sistema de diseño propio (variables, componentes reutilizables) desde cero, tal y como pide el enunciado. `framer-motion`, `react-hook-form` y `react-icons` sí son librerías **no vistas en el curso**, incorporadas para sumar valor.

---

## 3. Modelo de datos y relaciones

Siguiendo el esquema del ejemplo del concesionario (vehículos + clientes → ventas), aquí:

```
   Team (equipo)                Player (jugador)              Match (partido)
 ┌──────────────────┐        ┌───────────────────┐        ┌────────────────────────┐
 │ _id               │◄───┐  │ _id                │        │ _id                    │
 │ name, city         │    └──│ team  (ref Team)   │        │ homeTeam (ref Team) ───┼──┐
 │ foundedYear         │       │ name, dorsal        │        │ awayTeam (ref Team) ───┼──┤
 │ stadium, colores     │       │ position             │        │ jornada, date, venue    │  │
 │ manager (ref User)    │       │ stats: goles, etc.    │        │ homeScore, awayScore    │  │
 └──────────────────┘       └───────────────────┘        └────────────────────────┘  │
                                                                       └─────────────────┘
                    User (usuarios, rol admin/manager/player)
                  ┌──────────────────────────────────┐
                  │ name, email, password (hash)        │
                  │ role: admin | manager | player       │
                  │ team (ref Team, si es manager/player) │
                  └──────────────────────────────────┘
```

- **`Player` → `Team`**: cada jugador pertenece a un único equipo (relación 1-N).
- **`Match` → `Team` (x2)**: cada partido enlaza dos equipos distintos (local/visitante), igual que una "venta" enlazaba vehículo + cliente en el ejemplo de referencia.
- **`User` → `Team`**: un manager (o un player, si se quisiera vincular) queda asociado a un equipo.

Esto cumple sobradamente el mínimo de **2 colecciones relacionadas aparte de usuarios** (aquí hay 3: `Team`, `Player`, `Match`, con relaciones cruzadas entre las tres).

---

## 4. Los datos: del Excel a la base de datos

### 4.1 Excel de partida

En `/database/LigaAmateur_Datos.xlsx` encontrarás **4 hojas**:

| Hoja | Filas | Contenido |
|---|---|---|
| `teams` | 12 | Equipos: nombre, ciudad, año de fundación, estadio, colores, entrenador |
| `players` | 120 | Jugadores: nombre, **equipo (relación)**, posición, dorsal, nacionalidad, estadísticas |
| `matches` | 66 | Partidos: jornada, fecha, **equipo local y visitante (relación)**, resultado, estado |
| `users` | 13 | 1 admin + 12 managers (uno por equipo, con contraseña de prueba) |

**211 registros en total**, muy por encima del mínimo de 100 pedido, con relaciones reales entre las tablas (no datos sueltos).

El Excel se generó con un script de Python (`/database/generar_datos.py` si quieres regenerarlo o ampliarlo) que crea un campeonato completo de liga a doble/una vuelta (round-robin) con el método del círculo, para que el calendario tenga sentido futbolístico real (cada equipo juega contra todos, sin repetir rival en la misma jornada).

### 4.2 De Excel a CSV, y de CSV a MongoDB

1. El Excel se exportó a CSV independiente por hoja → `/database/csv/*.csv`.
2. El script `backend/src/seed/seed.js` **lee esos CSV con el módulo nativo `fs` de Node** (+ `csv-parse` para el parseo), tal y como pide el enunciado.
3. El script inserta primero los `users`, luego los `teams` (enlazando el manager con su equipo), después los `players` (enlazados a su `Team._id` real de Mongo) y por último los `matches` (enlazados a los dos `Team._id`).
4. El resultado es una base de datos con las relaciones vivas (ObjectId reales de Mongoose), no solo con los IDs "legibles" del Excel (T001, P0001, M0001...), que se conservan además como `externalId` por trazabilidad.

---

## 5. Arquitectura del código

### 5.1 Backend (`/backend`)

```
backend/
├── src/
│   ├── config/          # Conexión a Mongo y configuración de Cloudinary
│   ├── models/           # Esquemas Mongoose: User, Team, Player, Match
│   ├── middleware/        # protect/authorize (JWT + roles), upload (Cloudinary), errores
│   ├── controllers/        # Lógica de negocio por recurso
│   ├── routes/             # Definición de endpoints REST, enlazan middleware + controlador
│   ├── seed/                # Script de semilla (lee /database/csv)
│   ├── utils/                 # generateToken.js
│   ├── app.js                  # Configuración de Express (middlewares globales, rutas)
│   └── server.js                # Punto de entrada: conecta DB y levanta el servidor
├── .env.example
└── package.json
```

**Por qué esta estructura:** separa claramente **qué forma tienen los datos** (`models`), **quién puede hacer qué** (`middleware`), **qué hace cada petición** (`controllers`) y **a qué URL responde** (`routes`). Cualquiera que abra el proyecto por primera vez puede seguir el flujo de una petición leyendo `routes → middleware → controller → model` sin sorpresas.

### 5.2 Frontend (`/frontend`)

```
frontend/
├── src/
│   ├── api/              # Una función por endpoint, agrupadas por recurso (axios)
│   ├── context/            # AuthContext (useReducer) — estado global de sesión
│   ├── hooks/                # useAuth, useFetch, useDebounce, useLocalStorageState
│   ├── components/
│   │   ├── common/            # Button, Card, Modal, Badge, Loader, FormField (reutilizables)
│   │   ├── layout/              # Navbar, Footer
│   │   ├── teams / players / matches/  # Tarjetas de dominio (TeamCard, PlayerCard, MatchCard)
│   │   ├── dashboard/              # Paneles de gestión (CRUD) del área privada
│   │   └── routes/                  # ProtectedRoute (control de acceso por rol)
│   ├── pages/                          # Una página = una ruta de React Router
│   ├── styles/                           # variables.css (design tokens) + global.css
│   └── App.jsx / main.jsx                  # Enrutado y arranque de la app
```

**Por qué esta estructura:** el patrón **`api/` (llamadas HTTP) → `hooks/` (estado y lógica reutilizable) → `components/` (piezas visuales) → `pages/` (composición final)** es el mismo en todo el proyecto, así que una vez entiendes una página, entiendes todas. Los componentes de `common/` no saben nada del dominio (fútbol); los de `teams/players/matches` sí. Esto permite reutilizar `Button`, `Card`, `Modal`, etc. en cualquier futuro proyecto.

---

## 6. Funcionalidades clave y hooks avanzados

- **`AuthContext` con `useReducer`**: el estado de sesión (usuario, token, estado de carga) se gestiona con un reducer en lugar de varios `useState` sueltos, evitando estados inconsistentes a mitad de una petición de login.
- **`useFetch`**: hook genérico que envuelve cualquier llamada a la API y expone `data/loading/error/refetch`, con protección ante *race conditions* (usando `useRef` para saber si el componente sigue montado).
- **`useDebounce`**: usado en los buscadores de equipos y jugadores para no lanzar una petición HTTP en cada pulsación de tecla.
- **`useLocalStorageState`**: sincroniza estado de React con `localStorage` (usado para persistir la sesión).
- **`useMemo`**: cálculo de listas filtradas (jornadas disponibles, equipos filtrados) sin recalcular en cada render.
- **Formularios con `react-hook-form`**: validación declarativa y estados de envío (`isSubmitting`) en login, registro y en los tres formularios CRUD del panel de gestión.
- **Rutas protegidas por rol** (`ProtectedRoute`) que redirigen a login o a la home según si el usuario está autenticado y qué rol tiene.
- **Subida de imágenes con Cloudinary** (opcional): escudos de equipo, foto de jugador y avatar de usuario, implementada con `multer` + `FormData` en el frontend, siguiendo la pista de investigación propuesta en el enunciado.

---

## 7. Instalación y ejecución en local

### 7.1 Requisitos previos
- Node.js ≥ 18
- Una base de datos MongoDB (local o, recomendado, un clúster gratuito en [MongoDB Atlas](https://www.mongodb.com/atlas))
- (Opcional) Una cuenta gratuita en [Cloudinary](https://cloudinary.com) si quieres activar la subida de imágenes

### 7.2 Backend

```bash
cd backend
npm install
cp .env.example .env       # y rellena MONGO_URI, JWT_SECRET, etc.
npm run seed                # puebla la base de datos a partir de /database/csv
npm run dev                  # arranca el servidor en http://localhost:4000
```

### 7.3 Frontend

```bash
cd frontend
npm install
cp .env.example .env        # comprueba que VITE_API_URL apunta a tu backend
npm run dev                  # arranca en http://localhost:5173
```

### 7.4 Cuentas de prueba tras la semilla

| Rol | Email | Contraseña |
|---|---|---|
| Administrador | `admin@ligaamateur.com` | `Admin123!` |
| Entrenador (uno por equipo) | ver `database/csv/users.csv` | `Manager123!` |

También puedes registrarte libremente desde `/registro`: los usuarios que se registran así entran con rol `player`.

---

## 8. Despliegue

El proyecto está preparado para desplegarse como dos servicios independientes:

- **Backend** → [Render](https://render.com) / [Railway](https://railway.app): Build command `npm install`, Start command `npm start`, variables de entorno igual que en `.env.example` (usa MongoDB Atlas como `MONGO_URI`).
- **Frontend** → [Vercel](https://vercel.com) / [Netlify](https://netlify.com): Build command `npm run build`, carpeta de salida `dist`, variable de entorno `VITE_API_URL` apuntando a la URL pública del backend desplegado.

Recuerda actualizar `CLIENT_URL` en el backend con la URL final del frontend para que CORS no bloquee las peticiones.

---

## 9. Posibles mejoras futuras

- Paginación en los listados de jugadores/partidos cuando la liga crezca.
- Notificaciones (email) al programar o modificar un partido.
- Estadísticas avanzadas (goleadores, racha de resultados) calculadas en el backend.
- Tests automatizados (Jest + Supertest en el backend, React Testing Library en el frontend).

---

*Proyecto desarrollado como trabajo final de bootcamp FullStack (Node.js + React).*
