<script>
	import { createEventDispatcher, onMount, afterUpdate, tick } from 'svelte';
	import { toast } from '$lib/stores/toastStore.js';
	import { clientesService } from '$lib/services/clientesService.js';
	
	export let show = false;
	export let reparto = null;
	export let clientesData = []; // Array de todos los clientes para obtener coordenadas
	
	const dispatch = createEventDispatcher();
	
	let mapContainer;
	let map;
	let markers = [];
	let leaflet;
	
	// Obtener cliente completo con coordenadas
	$: clienteCompleto = clientesData.find(c => c.id === reparto?.cliente_id) || null;
	$: hasCoordinates = clienteCompleto?.latitud && clienteCompleto?.longitud;
	$: lat = hasCoordinates ? parseFloat(clienteCompleto.latitud) : -34.6118;
	$: lng = hasCoordinates ? parseFloat(clienteCompleto.longitud) : -58.3960;
	
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
			
			// Crear iconos personalizados
			const clienteIcon = leaflet.divIcon({
				html: `<div style="background-color: #0d6efd; width: 25px; height: 25px; border-radius: 50%; border: 3px solid white; box-shadow: 0 2px 6px rgba(0,0,0,0.4); display: flex; align-items: center; justify-content: center;"><i class="bi bi-person-fill" style="color: white; font-size: 12px;"></i></div>`,
				className: 'cliente-marker',
				iconSize: [25, 25],
				iconAnchor: [12, 12]
			});
			
			const camionIcon = leaflet.divIcon({
				html: `<div style="background-color: #198754; width: 30px; height: 30px; border-radius: 50%; border: 3px solid white; box-shadow: 0 2px 6px rgba(0,0,0,0.4); display: flex; align-items: center; justify-content: center;"><i class="bi bi-truck" style="color: white; font-size: 14px;"></i></div>`,
				className: 'camion-marker',
				iconSize: [30, 30],
				iconAnchor: [15, 15]
			});
			
			// Agregar marcador del cliente
			if (hasCoordinates) {
				const clienteMarker = leaflet.marker([lat, lng], { icon: clienteIcon })
					.addTo(map)
					.bindPopup(`
						<div class="p-3">
							<h6 class="mb-2 text-primary">
								<i class="bi bi-person-badge me-1"></i>
								${clienteCompleto.nombre}
							</h6>
							<p class="mb-1 small text-muted">${clienteCompleto.razonsocial}</p>
							<p class="mb-1 small">
								<i class="bi bi-geo-alt me-1"></i>
								${clienteCompleto.direccion}
							</p>
							<p class="mb-1 small">
								<i class="bi bi-telephone me-1"></i>
								${clienteCompleto.telefono}
							</p>
							<hr class="my-2">
							<div class="row g-2 small">
								<div class="col-6">
									<strong>Camión:</strong><br>
									<span class="text-success">${reparto.camion_nombre}</span>
								</div>
								<div class="col-6">
									<strong>Ruta:</strong><br>
									<span class="text-info">${reparto.ruta_nombre}</span>
								</div>
							</div>
						</div>
					`)
					.openPopup();
				
				markers.push(clienteMarker);
				toast.success(`Ubicación del reparto mostrada: ${clienteCompleto.nombre}`);
			} else {
				// Mostrar marcador en Buenos Aires centro con mensaje
				const clienteMarker = leaflet.marker([lat, lng], { icon: clienteIcon })
					.addTo(map)
					.bindPopup(`
						<div class="p-3 text-center">
							<h6 class="mb-2 text-warning">
								<i class="bi bi-exclamation-triangle me-1"></i>
								Sin coordenadas GPS
							</h6>
							<p class="mb-1 small">${reparto.cliente_nombre}</p>
							<p class="mb-1 small text-muted">Ubicación aproximada en Buenos Aires</p>
							<hr class="my-2">
							<div class="small">
								<div><strong>Camión:</strong> ${reparto.camion_nombre}</div>
								<div><strong>Ruta:</strong> ${reparto.ruta_nombre}</div>
							</div>
						</div>
					`)
					.openPopup();
				
				markers.push(clienteMarker);
				toast.warning(`Cliente sin coordenadas GPS: ${reparto.cliente_nombre}`);
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
				}
			}, 1000);
			
		} catch (error) {
			toast.error(`Error al inicializar el mapa: ${error.message}`);
		}
	};
	
	const destroyMap = () => {
		if (map) {
			// Limpiar marcadores
			markers.forEach(marker => {
				map.removeLayer(marker);
			});
			markers = [];
			
			map.remove();
			map = null;
		}
	};
	
	// Abrir Google Maps
	const openInExternalMap = () => {
		if (hasCoordinates) {
			const url = `https://www.google.com/maps?q=${lat},${lng}`;
			window.open(url, '_blank');
			toast.info('Abriendo en Google Maps...');
		} else {
			const query = encodeURIComponent(`${reparto.cliente_nombre} ${reparto.ruta_nombre}`);
			const url = `https://www.google.com/maps/search/${query}`;
			window.open(url, '_blank');
			toast.info('Buscando en Google Maps...');
		}
	};
	
	// Copiar información del reparto
	const copyRepartoInfo = async () => {
		let info = `Reparto #${reparto.id}\nCliente: ${reparto.cliente_nombre}\nCamión: ${reparto.camion_nombre}\nRuta: ${reparto.ruta_nombre}`;
		if (hasCoordinates) {
			info += `\nCoordenadas: ${lat}, ${lng}`;
		}
		
		try {
			await navigator.clipboard.writeText(info);
			toast.success('Información del reparto copiada');
		} catch (error) {
			toast.error('Error al copiar información');
		}
	};
	
	// Usar afterUpdate para asegurar que el DOM esté listo
	afterUpdate(async () => {
		if (show && mapContainer && !map) {
			await tick();
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

{#if show && reparto}
	<!-- Modal Backdrop -->
	<div 
		class="modal fade show d-block" 
		tabindex="0" 
		style="background-color: rgba(0,0,0,0.5);"
		on:click={handleBackdropClick}
		on:keydown={handleKeydown}
		role="dialog"
		aria-labelledby="repartoMapModalLabel"
		aria-hidden="false"
	>
		<div class="modal-dialog modal-xl modal-dialog-centered">
			<div class="modal-content">
				<div class="modal-header">
					<h5 class="modal-title" id="repartoMapModalLabel">
						<i class="bi bi-geo-alt me-2"></i>
						Ubicación del Reparto #{reparto.id}
					</h5>
					<button 
						type="button" 
						class="btn-close" 
						aria-label="Close"
						on:click={handleClose}
					></button>
				</div>
				
				<div class="modal-body p-0">
					<!-- Información del reparto -->
					<div class="bg-light p-3 border-bottom">
						<div class="row">
							<div class="col-md-3">
								<h6 class="mb-1">
									<i class="bi bi-person-badge me-1 text-primary"></i>
									Cliente
								</h6>
								<p class="mb-0 small">
									<strong>{reparto.cliente_nombre}</strong>
								</p>
							</div>
							<div class="col-md-3">
								<h6 class="mb-1">
									<i class="bi bi-truck me-1 text-success"></i>
									Camión
								</h6>
								<p class="mb-0 small">
									<strong>{reparto.camion_nombre}</strong>
								</p>
							</div>
							<div class="col-md-3">
								<h6 class="mb-1">
									<i class="bi bi-signpost-2 me-1 text-info"></i>
									Ruta
								</h6>
								<p class="mb-0 small">
									<strong>{reparto.ruta_nombre}</strong>
								</p>
							</div>
							<div class="col-md-3 text-end">
								{#if hasCoordinates}
									<span class="badge bg-success">
										<i class="bi bi-geo-alt-fill me-1"></i>
										GPS Disponible
									</span>
									<br>
									<small class="text-muted">{lat.toFixed(6)}, {lng.toFixed(6)}</small>
								{:else}
									<span class="badge bg-warning text-dark">
										<i class="bi bi-exclamation-triangle me-1"></i>
										Sin GPS
									</span>
								{/if}
							</div>
						</div>
					</div>
					
					<!-- Mapa -->
					<div 
						bind:this={mapContainer}
						id="reparto-map-container-{reparto.id}"
						class="map-container"
						style="height: 450px; width: 100%; position: relative; background-color: #f0f0f0; z-index: 1;"
					>
						{#if !map}
							<div class="d-flex align-items-center justify-content-center h-100">
								<div class="text-center">
									<div class="spinner-border text-primary mb-2" role="status"></div>
									<small class="text-muted">Cargando mapa del reparto...</small>
								</div>
							</div>
						{/if}
					</div>
				</div>
				
				<div class="modal-footer">
					<div class="me-auto">
						<button 
							class="btn btn-outline-secondary btn-sm me-2"
							on:click={copyRepartoInfo}
							title="Copiar información del reparto"
						>
							<i class="bi bi-clipboard me-1"></i>
							Copiar Info
						</button>
						<button 
							class="btn btn-outline-primary btn-sm"
							on:click={openInExternalMap}
							title="Abrir en Google Maps"
						>
							<i class="bi bi-map me-1"></i>
							Google Maps
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
	:global(.cliente-marker) {
		background: none !important;
		border: none !important;
	}
	
	:global(.camion-marker) {
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
		height: 450px !important;
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
