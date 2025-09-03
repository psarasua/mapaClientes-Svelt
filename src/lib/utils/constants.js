// Configuración de la aplicación
export const APP_CONFIG = {
	name: 'Mi Frontend - SvelteKit',
	version: '1.0.0',
	description: 'Frontend en SvelteKit para consumir API',
};

// URLs y endpoints
export const API_ENDPOINTS = {
	users: 'users',
	auth: 'auth',
	// Agrega más endpoints según tu API
};

// Estados de la aplicación
export const LOADING_STATES = {
	IDLE: 'idle',
	LOADING: 'loading',
	SUCCESS: 'success',
	ERROR: 'error',
};

// Mensajes de error comunes
export const ERROR_MESSAGES = {
	NETWORK_ERROR: 'Error de conexión. Verifica tu conexión a internet.',
	SERVER_ERROR: 'Error del servidor. Inténtalo más tarde.',
	NOT_FOUND: 'Recurso no encontrado.',
	UNAUTHORIZED: 'No tienes permisos para realizar esta acción.',
	VALIDATION_ERROR: 'Datos inválidos. Verifica la información ingresada.',
	GENERIC_ERROR: 'Ha ocurrido un error inesperado.',
};

// Mensajes de éxito
export const SUCCESS_MESSAGES = {
	CREATED: 'Elemento creado exitosamente.',
	UPDATED: 'Elemento actualizado exitosamente.',
	DELETED: 'Elemento eliminado exitosamente.',
	SAVED: 'Cambios guardados exitosamente.',
};

// Configuración de paginación
export const PAGINATION = {
	DEFAULT_PAGE_SIZE: 10,
	PAGE_SIZE_OPTIONS: [5, 10, 25, 50],
};

// Configuración de tiempo
export const TIME_CONFIG = {
	REQUEST_TIMEOUT: 10000, // 10 segundos
	DEBOUNCE_DELAY: 300,    // 300ms
	TOAST_DURATION: 3000,   // 3 segundos
};

// Patrones de validación
export const VALIDATION_PATTERNS = {
	EMAIL: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
	PHONE: /^\+?[\d\s-()]+$/,
	PASSWORD: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[a-zA-Z\d@$!%*?&]{8,}$/,
};

// Códigos de estado HTTP
export const HTTP_STATUS = {
	OK: 200,
	CREATED: 201,
	BAD_REQUEST: 400,
	UNAUTHORIZED: 401,
	FORBIDDEN: 403,
	NOT_FOUND: 404,
	INTERNAL_SERVER_ERROR: 500,
};

// Configuración específica de SvelteKit
export const SVELTE_CONFIG = {
	TRANSITION_DURATION: 300,
	ANIMATION_EASING: 'cubic-bezier(0.4, 0.0, 0.2, 1)',
};
