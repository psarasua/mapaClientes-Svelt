import { writable } from 'svelte/store';

// Store para el estado de carga global
export const loading = writable(false);

// Store para mensajes de error
export const error = writable(null);

// Store para mensajes de éxito
export const success = writable(null);

// Store para el usuario actual
export const currentUser = writable(null);

// Store para el estado de autenticación
export const isAuthenticated = writable(false);

// Store para datos de la aplicación
export const appData = writable({
	users: [],
	selectedUser: null
});

// Funciones de utilidad para manejar estados [[memory:7706467]]
export const setLoading = (isLoading) => {
	loading.set(isLoading);
};

export const setError = (errorMessage) => {
	error.set(errorMessage);
	// Auto-limpiar error después de 5 segundos
	setTimeout(() => {
		error.set(null);
	}, 5000);
};

export const setSuccess = (successMessage) => {
	success.set(successMessage);
	// Auto-limpiar éxito después de 3 segundos
	setTimeout(() => {
		success.set(null);
	}, 3000);
};

export const clearMessages = () => {
	error.set(null);
	success.set(null);
};

// Store personalizado para manejar datos con estado
export const createDataStore = (initialData = []) => {
	const { subscribe, set, update } = writable({
		data: initialData,
		loading: false,
		error: null
	});

	return {
		subscribe,
		setData: (data) => update(store => ({ ...store, data, loading: false, error: null })),
		setLoading: (loading) => update(store => ({ ...store, loading })),
		setError: (error) => update(store => ({ ...store, error, loading: false })),
		addItem: (item) => update(store => ({ 
			...store, 
			data: [...store.data, item] 
		})),
		updateItem: (id, updatedItem) => update(store => ({
			...store,
			data: store.data.map(item => item.id === id ? { ...item, ...updatedItem } : item)
		})),
		removeItem: (id) => update(store => ({
			...store,
			data: store.data.filter(item => item.id !== id)
		})),
		reset: () => set({ data: initialData, loading: false, error: null })
	};
};

// Ejemplo de store específico para usuarios
export const usersStore = createDataStore([]);
