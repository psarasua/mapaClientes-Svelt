import { ERROR_MESSAGES, VALIDATION_PATTERNS } from './constants.js';

// Funciones de utilidad [[memory:7706467]]

// Formatear fechas
export const formatDate = (date, options = {}) => {
	const defaultOptions = {
		year: 'numeric',
		month: 'long',
		day: 'numeric',
		...options
	};
	
	return new Date(date).toLocaleDateString('es-ES', defaultOptions);
};

// Formatear fecha y hora
export const formatDateTime = (date) => {
	return new Date(date).toLocaleString('es-ES', {
		year: 'numeric',
		month: 'short',
		day: 'numeric',
		hour: '2-digit',
		minute: '2-digit'
	});
};

// Capitalizar primera letra
export const capitalize = (str) => {
	if (!str) return '';
	return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
};

// Truncar texto
export const truncateText = (text, maxLength = 100) => {
	if (!text || text.length <= maxLength) return text;
	return text.substring(0, maxLength).trim() + '...';
};

// Validar email
export const isValidEmail = (email) => {
	return VALIDATION_PATTERNS.EMAIL.test(email);
};

// Validar teléfono
export const isValidPhone = (phone) => {
	return VALIDATION_PATTERNS.PHONE.test(phone);
};

// Validar contraseña
export const isValidPassword = (password) => {
	return VALIDATION_PATTERNS.PASSWORD.test(password);
};

// Generar ID único simple
export const generateId = () => {
	return Date.now().toString(36) + Math.random().toString(36).substr(2);
};

// Debounce function
export const debounce = (func, wait) => {
	let timeout;
	return function executedFunction(...args) {
		const later = () => {
			clearTimeout(timeout);
			func(...args);
		};
		clearTimeout(timeout);
		timeout = setTimeout(later, wait);
	};
};

// Formatear números
export const formatNumber = (number, decimals = 0) => {
	return new Intl.NumberFormat('es-ES', {
		minimumFractionDigits: decimals,
		maximumFractionDigits: decimals
	}).format(number);
};

// Formatear moneda
export const formatCurrency = (amount, currency = 'EUR') => {
	return new Intl.NumberFormat('es-ES', {
		style: 'currency',
		currency: currency
	}).format(amount);
};

// Obtener mensaje de error apropiado
export const getErrorMessage = (error) => {
	if (error.response) {
		const status = error.response.status;
		switch (status) {
			case 400:
				return error.response.data?.message || ERROR_MESSAGES.VALIDATION_ERROR;
			case 401:
				return ERROR_MESSAGES.UNAUTHORIZED;
			case 404:
				return ERROR_MESSAGES.NOT_FOUND;
			case 500:
				return ERROR_MESSAGES.SERVER_ERROR;
			default:
				return error.response.data?.message || ERROR_MESSAGES.GENERIC_ERROR;
		}
	} else if (error.request) {
		return ERROR_MESSAGES.NETWORK_ERROR;
	} else {
		return error.message || ERROR_MESSAGES.GENERIC_ERROR;
	}
};

// Limpiar objeto de propiedades vacías
export const cleanObject = (obj) => {
	const cleaned = {};
	Object.keys(obj).forEach(key => {
		if (obj[key] !== null && obj[key] !== undefined && obj[key] !== '') {
			cleaned[key] = obj[key];
		}
	});
	return cleaned;
};

// Ordenar array de objetos
export const sortBy = (array, key, direction = 'asc') => {
	return [...array].sort((a, b) => {
		const aVal = a[key];
		const bVal = b[key];
		
		if (direction === 'asc') {
			return aVal > bVal ? 1 : -1;
		} else {
			return aVal < bVal ? 1 : -1;
		}
	});
};

// Agrupar array por propiedad
export const groupBy = (array, key) => {
	return array.reduce((groups, item) => {
		const group = item[key];
		groups[group] = groups[group] || [];
		groups[group].push(item);
		return groups;
	}, {});
};

// Función específica para SvelteKit - manejar navegación
export const goto = async (url, options = {}) => {
	const { goto } = await import('$app/navigation');
	return goto(url, options);
};

// Función para manejar errores de forma reactiva en Svelte
export const handleAsyncError = async (asyncFunction, errorStore) => {
	try {
		return await asyncFunction();
	} catch (error) {
		if (errorStore && errorStore.set) {
			errorStore.set(getErrorMessage(error));
		}
		throw error;
	}
};

// Copiar texto al portapapeles (solo en navegador)
export const copyToClipboard = async (text) => {
	if (typeof window === 'undefined') return false;
	
	try {
		await navigator.clipboard.writeText(text);
		return true;
	} catch (err) {
		// Fallback para navegadores más antiguos
		const textArea = document.createElement('textarea');
		textArea.value = text;
		document.body.appendChild(textArea);
		textArea.select();
		document.execCommand('copy');
		document.body.removeChild(textArea);
		return true;
	}
};
