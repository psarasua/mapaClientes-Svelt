import { writable } from 'svelte/store';
import { debounceStore } from '../utils/stores.js';
import { clientesService } from '../services/clientesService.js';
import Fuse from 'fuse.js';

// Store para clientes [[memory:7706467]]
export const clientesStore = writable({
	data: [],
	filteredData: [],
	loading: false,
	error: null,
	count: 0,
	// Filtros y búsqueda específicos para clientes
	searchTerm: '',
	sortBy: 'id',
	sortOrder: 'asc',
	filterByEstado: 'todos', // 'todos', 'Activo', 'Inactivo'
	// Paginación
	currentPage: 1,
	itemsPerPage: 10,
	totalPages: 0,
	// Índice de búsqueda Fuse.js
	fuseIndex: null
});

// Configuración de búsqueda Fuse.js para clientes
const fuseOptions = {
	keys: [
		{ name: 'nombre', weight: 2 }, // Prioridad alta al nombre
		{ name: 'razonsocial', weight: 1.5 },
		{ name: 'direccion', weight: 1 },
		{ name: 'telefono', weight: 0.5 },
		{ name: 'email', weight: 0.5 }
	],
	threshold: 0.3,
	includeScore: true,
	includeMatches: true
};

// Funciones para manejar el store
export const clientesActions = {
	// Cargar todos los clientes
	loadClientes: async () => {
		clientesStore.update(store => ({ ...store, loading: true, error: null }));
		
		try {
			const response = await clientesService.getAll();
			clientesStore.update(store => {
				const newData = response.data || [];
				// Crear índice Fuse.js para búsqueda avanzada
				const fuseIndex = newData.length > 0 ? new Fuse(newData, fuseOptions) : null;
				
				return {
					...store,
					data: newData,
					filteredData: newData,
					count: response.count || 0,
					loading: false,
					error: null,
					totalPages: Math.ceil(newData.length / store.itemsPerPage),
					fuseIndex
				};
			});
		} catch (error) {
			clientesStore.update(store => ({
				...store,
				loading: false,
				error: error.message || 'Error al cargar clientes'
			}));
		}
	},

	// Agregar un nuevo cliente
	addCliente: async (clienteData) => {
		try {
			const response = await clientesService.create(clienteData);
			clientesStore.update(store => ({
				...store,
				data: [...store.data, response.data],
				count: store.count + 1
			}));
			return response;
		} catch (error) {
			clientesStore.update(store => ({
				...store,
				error: error.message || 'Error al crear cliente'
			}));
			throw error;
		}
	},

	// Actualizar un cliente
	updateCliente: async (id, clienteData) => {
		try {
			const response = await clientesService.update(id, clienteData);
			clientesStore.update(store => ({
				...store,
				data: store.data.map(cliente => 
					cliente.id === id ? { ...cliente, ...response.data } : cliente
				)
			}));
			return response;
		} catch (error) {
			clientesStore.update(store => ({
				...store,
				error: error.message || 'Error al actualizar cliente'
			}));
			throw error;
		}
	},

	// Eliminar un cliente
	deleteCliente: async (id) => {
		try {
			await clientesService.delete(id);
			clientesStore.update(store => ({
				...store,
				data: store.data.filter(cliente => cliente.id !== id),
				count: store.count - 1
			}));
		} catch (error) {
			clientesStore.update(store => ({
				...store,
				error: error.message || 'Error al eliminar cliente'
			}));
			throw error;
		}
	},

	// Limpiar errores
	clearError: () => {
		clientesStore.update(store => ({ ...store, error: null }));
	},

	// Búsqueda avanzada con Fuse.js
	setSearchTerm: (searchTerm) => {
		clientesStore.update(store => {
			let filtered = store.data;
			
			if (searchTerm && searchTerm.trim() !== '') {
				// Usar Fuse.js para búsqueda inteligente
				if (store.fuseIndex) {
					const searchResults = store.fuseIndex.search(searchTerm);
					filtered = searchResults.map(result => result.item);
				} else {
					// Fallback a búsqueda básica si no hay índice
					filtered = store.data.filter(cliente =>
						cliente.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
						cliente.razonsocial.toLowerCase().includes(searchTerm.toLowerCase()) ||
						cliente.codigoalte.toLowerCase().includes(searchTerm.toLowerCase()) ||
						cliente.direccion.toLowerCase().includes(searchTerm.toLowerCase()) ||
						cliente.telefono.includes(searchTerm) ||
						cliente.rut.includes(searchTerm) ||
						cliente.id.toString().includes(searchTerm)
					);
				}
			}
			
			// Aplicar filtro de estado si está activo
			if (store.filterByEstado !== 'todos') {
				filtered = filtered.filter(cliente => cliente.estado === store.filterByEstado);
			}
			
			return {
				...store,
				searchTerm,
				filteredData: filtered,
				currentPage: 1,
				totalPages: Math.ceil(filtered.length / store.itemsPerPage)
			};
		});
	},

	// Filtro por estado
	setFilterByEstado: (estado) => {
		clientesStore.update(store => {
			let filtered = store.data;
			
			// Aplicar búsqueda si está activa
			if (store.searchTerm) {
				filtered = filtered.filter(cliente =>
					cliente.nombre.toLowerCase().includes(store.searchTerm.toLowerCase()) ||
					cliente.razonsocial.toLowerCase().includes(store.searchTerm.toLowerCase()) ||
					cliente.codigoalte.toLowerCase().includes(store.searchTerm.toLowerCase()) ||
					cliente.direccion.toLowerCase().includes(store.searchTerm.toLowerCase()) ||
					cliente.telefono.includes(store.searchTerm) ||
					cliente.rut.includes(store.searchTerm) ||
					cliente.id.toString().includes(store.searchTerm)
				);
			}
			
			// Aplicar filtro de estado
			if (estado !== 'todos') {
				filtered = filtered.filter(cliente => cliente.estado === estado);
			}
			
			return {
				...store,
				filterByEstado: estado,
				filteredData: filtered,
				currentPage: 1,
				totalPages: Math.ceil(filtered.length / store.itemsPerPage)
			};
		});
	},

	// Ordenamiento
	setSorting: (sortBy, sortOrder) => {
		clientesStore.update(store => {
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
		clientesStore.update(store => ({
			...store,
			currentPage: page
		}));
	},

	setItemsPerPage: (itemsPerPage) => {
		clientesStore.update(store => ({
			...store,
			itemsPerPage,
			currentPage: 1,
			totalPages: Math.ceil(store.filteredData.length / itemsPerPage)
		}));
	},

	// Exportación con datos específicos de clientes
	exportData: (format = 'csv') => {
		clientesStore.subscribe(store => {
			const data = store.filteredData;
			
			if (format === 'csv') {
				const csvContent = [
					'ID,Código,Razón Social,Nombre,Dirección,Teléfono,RUT,Estado,Latitud,Longitud',
					...data.map(cliente => 
						`${cliente.id},"${cliente.codigoalte}","${cliente.razonsocial}","${cliente.nombre}","${cliente.direccion}","${cliente.telefono}","${cliente.rut}","${cliente.estado}","${cliente.latitud}","${cliente.longitud}"`
					)
				].join('\n');
				
				const blob = new Blob([csvContent], { type: 'text/csv' });
				const url = window.URL.createObjectURL(blob);
				const a = document.createElement('a');
				a.href = url;
				a.download = `clientes_${new Date().toISOString().split('T')[0]}.csv`;
				a.click();
				window.URL.revokeObjectURL(url);
			} else if (format === 'json') {
				const jsonContent = JSON.stringify(data, null, 2);
				const blob = new Blob([jsonContent], { type: 'application/json' });
				const url = window.URL.createObjectURL(blob);
				const a = document.createElement('a');
				a.href = url;
				a.download = `clientes_${new Date().toISOString().split('T')[0]}.json`;
				a.click();
				window.URL.revokeObjectURL(url);
			}
		})();
	},

	// Obtener estadísticas
	getStats: () => {
		let stats = { activos: 0, inactivos: 0, total: 0 };
		
		clientesStore.subscribe(store => {
			stats.total = store.data.length;
			stats.activos = store.data.filter(c => c.estado === 'Activo').length;
			stats.inactivos = store.data.filter(c => c.estado === 'Inactivo').length;
		})();
		
		return stats;
	}
};
