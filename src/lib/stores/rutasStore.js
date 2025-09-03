import { writable } from 'svelte/store';
import { rutasService } from '../services/rutasService.js';

// Store para rutas [[memory:7706467]]
export const rutasStore = writable({
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
export const rutasActions = {
	// Cargar todas las rutas
	loadRutas: async () => {
		rutasStore.update(store => ({ ...store, loading: true, error: null }));
		
		try {
			const response = await rutasService.getAll();
			rutasStore.update(store => {
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
			rutasStore.update(store => ({
				...store,
				loading: false,
				error: error.message || 'Error al cargar rutas'
			}));
		}
	},

	// Agregar una nueva ruta
	addRuta: async (rutaData) => {
		try {
			const response = await rutasService.create(rutaData);
			rutasStore.update(store => ({
				...store,
				data: [...store.data, response.data],
				count: store.count + 1
			}));
			return response;
		} catch (error) {
			rutasStore.update(store => ({
				...store,
				error: error.message || 'Error al crear ruta'
			}));
			throw error;
		}
	},

	// Actualizar una ruta
	updateRuta: async (id, rutaData) => {
		try {
			const response = await rutasService.update(id, rutaData);
			rutasStore.update(store => ({
				...store,
				data: store.data.map(ruta => 
					ruta.id === id ? { ...ruta, ...response.data } : ruta
				)
			}));
			return response;
		} catch (error) {
			rutasStore.update(store => ({
				...store,
				error: error.message || 'Error al actualizar ruta'
			}));
			throw error;
		}
	},

	// Eliminar una ruta
	deleteRuta: async (id) => {
		try {
			await rutasService.delete(id);
			rutasStore.update(store => ({
				...store,
				data: store.data.filter(ruta => ruta.id !== id),
				count: store.count - 1
			}));
		} catch (error) {
			rutasStore.update(store => ({
				...store,
				error: error.message || 'Error al eliminar ruta'
			}));
			throw error;
		}
	},

	// Limpiar errores
	clearError: () => {
		rutasStore.update(store => ({ ...store, error: null }));
	},

	// Funcionalidades avanzadas
	// Búsqueda
	setSearchTerm: (searchTerm) => {
		rutasStore.update(store => {
			const filtered = store.data.filter(ruta =>
				ruta.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
				ruta.id.toString().includes(searchTerm)
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
		rutasStore.update(store => {
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
		rutasStore.update(store => ({
			...store,
			currentPage: page
		}));
	},

	setItemsPerPage: (itemsPerPage) => {
		rutasStore.update(store => ({
			...store,
			itemsPerPage,
			currentPage: 1,
			totalPages: Math.ceil(store.filteredData.length / itemsPerPage)
		}));
	},

	// Exportación
	exportData: (format = 'csv') => {
		rutasStore.subscribe(store => {
			const data = store.filteredData;
			
			if (format === 'csv') {
				const csvContent = [
					'ID,Nombre',
					...data.map(ruta => `${ruta.id},"${ruta.nombre}"`)
				].join('\n');
				
				const blob = new Blob([csvContent], { type: 'text/csv' });
				const url = window.URL.createObjectURL(blob);
				const a = document.createElement('a');
				a.href = url;
				a.download = `rutas_${new Date().toISOString().split('T')[0]}.csv`;
				a.click();
				window.URL.revokeObjectURL(url);
			} else if (format === 'json') {
				const jsonContent = JSON.stringify(data, null, 2);
				const blob = new Blob([jsonContent], { type: 'application/json' });
				const url = window.URL.createObjectURL(blob);
				const a = document.createElement('a');
				a.href = url;
				a.download = `rutas_${new Date().toISOString().split('T')[0]}.json`;
				a.click();
				window.URL.revokeObjectURL(url);
			}
		})();
	}
};
