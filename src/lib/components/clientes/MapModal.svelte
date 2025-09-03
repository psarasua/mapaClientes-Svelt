<script>
	import { createEventDispatcher, onMount, afterUpdate, tick } from 'svelte';
	import { toast } from '$lib/stores/toastStore.js';
	
	export let show = false;
	export let cliente = null;
	
	const dispatch = createEventDispatcher();
	
	let mapContainer;
	let map;
	let marker;
	let leaflet;
	
	// Coordenadas por defecto (Buenos Aires centro si no hay coordenadas)
	$: lat = cliente?.latitud ? parseFloat(cliente.latitud) : -34.6118;
	$: lng = cliente?.longitud ? parseFloat(cliente.longitud) : -58.3960;
	$: hasCoordinates = cliente?.latitud && cliente?.longitud;
	
	const handleClose = () => {
		dispatch('close');
	};
	
	const handleBackdropClick = (event) => {
		if (event.target === event.currentTarget) {
			handleClose();
		}
	};
	
	const handleKeydown = (event) => {
		if (event.key === 'Escape') {
			handleClose();
		}
	};
	
	// Cargar Leaflet desde CDN
	const loadLeafletFromCDN = () => {
		return new Promise((resolve, reject) => {
			if (typeof window !== 'undefined' && window.L) {
				resolve(window.L);
				return;
			}
			
			// Verificar si ya existe el CSS
			if (!document.querySelector('link[href*="leaflet.css"]')) {
				const cssLink = document.createElement('link');
				cssLink.rel = 'stylesheet';
				cssLink.href = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css';
				cssLink.crossOrigin = '';
				document.head.appendChild(cssLink);
			}
			
			// Verificar si ya existe el script
			if (!document.querySelector('script[src*="leaflet.js"]')) {
				const script = document.createElement('script');
				script.src = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.js';
				script.crossOrigin = '';
				script.onload = () => {
					resolve(window.L);
				};
				script.onerror = (error) => {
					toast.error('Error al cargar Leaflet desde CDN');
					reject(new Error('Error al cargar Leaflet'));
				};
				document.head.appendChild(script);
			} else {
				// Si ya existe, esperar un poco y resolver
				setTimeout(() => {
					if (window.L) {
						resolve(window.L);
					} else {
						reject(new Error('Leaflet no disponible'));
					}
				}, 1000);
			}
		});
	};
	
	const initializeMap = async () => {
		if (!show || !mapContainer || map) return;
		
		try {
			// Esperar a que Leaflet esté disponible desde CDN
			if (typeof window !== 'undefined' && window.L) {
				leaflet = window.L;
			} else {
				await loadLeafletFromCDN();
				leaflet = window.L;
			}
			
			if (!leaflet) {
				throw new Error('Leaflet no pudo ser cargado');
			}
			
			// Crear el mapa
			map = leaflet.map(mapContainer, {
				zoomControl: true,
				attributionControl: true
			}).setView([lat, lng], hasCoordinates ? 15 : 11);
			
			// Agregar tiles de OpenStreetMap
			const tileLayer = leaflet.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
				attribution: '© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
				maxZoom: 19,
				minZoom: 1
			});
			
			tileLayer.addTo(map);
			
			// Crear icono personalizado
			const customIcon = leaflet.divIcon({
				html: `<div style="background-color: #dc3545; width: 20px; height: 20px; border-radius: 50%; border: 2px solid white; box-shadow: 0 2px 4px rgba(0,0,0,0.3);"></div>`,
				className: 'custom-marker',
				iconSize: [20, 20],
				iconAnchor: [10, 10]
			});
			
			// Agregar marcador
			if (hasCoordinates) {
				marker = leaflet.marker([lat, lng], { icon: customIcon })
					.addTo(map)
					.bindPopup(`
						<div class="p-2">
							<h6 class="mb-1"><i class="bi bi-shop me-1"></i>${cliente.nombre}</h6>
							<p class="mb-1 small text-muted">${cliente.razonsocial}</p>
							<p class="mb-1 small"><i class="bi bi-geo-alt me-1"></i>${cliente.direccion}</p>
							<p class="mb-0 small"><i class="bi bi-telephone me-1"></i>${cliente.telefono}</p>
						</div>
					`)
					.openPopup();
				
				toast.success(`Ubicación mostrada: ${cliente.nombre}`);
			} else {
				// Mostrar marcador en Buenos Aires centro con mensaje
				marker = leaflet.marker([lat, lng], { icon: customIcon })
					.addTo(map)
					.bindPopup(`
						<div class="p-2 text-center">
							<h6 class="mb-1 text-warning"><i class="bi bi-exclamation-triangle me-1"></i>Sin coordenadas</h6>
							<p class="mb-1 small">${cliente.nombre}</p>
							<p class="mb-0 small text-muted">Ubicación aproximada en Buenos Aires</p>
						</div>
					`)
					.openPopup();
				
				toast.warning(`Cliente sin coordenadas GPS: ${cliente.nombre}`);
			}
			
			// Invalidar tamaño del mapa para asegurar renderizado correcto
			setTimeout(() => {
				if (map) {
					map.invalidateSize(true);
				}
			}, 100);
			
			setTimeout(() => {
				if (map) {
					map.invalidateSize(true);
				}
			}, 300);
			
			setTimeout(() => {
				if (map) {
					map.invalidateSize(true);
					// Pequeño pan para activar el renderizado
					map.panBy([1, 0]);
					map.panBy([-1, 0]);
				}
			}, 1000);
			
		} catch (error) {
			toast.error(`Error al inicializar el mapa: ${error.message}`);
		}
	};
	
	const destroyMap = () => {
		if (map) {
			map.remove();
			map = null;
			marker = null;
		}
	};
	
	// Abrir Google Maps o Apple Maps
	const openInExternalMap = () => {
		if (hasCoordinates) {
			const url = `https://www.google.com/maps?q=${lat},${lng}`;
			window.open(url, '_blank');
			toast.info('Abriendo en Google Maps...');
		} else {
			const address = encodeURIComponent(cliente.direccion);
			const url = `https://www.google.com/maps/search/${address}`;
			window.open(url, '_blank');
			toast.info('Buscando dirección en Google Maps...');
		}
	};
	
	// Copiar coordenadas al portapapeles
	const copyCoordinates = async () => {
		if (hasCoordinates) {
			const coords = `${lat}, ${lng}`;
			try {
				await navigator.clipboard.writeText(coords);
				toast.success('Coordenadas copiadas al portapapeles');
			} catch (error) {
				toast.error('Error al copiar coordenadas');
			}
		}
	};
	
	// Usar afterUpdate para asegurar que el DOM esté listo
	afterUpdate(async () => {
		if (show && mapContainer && !map) {
			await tick(); // Asegurar que el DOM esté completamente renderizado
			setTimeout(() => {
				initializeMap();
			}, 150);
		}
	});
	
	$: if (!show) {
		destroyMap();
	}
	
	onMount(() => {
		return () => {
			destroyMap();
		};
	});
</script>

{#if show && cliente}
	<!-- Modal Backdrop -->
	<div 
		class="modal fade show d-block" 
		tabindex="0" 
		style="background-color: rgba(0,0,0,0.5);"
		on:click={handleBackdropClick}
		on:keydown={handleKeydown}
		role="dialog"
		aria-labelledby="mapModalLabel"
		aria-hidden="false"
	>
		<div class="modal-dialog modal-xl modal-dialog-centered">
			<div class="modal-content">
				<div class="modal-header">
					<h5 class="modal-title" id="mapModalLabel">
						<i class="bi bi-geo-alt me-2"></i>
						Ubicación: {cliente.nombre}
					</h5>
					<button 
						type="button" 
						class="btn-close" 
						aria-label="Close"
						on:click={handleClose}
					></button>
				</div>
				
				<div class="modal-body p-0">
					<!-- Información del cliente -->
					<div class="bg-light p-3 border-bottom">
						<div class="row align-items-center">
							<div class="col-md-8">
								<h6 class="mb-1">
									<i class="bi bi-shop me-1"></i>
									{cliente.nombre}
								</h6>
								<p class="mb-1 text-muted small">{cliente.razonsocial}</p>
								<p class="mb-0 small">
									<i class="bi bi-geo-alt me-1"></i>
									{cliente.direccion}
								</p>
							</div>
							<div class="col-md-4 text-end">
								{#if hasCoordinates}
									<span class="badge bg-success mb-2">
										<i class="bi bi-geo-alt-fill me-1"></i>
										GPS: {lat.toFixed(6)}, {lng.toFixed(6)}
									</span>
								{:else}
									<span class="badge bg-warning text-dark mb-2">
										<i class="bi bi-exclamation-triangle me-1"></i>
										Sin coordenadas GPS
									</span>
								{/if}
							</div>
						</div>
					</div>
					
					<!-- Mapa -->
					<div 
						bind:this={mapContainer}
						id="map-container-{cliente.id}"
						class="map-container"
						style="height: 400px; width: 100%; position: relative; background-color: #f0f0f0; z-index: 1;"
					>
						{#if !map}
							<div class="d-flex align-items-center justify-content-center h-100">
								<div class="text-center">
									<div class="spinner-border text-primary mb-2" role="status"></div>
									<small class="text-muted">Cargando mapa...</small>
								</div>
							</div>
						{/if}
					</div>
				</div>
				
				<div class="modal-footer">
					<div class="me-auto">
						{#if hasCoordinates}
							<button 
								class="btn btn-outline-secondary btn-sm me-2"
								on:click={copyCoordinates}
								title="Copiar coordenadas"
							>
								<i class="bi bi-clipboard me-1"></i>
								Copiar Coordenadas
							</button>
						{/if}
						<button 
							class="btn btn-outline-primary btn-sm"
							on:click={openInExternalMap}
							title="Abrir en Google Maps"
						>
							<i class="bi bi-map me-1"></i>
							Ver en Google Maps
						</button>
					</div>
					<button 
						type="button" 
						class="btn btn-secondary" 
						on:click={handleClose}
					>
						<i class="bi bi-x-lg me-1"></i>
						Cerrar
					</button>
				</div>
			</div>
		</div>
	</div>
{/if}

<style>
	:global(.custom-marker) {
		background: none !important;
		border: none !important;
	}
	
	.map-container {
		position: relative;
		z-index: 1;
		border: 1px solid #ddd;
		border-radius: 4px;
		overflow: hidden;
	}
	
	/* Asegurar que el mapa se vea correctamente */
	:global(.leaflet-container) {
		height: 400px !important;
		width: 100% !important;
		font-family: inherit !important;
		position: relative !important;
		z-index: 1 !important;
		background-color: #ddd !important;
	}
	
	/* Fix para tiles que no cargan */
	:global(.leaflet-tile) {
		max-width: none !important;
		width: 256px !important;
		height: 256px !important;
	}
	
	/* Asegurar que los controles se vean */
	:global(.leaflet-control-zoom) {
		margin: 10px !important;
		z-index: 1000 !important;
	}
	
	/* Forzar visibilidad de las capas */
	:global(.leaflet-map-pane) {
		z-index: 1 !important;
	}
	
	:global(.leaflet-tile-pane) {
		z-index: 1 !important;
	}
	
	/* Estilo para los popups */
	:global(.leaflet-popup-content) {
		margin: 0 !important;
	}
	
	:global(.leaflet-popup-content-wrapper) {
		border-radius: 8px !important;
	}
</style>
