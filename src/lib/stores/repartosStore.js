import { writable } from 'svelte/store';
import { repartosService } from '../services/repartosService.js';

// Store para repartos [[memory:7706467]]
export const repartosStore = writable({
	data: [], // Datos originales de la API
	groupedData: [], // Datos agrupados por camión+ruta
	filteredData: [], // Datos filtrados
	loading: false,
	error: null,
	count: 0,
	// Filtros específicos para repartos
	searchTerm: '',
	sortBy: 'camion_nombre',
	sortOrder: 'asc',
	filterByCamion: 'todos',
	filterByRuta: 'todos',
	// Paginación
	currentPage: 1,
	itemsPerPage: 10, // Menos elementos porque cada grupo puede tener múltiples clientes
	totalPages: 0
});

// Función para agrupar repartos por camión + ruta
const groupRepartos = (repartos) => {
	const groups = {};
	
	repartos.forEach(reparto => {
		const key = `${reparto.camion_id}-${reparto.ruta_id}`;
		
		if (!groups[key]) {
			groups[key] = {
				id: key,
				camion_id: reparto.camion_id,
				camion_nombre: reparto.camion_nombre,
				ruta_id: reparto.ruta_id,
				ruta_nombre: reparto.ruta_nombre,
				clientes: [],
				total_clientes: 0
			};
		}
		
		groups[key].clientes.push({
			id: reparto.id,
			cliente_id: reparto.cliente_id,
			cliente_nombre: reparto.cliente_nombre
		});
		groups[key].total_clientes = groups[key].clientes.length;
	});
	
	return Object.values(groups);
};

// Funciones para manejar el store
export const repartosActions = {
	// Cargar todos los repartos
	loadRepartos: async () => {
		repartosStore.update(store => ({ ...store, loading: true, error: null }));
		
		try {
			const response = await repartosService.getAll();
			repartosStore.update(store => {
				const rawData = response.data || [];
				const groupedData = groupRepartos(rawData);
				
				return {
					...store,
					data: rawData,
					groupedData: groupedData,
					filteredData: groupedData,
					count: response.count || 0,
					loading: false,
					error: null,
					totalPages: Math.ceil(groupedData.length / store.itemsPerPage)
				};
			});
		} catch (error) {
			repartosStore.update(store => ({
				...store,
				loading: false,
				error: error.message || 'Error al cargar repartos'
			}));
		}
	},

	// Agregar un nuevo reparto
	addReparto: async (repartoData) => {
		try {
			const response = await repartosService.create(repartoData);
			repartosStore.update(store => ({
				...store,
				data: [response.data, ...store.data], // Agregar al inicio
				count: store.count + 1
			}));
			return response;
		} catch (error) {
			repartosStore.update(store => ({
				...store,
				error: error.message || 'Error al crear reparto'
			}));
			throw error;
		}
	},

	// Actualizar un reparto
	updateReparto: async (id, repartoData) => {
		try {
			const response = await repartosService.update(id, repartoData);
			repartosStore.update(store => ({
				...store,
				data: store.data.map(reparto => 
					reparto.id === id ? { ...reparto, ...response.data } : reparto
				)
			}));
			return response;
		} catch (error) {
			repartosStore.update(store => ({
				...store,
				error: error.message || 'Error al actualizar reparto'
			}));
			throw error;
		}
	},

	// Eliminar un reparto
	deleteReparto: async (id) => {
		try {
			await repartosService.delete(id);
			repartosStore.update(store => ({
				...store,
				data: store.data.filter(reparto => reparto.id !== id),
				count: store.count - 1
			}));
		} catch (error) {
			repartosStore.update(store => ({
				...store,
				error: error.message || 'Error al eliminar reparto'
			}));
			throw error;
		}
	},

	// Limpiar errores
	clearError: () => {
		repartosStore.update(store => ({ ...store, error: null }));
	},

	// Funcionalidades avanzadas específicas para repartos
	// Búsqueda avanzada en grupos
	setSearchTerm: (searchTerm) => {
		repartosStore.update(store => {
			let filtered = store.groupedData.filter(grupo =>
				grupo.camion_nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
				grupo.ruta_nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
				grupo.clientes.some(cliente => 
					cliente.cliente_nombre.toLowerCase().includes(searchTerm.toLowerCase())
				)
			);
			
			// Aplicar filtros si están activos
			if (store.filterByCamion !== 'todos') {
				filtered = filtered.filter(grupo => grupo.camion_id.toString() === store.filterByCamion);
			}
			
			if (store.filterByRuta !== 'todos') {
				filtered = filtered.filter(grupo => grupo.ruta_id.toString() === store.filterByRuta);
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

	// Filtro por camión
	setFilterByCamion: (camionId) => {
		repartosStore.update(store => {
			let filtered = store.groupedData;
			
			// Aplicar filtro de camión
			if (camionId !== 'todos') {
				filtered = filtered.filter(grupo => grupo.camion_id.toString() === camionId);
			}
			
			// Aplicar filtro de ruta si está activo
			if (store.filterByRuta !== 'todos') {
				filtered = filtered.filter(grupo => grupo.ruta_id.toString() === store.filterByRuta);
			}
			
			// Aplicar búsqueda si está activa
			if (store.searchTerm) {
				filtered = filtered.filter(grupo =>
					grupo.camion_nombre.toLowerCase().includes(store.searchTerm.toLowerCase()) ||
					grupo.ruta_nombre.toLowerCase().includes(store.searchTerm.toLowerCase()) ||
					grupo.clientes.some(cliente => 
						cliente.cliente_nombre.toLowerCase().includes(store.searchTerm.toLowerCase())
					)
				);
			}
			
			return {
				...store,
				filterByCamion: camionId,
				filteredData: filtered,
				currentPage: 1,
				totalPages: Math.ceil(filtered.length / store.itemsPerPage)
			};
		});
	},

	// Filtro por ruta
	setFilterByRuta: (rutaId) => {
		repartosStore.update(store => {
			let filtered = store.groupedData;
			
			// Aplicar filtro de ruta
			if (rutaId !== 'todos') {
				filtered = filtered.filter(grupo => grupo.ruta_id.toString() === rutaId);
			}
			
			// Aplicar filtro de camión si está activo
			if (store.filterByCamion !== 'todos') {
				filtered = filtered.filter(grupo => grupo.camion_id.toString() === store.filterByCamion);
			}
			
			// Aplicar búsqueda si está activa
			if (store.searchTerm) {
				filtered = filtered.filter(grupo =>
					grupo.camion_nombre.toLowerCase().includes(store.searchTerm.toLowerCase()) ||
					grupo.ruta_nombre.toLowerCase().includes(store.searchTerm.toLowerCase()) ||
					grupo.clientes.some(cliente => 
						cliente.cliente_nombre.toLowerCase().includes(store.searchTerm.toLowerCase())
					)
				);
			}
			
			return {
				...store,
				filterByRuta: rutaId,
				filteredData: filtered,
				currentPage: 1,
				totalPages: Math.ceil(filtered.length / store.itemsPerPage)
			};
		});
	},

	// Ordenamiento
	setSorting: (sortBy, sortOrder) => {
		repartosStore.update(store => {
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
		repartosStore.update(store => ({
			...store,
			currentPage: page
		}));
	},

	setItemsPerPage: (itemsPerPage) => {
		repartosStore.update(store => ({
			...store,
			itemsPerPage,
			currentPage: 1,
			totalPages: Math.ceil(store.filteredData.length / itemsPerPage)
		}));
	},

	// Exportación con datos específicos de repartos
	exportData: (format = 'csv') => {
		repartosStore.subscribe(store => {
			const data = store.filteredData;
			
			if (format === 'csv') {
				const csvContent = [
					'ID,Cliente ID,Cliente,Camión ID,Camión,Ruta ID,Ruta',
					...data.map(reparto => 
						`${reparto.id},"${reparto.cliente_id}","${reparto.cliente_nombre}","${reparto.camion_id}","${reparto.camion_nombre}","${reparto.ruta_id}","${reparto.ruta_nombre}"`
					)
				].join('\n');
				
				const blob = new Blob([csvContent], { type: 'text/csv' });
				const url = window.URL.createObjectURL(blob);
				const a = document.createElement('a');
				a.href = url;
				a.download = `repartos_${new Date().toISOString().split('T')[0]}.csv`;
				a.click();
				window.URL.revokeObjectURL(url);
			} else if (format === 'json') {
				const jsonContent = JSON.stringify(data, null, 2);
				const blob = new Blob([jsonContent], { type: 'application/json' });
				const url = window.URL.createObjectURL(blob);
				const a = document.createElement('a');
				a.href = url;
				a.download = `repartos_${new Date().toISOString().split('T')[0]}.json`;
				a.click();
				window.URL.revokeObjectURL(url);
			}
		})();
	},

	// Obtener estadísticas
	getStats: () => {
		let stats = { 
			totalRepartos: 0, 
			camionesActivos: new Set(), 
			rutasActivas: new Set(),
			clientesAsignados: new Set()
		};
		
		repartosStore.subscribe(store => {
			stats.totalRepartos = store.data.length;
			store.data.forEach(reparto => {
				stats.camionesActivos.add(reparto.camion_id);
				stats.rutasActivas.add(reparto.ruta_id);
				stats.clientesAsignados.add(reparto.cliente_id);
			});
		})();
		
		return {
			totalRepartos: stats.totalRepartos,
			camionesActivos: stats.camionesActivos.size,
			rutasActivas: stats.rutasActivas.size,
			clientesAsignados: stats.clientesAsignados.size
		};
	}
};
