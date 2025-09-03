import { writable } from 'svelte/store';

// Store para notificaciones toast [[memory:7706467]]
export const toasts = writable([]);

// Tipos de toast
export const TOAST_TYPES = {
	SUCCESS: 'success',
	ERROR: 'error',
	WARNING: 'warning',
	INFO: 'info'
};

// Configuración por defecto
const DEFAULT_DURATION = 5000; // 5 segundos
const MAX_TOASTS = 5; // Máximo 5 toasts visibles

let toastId = 0;

// Funciones para manejar toasts
export const toastActions = {
	// Agregar toast
	add: (message, type = TOAST_TYPES.INFO, duration = DEFAULT_DURATION, options = {}) => {
		const id = ++toastId;
		const toast = {
			id,
			message,
			type,
			duration,
			timestamp: new Date(),
			dismissible: options.dismissible !== false,
			persistent: options.persistent === true,
			...options
		};

		toasts.update(currentToasts => {
			const newToasts = [toast, ...currentToasts];
			// Limitar el número de toasts
			return newToasts.slice(0, MAX_TOASTS);
		});

		// Auto-remover después del tiempo especificado (si no es persistente)
		if (!toast.persistent && duration > 0) {
			setTimeout(() => {
				toastActions.remove(id);
			}, duration);
		}

		return id;
	},

	// Remover toast por ID
	remove: (id) => {
		toasts.update(currentToasts => 
			currentToasts.filter(toast => toast.id !== id)
		);
	},

	// Limpiar todos los toasts
	clear: () => {
		toasts.set([]);
	},

	// Métodos de conveniencia
	success: (message, options = {}) => {
		return toastActions.add(message, TOAST_TYPES.SUCCESS, DEFAULT_DURATION, options);
	},

	error: (message, options = {}) => {
		return toastActions.add(message, TOAST_TYPES.ERROR, 8000, { // Errores duran más
			...options,
			dismissible: true
		});
	},

	warning: (message, options = {}) => {
		return toastActions.add(message, TOAST_TYPES.WARNING, 6000, options);
	},

	info: (message, options = {}) => {
		return toastActions.add(message, TOAST_TYPES.INFO, DEFAULT_DURATION, options);
	},

	// Para reemplazar console.log
	log: (message, data = null) => {
		const fullMessage = data ? `${message}: ${JSON.stringify(data)}` : message;
		return toastActions.info(fullMessage, { persistent: false });
	}
};

// Función global para reemplazar console.log
export const toast = toastActions;
