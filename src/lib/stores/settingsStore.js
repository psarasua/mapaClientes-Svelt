import { localStorageStore } from '../utils/stores.js';

// Configuraciones persistentes del usuario usando svelte-legos
export const userSettings = {
	// Preferencias de UI
	theme: localStorageStore('theme', 'light'),
	language: localStorageStore('language', 'es'),
	itemsPerPage: localStorageStore('itemsPerPage', 10),
	
	// Preferencias de mapas
	mapZoom: localStorageStore('mapZoom', 13),
	mapType: localStorageStore('mapType', 'openstreetmap'),
	
	// Preferencias de notificaciones
	showSuccessToasts: localStorageStore('showSuccessToasts', false),
	showInfoToasts: localStorageStore('showInfoToasts', false),
	
	// Layout preferences
	sidebarCollapsed: localStorageStore('sidebarCollapsed', false),
	compactMode: localStorageStore('compactMode', false),
	
	// Filtros guardados por sección
	clientesFilters: localStorageStore('clientesFilters', {
		sortBy: 'nombre',
		sortOrder: 'asc',
		filterByEstado: 'todos'
	}),
	
	rutasFilters: localStorageStore('rutasFilters', {
		sortBy: 'nombre',
		sortOrder: 'asc'
	}),
	
	camionesFilters: localStorageStore('camionesFilters', {
		sortBy: 'nombre',
		sortOrder: 'asc'
	}),
	
	repartosFilters: localStorageStore('repartosFilters', {
		sortBy: 'fecha',
		sortOrder: 'desc'
	})
};

// Acciones para configuraciones
export const settingsActions = {
	// Resetear todas las configuraciones
	resetAll: () => {
		Object.values(userSettings).forEach(store => {
			if (store && typeof store.set === 'function') {
				store.set(null);
			}
		});
	},
	
	// Exportar configuraciones
	export: () => {
		const config = {};
		Object.entries(userSettings).forEach(([key, store]) => {
			store.subscribe(value => {
				config[key] = value;
			})();
		});
		return config;
	},
	
	// Importar configuraciones
	import: (config) => {
		Object.entries(config).forEach(([key, value]) => {
			if (userSettings[key] && typeof userSettings[key].set === 'function') {
				userSettings[key].set(value);
			}
		});
	}
};

export default userSettings;
