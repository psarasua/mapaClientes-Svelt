import { writable } from 'svelte/store';
import { debounceStore } from 'svelte-legos';
import Fuse from 'fuse.js';

// Store para búsqueda avanzada con Fuse.js
export const createSearchStore = (data, options = {}) => {
	const searchTerm = writable('');
	const results = writable([]);
	const isSearching = writable(false);
	
	// Configuración por defecto para Fuse.js
	const defaultFuseOptions = {
		threshold: 0.3, // Tolerancia a errores (0 = exacto, 1 = cualquier cosa)
		includeScore: true,
		includeMatches: true,
		...options
	};
	
	let fuse = null;
	
	// Debounce la búsqueda para evitar muchas búsquedas mientras el usuario escribe
	const debouncedSearch = debounceStore(searchTerm, 300);
	
	// Actualizar índice de búsqueda cuando cambien los datos
	const updateIndex = (newData) => {
		if (newData && newData.length > 0) {
			fuse = new Fuse(newData, defaultFuseOptions);
		}
	};
	
	// Realizar búsqueda
	debouncedSearch.subscribe(term => {
		if (!fuse) {
			results.set([]);
			return;
		}
		
		isSearching.set(true);
		
		if (!term || term.trim() === '') {
			// Si no hay término, devolver todos los datos
			const allData = fuse.getIndex().docs || [];
			results.set(allData);
		} else {
			// Realizar búsqueda fuzzy
			const searchResults = fuse.search(term);
			results.set(searchResults.map(result => result.item));
		}
		
		isSearching.set(false);
	});
	
	return {
		searchTerm,
		results,
		isSearching,
		updateIndex,
		// Función para limpiar búsqueda
		clear: () => searchTerm.set('')
	};
};

export default createSearchStore;
