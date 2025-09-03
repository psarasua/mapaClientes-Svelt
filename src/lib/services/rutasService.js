import api from './api.js';
import { toast } from '$lib/stores/toastStore.js';

// Servicio específico para rutas [[memory:7706467]]
export const rutasService = {
	// Obtener todas las rutas
	getAll: async () => {
		try {
			const response = await api.get('/api/rutas');
			toast.success(`${response.data.count || 0} rutas cargadas correctamente`);
			return response.data;
		} catch (error) {
			toast.error(`Error al obtener rutas: ${error.message}`);
			throw error;
		}
	},

	// Obtener una ruta por ID
	getById: async (id) => {
		try {
			const response = await api.get(`/api/rutas/${id}`);
			toast.info(`Ruta ${id} obtenida correctamente`);
			return response.data;
		} catch (error) {
			toast.error(`Error al obtener ruta ${id}: ${error.message}`);
			throw error;
		}
	},

	// Crear una nueva ruta
	create: async (rutaData) => {
		try {
			const response = await api.post('/api/rutas', rutaData);
			toast.success(`Ruta "${rutaData.nombre}" creada exitosamente`);
			return response.data;
		} catch (error) {
			toast.error(`Error al crear ruta: ${error.message}`);
			throw error;
		}
	},

	// Actualizar una ruta
	update: async (id, rutaData) => {
		try {
			const response = await api.put(`/api/rutas/${id}`, rutaData);
			toast.success(`Ruta "${rutaData.nombre}" actualizada exitosamente`);
			return response.data;
		} catch (error) {
			toast.error(`Error al actualizar ruta: ${error.message}`);
			throw error;
		}
	},

	// Eliminar una ruta
	delete: async (id) => {
		try {
			const response = await api.delete(`/api/rutas/${id}`);
			toast.success(`Ruta eliminada exitosamente`);
			return response.data;
		} catch (error) {
			toast.error(`Error al eliminar ruta: ${error.message}`);
			throw error;
		}
	}
};

export default rutasService;
