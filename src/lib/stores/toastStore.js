import frenchToast from 'svelte-french-toast';

// Funciones wrapper para mantener compatibilidad con la API anterior
export const toastActions = {
	success: (message, options = {}) => {
		return frenchToast.success(message, {
			duration: 5000,
			icon: '✅',
			...options
		});
	},

	error: (message, options = {}) => {
		return frenchToast.error(message, {
			duration: 8000,
			icon: '❌',
			...options
		});
	},

	warning: (message, options = {}) => {
		return frenchToast(message, {
			duration: 6000,
			icon: '⚠️',
			style: 'background: #f59e0b; color: white;',
			...options
		});
	},

	info: (message, options = {}) => {
		return frenchToast(message, {
			duration: 5000,
			icon: 'ℹ️',
			style: 'background: #3b82f6; color: white;',
			...options
		});
	},

	// Limpiar todos los toasts
	clear: () => {
		frenchToast.dismiss();
	},

	// Para reemplazar console.log
	log: (message, data = null) => {
		const fullMessage = data ? `${message}: ${JSON.stringify(data)}` : message;
		return toastActions.info(fullMessage);
	}
};

// Exportar toastActions como toast para compatibilidad
export const toast = toastActions;
export default toastActions;
