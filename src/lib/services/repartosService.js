import api from './api.js';
import { toast } from '$lib/stores/toastStore.js';

// Servicio específico para repartos [[memory:7706467]]
export const repartosService = {
	// Obtener todos los repartos
	getAll: async () => {
		try {
			const response = await api.get('/api/repartos');
			return response.data;
		} catch (error) {
			toast.error(`Error al obtener repartos: ${error.message}`);
			throw error;
		}
	},

	// Obtener un reparto por ID
	getById: async (id) => {
		try {
			const response = await api.get(`/api/repartos/${id}`);
			return response.data;
		} catch (error) {
			toast.error(`Error al obtener reparto ${id}: ${error.message}`);
			throw error;
		}
	},

	// Crear un nuevo reparto
	create: async (repartoData) => {
		try {
			const response = await api.post('/api/repartos', repartoData);
			return response.data;
		} catch (error) {
			toast.error(`Error al crear reparto: ${error.message}`);
			throw error;
		}
	},

	// Actualizar un reparto
	update: async (id, repartoData) => {
		try {
			const response = await api.put(`/api/repartos/${id}`, repartoData);
			return response.data;
		} catch (error) {
			toast.error(`Error al actualizar reparto: ${error.message}`);
			throw error;
		}
	},

	// Eliminar un reparto
	delete: async (id) => {
		try {
			const response = await api.delete(`/api/repartos/${id}`);
			return response.data;
		} catch (error) {
			toast.error(`Error al eliminar reparto: ${error.message}`);
			throw error;
		}
	},

	// Obtener repartos por camión
	getByCamion: async (camionId) => {
		try {
			const response = await api.get(`/api/repartos/camion/${camionId}`);
			return response.data;
		} catch (error) {
			toast.error(`Error al obtener repartos del camión: ${error.message}`);
			throw error;
		}
	},

	// Obtener repartos por ruta
	getByRuta: async (rutaId) => {
		try {
			const response = await api.get(`/api/repartos/ruta/${rutaId}`);
			return response.data;
		} catch (error) {
			toast.error(`Error al obtener repartos de la ruta: ${error.message}`);
			throw error;
		}
	},

	// Obtener clientes de un reparto específico (para el mapa)
	getClientesFromReparto: async (repartoId) => {
		try {
			const response = await api.get(`/api/repartos/${repartoId}/clientes`);
			return response.data;
		} catch (error) {
			// Si no existe este endpoint, usar datos del reparto principal
			return null;
		}
	}
};

export default repartosService;
