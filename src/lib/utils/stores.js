import { writable } from 'svelte/store';
import { browser } from '$app/environment';

// Implementación manual de localStorageStore (más estable que svelte-legos)
export const localStorageStore = (key, defaultValue) => {
	const store = writable(defaultValue);
	
	if (browser) {
		// Inicializar con valor del localStorage
		const stored = localStorage.getItem(key);
		if (stored !== null) {
			try {
				const parsed = JSON.parse(stored);
				store.set(parsed);
			} catch (error) {
				// Si hay error al parsear, usar valor por defecto
				localStorage.removeItem(key);
				store.set(defaultValue);
			}
		}
		
		// Suscribirse a cambios y guardar en localStorage
		store.subscribe(value => {
			if (value === null || value === undefined) {
				localStorage.removeItem(key);
			} else {
				localStorage.setItem(key, JSON.stringify(value));
			}
		});
	}
	
	return store;
};

// Implementación manual de debounce
export const debounceStore = (store, delay) => {
	const debouncedStore = writable(null);
	let timeoutId = null;
	
	store.subscribe(value => {
		if (timeoutId) {
			clearTimeout(timeoutId);
		}
		
		timeoutId = setTimeout(() => {
			debouncedStore.set(value);
		}, delay);
	});
	
	return debouncedStore;
};

// Implementación manual de windowSize
export const windowSize = writable({ width: 0, height: 0 });

if (browser) {
	const updateSize = () => {
		windowSize.set({
			width: window.innerWidth,
			height: window.innerHeight
		});
	};
	
	// Inicializar
	updateSize();
	
	// Escuchar cambios
	window.addEventListener('resize', updateSize);
}

// Implementación manual de onlineStore
export const onlineStore = writable(true);

if (browser) {
	// Inicializar
	onlineStore.set(navigator.onLine);
	
	// Escuchar cambios de conectividad
	window.addEventListener('online', () => onlineStore.set(true));
	window.addEventListener('offline', () => onlineStore.set(false));
}
