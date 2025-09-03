import { writable } from 'svelte/store';
import { camionesService } from '../services/camionesService.js';

// Store para camiones [[memory:7706467]]
export const camionesStore = writable({
	data: [],
	filteredData: [],
	loading: false,
	error: null,
	count: 0,
	// Filtros y búsqueda
	searchTerm: '',
	sortBy: 'id',
	sortOrder: 'asc',
	// Paginación
	currentPage: 1,
	itemsPerPage: 10,
	totalPages: 0
});

// Funciones para manejar el store
export const camionesActions = {
	// Cargar todos los camiones
	loadCamiones: async () => {
		camionesStore.update(store => ({ ...store, loading: true, error: null }));
		
		try {
			const response = await camionesService.getAll();
			camionesStore.update(store => {
				const newData = response.data || [];
				return {
					...store,
					data: newData,
					filteredData: newData,
					count: response.count || 0,
					loading: false,
					error: null,
					totalPages: Math.ceil(newData.length / store.itemsPerPage)
				};
			});
		} catch (error) {
			camionesStore.update(store => ({
				...store,
				loading: false,
				error: error.message || 'Error al cargar camiones'
			}));
		}
	},

	// Agregar un nuevo camión
	addCamion: async (camionData) => {
		try {
			const response = await camionesService.create(camionData);
			camionesStore.update(store => ({
				...store,
				data: [...store.data, response.data],
				count: store.count + 1
			}));
			return response;
		} catch (error) {
			camionesStore.update(store => ({
				...store,
				error: error.message || 'Error al crear camión'
			}));
			throw error;
		}
	},

	// Actualizar un camión
	updateCamion: async (id, camionData) => {
		try {
			const response = await camionesService.update(id, camionData);
			camionesStore.update(store => ({
				...store,
				data: store.data.map(camion => 
					camion.id === id ? { ...camion, ...response.data } : camion
				)
			}));
			return response;
		} catch (error) {
			camionesStore.update(store => ({
				...store,
				error: error.message || 'Error al actualizar camión'
			}));
			throw error;
		}
	},

	// Eliminar un camión
	deleteCamion: async (id) => {
		try {
			await camionesService.delete(id);
			camionesStore.update(store => ({
				...store,
				data: store.data.filter(camion => camion.id !== id),
				count: store.count - 1
			}));
		} catch (error) {
			camionesStore.update(store => ({
				...store,
				error: error.message || 'Error al eliminar camión'
			}));
			throw error;
		}
	},

	// Limpiar errores
	clearError: () => {
		camionesStore.update(store => ({ ...store, error: null }));
	},

	// Funcionalidades avanzadas
	// Búsqueda
	setSearchTerm: (searchTerm) => {
		camionesStore.update(store => {
			const filtered = store.data.filter(camion =>
				camion.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
				camion.id.toString().includes(searchTerm)
			);
			return {
				...store,
				searchTerm,
				filteredData: filtered,
				currentPage: 1,
				totalPages: Math.ceil(filtered.length / store.itemsPerPage)
			};
		});
	},

	// Ordenamiento
	setSorting: (sortBy, sortOrder) => {
		camionesStore.update(store => {
			const sorted = [...store.filteredData].sort((a, b) => {
				let aVal = a[sortBy];
				let bVal = b[sortBy];
				
				if (typeof aVal === 'string') {
					aVal = aVal.toLowerCase();
					bVal = bVal.toLowerCase();
				}
				
				if (sortOrder === 'asc') {
					return aVal > bVal ? 1 : -1;
				} else {
					return aVal < bVal ? 1 : -1;
				}
			});
			
			return {
				...store,
				sortBy,
				sortOrder,
				filteredData: sorted,
				currentPage: 1
			};
		});
	},

	// Paginación
	setPage: (page) => {
		camionesStore.update(store => ({
			...store,
			currentPage: page
		}));
	},

	setItemsPerPage: (itemsPerPage) => {
		camionesStore.update(store => ({
			...store,
			itemsPerPage,
			currentPage: 1,
			totalPages: Math.ceil(store.filteredData.length / itemsPerPage)
		}));
	},

	// Exportación
	exportData: (format = 'csv') => {
		camionesStore.subscribe(store => {
			const data = store.filteredData;
			
			if (format === 'csv') {
				const csvContent = [
					'ID,Nombre',
					...data.map(camion => `${camion.id},"${camion.nombre}"`)
				].join('\n');
				
				const blob = new Blob([csvContent], { type: 'text/csv' });
				const url = window.URL.createObjectURL(blob);
				const a = document.createElement('a');
				a.href = url;
				a.download = `camiones_${new Date().toISOString().split('T')[0]}.csv`;
				a.click();
				window.URL.revokeObjectURL(url);
			} else if (format === 'json') {
				const jsonContent = JSON.stringify(data, null, 2);
				const blob = new Blob([jsonContent], { type: 'application/json' });
				const url = window.URL.createObjectURL(blob);
				const a = document.createElement('a');
				a.href = url;
				a.download = `camiones_${new Date().toISOString().split('T')[0]}.json`;
				a.click();
				window.URL.revokeObjectURL(url);
			}
		})();
	}
};
