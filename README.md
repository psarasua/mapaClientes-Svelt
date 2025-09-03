# Mi Frontend - SvelteKit

Frontend desarrollado en SvelteKit con JavaScript para consumir API.

## Características

- SvelteKit para desarrollo web moderno
- Bootstrap 5 para estilos y componentes
- Bootstrap Icons para iconografía
- Axios para llamadas a la API
- Estructura modular y escalable
- Enrutamiento automático basado en archivos

## Estructura del Proyecto

```
mi-frontend-svelte/
├── src/
│   ├── lib/
│   │   ├── components/
│   │   │   ├── common/
│   │   │   │   ├── Header.svelte
│   │   │   │   ├── Footer.svelte
│   │   │   │   ├── Loading.svelte
│   │   │   │   └── ErrorMessage.svelte
│   │   │   └── layout/
│   │   │       └── Layout.svelte
│   │   ├── services/
│   │   │   ├── api.js
│   │   │   └── apiService.js
│   │   ├── utils/
│   │   │   ├── constants.js
│   │   │   └── helpers.js
│   │   └── stores/
│   │       └── appStore.js
│   ├── routes/
│   │   ├── +layout.svelte
│   │   ├── +page.svelte
│   │   └── about/
│   │       └── +page.svelte
│   ├── app.html
│   └── app.css
├── static/
│   └── favicon.png
├── package.json
├── svelte.config.js
├── vite.config.js
├── jsconfig.json
├── .gitignore
└── README.md
```

## Instalación

```bash
npm install
```

## Desarrollo

```bash
npm run dev
```

## Construcción

```bash
npm run build
```

## Vista previa de producción

```bash
npm run preview
```

## Configuración

Crea un archivo `.env` con las siguientes variables:

```env
VITE_API_URL=https://managerial-teresa-pablo-sarasua-df7cefa1.koyeb.app
VITE_APP_ENV=development
```
