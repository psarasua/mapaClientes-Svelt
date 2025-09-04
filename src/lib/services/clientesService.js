import api from './api.js';
import { toast } from '$lib/stores/toastStore.js';

// Servicio específico para clientes [[memory:7706467]]
export const clientesService = {
	// Obtener todos los clientes
	getAll: async () => {
		try {
			const response = await api.get('/api/clientes');
			return response.data;
		} catch (error) {
			toast.error(`Error al obtener clientes: ${error.message}`);
			throw error;
		}
	},

	// Obtener un cliente por ID
	getById: async (id) => {
		try {
			const response = await api.get(`/api/clientes/${id}`);
			return response.data;
		} catch (error) {
			toast.error(`Error al obtener cliente ${id}: ${error.message}`);
			throw error;
		}
	},

	// Crear un nuevo cliente
	create: async (clienteData) => {
		try {
			const response = await api.post('/api/clientes', clienteData);
			return response.data;
		} catch (error) {
			toast.error(`Error al crear cliente: ${error.message}`);
			throw error;
		}
	},

	// Actualizar un cliente
	update: async (id, clienteData) => {
		try {
			const response = await api.put(`/api/clientes/${id}`, clienteData);
			return response.data;
		} catch (error) {
			toast.error(`Error al actualizar cliente: ${error.message}`);
			throw error;
		}
	},

	// Eliminar un cliente
	delete: async (id) => {
		try {
			const response = await api.delete(`/api/clientes/${id}`);
			return response.data;
		} catch (error) {
			toast.error(`Error al eliminar cliente: ${error.message}`);
			throw error;
		}
	},

	// Buscar clientes por criterios específicos
	search: async (params = {}) => {
		try {
			const response = await api.get('/api/clientes/search', { params });
			toast.info(`Búsqueda completada: ${response.data.count || 0} resultados`);
			return response.data;
		} catch (error) {
			toast.error(`Error en búsqueda: ${error.message}`);
			throw error;
		}
	}
};

export default clientesService;
