import api from './api.js';
import { toast } from '$lib/stores/toastStore.js';

// Servicio específico para camiones [[memory:7706467]]
export const camionesService = {
	// Obtener todos los camiones
	getAll: async () => {
		try {
			const response = await api.get('/api/camiones');
			return response.data;
		} catch (error) {
			toast.error(`Error al obtener camiones: ${error.message}`);
			throw error;
		}
	},

	// Obtener un camión por ID
	getById: async (id) => {
		try {
			const response = await api.get(`/api/camiones/${id}`);
			return response.data;
		} catch (error) {
			toast.error(`Error al obtener camión ${id}: ${error.message}`);
			throw error;
		}
	},

	// Crear un nuevo camión
	create: async (camionData) => {
		try {
			const response = await api.post('/api/camiones', camionData);
			return response.data;
		} catch (error) {
			toast.error(`Error al crear camión: ${error.message}`);
			throw error;
		}
	},

	// Actualizar un camión
	update: async (id, camionData) => {
		try {
			const response = await api.put(`/api/camiones/${id}`, camionData);
			return response.data;
		} catch (error) {
			toast.error(`Error al actualizar camión: ${error.message}`);
			throw error;
		}
	},

	// Eliminar un camión
	delete: async (id) => {
		try {
			const response = await api.delete(`/api/camiones/${id}`);
			return response.data;
		} catch (error) {
			toast.error(`Error al eliminar camión: ${error.message}`);
			throw error;
		}
	}
};

export default camionesService;
