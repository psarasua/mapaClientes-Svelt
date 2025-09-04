<script>
	import { createEventDispatcher, onMount, afterUpdate, tick } from 'svelte';
	import { toast } from '$lib/stores/toastStore.js';
	
	export let show = false;
	export let repartoGroup = null; // Grupo de repartos (camión + ruta + múltiples clientes)
	export let clientesData = []; // Array de todos los clientes para obtener coordenadas
	
	const dispatch = createEventDispatcher();
	
	let mapContainer;
	let map;
	let markers = [];
	let leaflet;
	
	// Obtener clientes completos con coordenadas
	$: clientesCompletos = repartoGroup ? 
		repartoGroup.clientes.map(cliente => {
			const clienteCompleto = clientesData.find(c => c.id === cliente.cliente_id);
			return { ...cliente, ...clienteCompleto };
		}).filter(c => c.latitud && c.longitud) : [];
	
	$: clientesSinGPS = repartoGroup ? 
		repartoGroup.clientes.map(cliente => {
			const clienteCompleto = clientesData.find(c => c.id === cliente.cliente_id);
			return { ...cliente, ...clienteCompleto };
		}).filter(c => !c.latitud || !c.longitud) : [];
	
	// Calcular centro del mapa basado en todos los clientes
	$: centerLat = clientesCompletos.length > 0 ? 
		clientesCompletos.reduce((sum, c) => sum + parseFloat(c.latitud), 0) / clientesCompletos.length : 
		-34.6118;
	
	$: centerLng = clientesCompletos.length > 0 ? 
		clientesCompletos.reduce((sum, c) => sum + parseFloat(c.longitud), 0) / clientesCompletos.length : 
		-58.3960;
	
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
			
			if (!document.querySelector('link[href*="leaflet.css"]')) {
				const cssLink = document.createElement('link');
				cssLink.rel = 'stylesheet';
				cssLink.href = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css';
				cssLink.crossOrigin = '';
				document.head.appendChild(cssLink);
			}
			
			if (!document.querySelector('script[src*="leaflet.js"]')) {
				const script = document.createElement('script');
				script.src = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.js';
				script.crossOrigin = '';
				script.onload = () => resolve(window.L);
				script.onerror = () => {
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
			if (typeof window !== 'undefined' && window.L) {
				leaflet = window.L;
			} else {
				await loadLeafletFromCDN();
				leaflet = window.L;
			}
			
			if (!leaflet) {
				throw new Error('Leaflet no pudo ser cargado');
			}
			
			// Crear el mapa centrado en los clientes
			map = leaflet.map(mapContainer, {
				zoomControl: true,
				attributionControl: true
			}).setView([centerLat, centerLng], clientesCompletos.length > 0 ? 13 : 11);
			
			// Agregar tiles de OpenStreetMap
			leaflet.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
				attribution: '© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
				maxZoom: 19,
				minZoom: 1
			}).addTo(map);
			
			// Crear iconos personalizados
			const clienteIcon = leaflet.divIcon({
				html: `<div style="background-color: #0d6efd; width: 25px; height: 25px; border-radius: 50%; border: 3px solid white; box-shadow: 0 2px 6px rgba(0,0,0,0.4); display: flex; align-items: center; justify-content: center; color: white; font-size: 12px; font-weight: bold;">📍</div>`,
				className: 'cliente-marker',
				iconSize: [25, 25],
				iconAnchor: [12, 12]
			});
			
			// Agregar marcadores para todos los clientes con GPS
			clientesCompletos.forEach((cliente, index) => {
				const lat = parseFloat(cliente.latitud);
				const lng = parseFloat(cliente.longitud);
				
				const marker = leaflet.marker([lat, lng], { icon: clienteIcon })
					.addTo(map)
					.bindPopup(`
						<div class="p-3">
							<div class="d-flex align-items-center mb-2">
								<span class="badge bg-primary me-2">${index + 1}</span>
								<h6 class="mb-0 text-primary">${cliente.cliente_nombre}</h6>
							</div>
							<p class="mb-1 small text-muted">${cliente.razonsocial || 'No disponible'}</p>
							<p class="mb-1 small">
								<i class="bi bi-geo-alt me-1"></i>
								${cliente.direccion || 'Dirección no disponible'}
							</p>
							<p class="mb-1 small">
								<i class="bi bi-telephone me-1"></i>
								${cliente.telefono || 'Teléfono no disponible'}
							</p>
							<hr class="my-2">
							<div class="small">
								<div class="text-success">
									<i class="bi bi-truck me-1"></i>
									<strong>Camión:</strong> ${repartoGroup.camion_nombre}
								</div>
								<div class="text-info">
									<i class="bi bi-signpost-2 me-1"></i>
									<strong>Ruta:</strong> ${repartoGroup.ruta_nombre}
								</div>
							</div>
						</div>
					`);
				
				markers.push(marker);
			});
			
			// Ajustar vista para mostrar todos los marcadores
			if (clientesCompletos.length > 1) {
				const group = leaflet.featureGroup(markers);
				map.fitBounds(group.getBounds().pad(0.1));
			} else if (clientesCompletos.length === 1) {
				// Si solo hay un cliente, hacer zoom a su ubicación
				map.setView([parseFloat(clientesCompletos[0].latitud), parseFloat(clientesCompletos[0].longitud)], 15);
			}
			
			// Invalidar tamaño del mapa
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
			
			// Notificaciones
			if (clientesCompletos.length > 0) {
				toast.success(`Mapa cargado con ${clientesCompletos.length} ubicaciones`);
			}
			
			if (clientesSinGPS.length > 0) {
				toast.warning(`${clientesSinGPS.length} clientes sin coordenadas GPS`);
			}
			
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
	
	// Abrir Google Maps con múltiples puntos
	const openInExternalMap = () => {
		if (clientesCompletos.length === 1) {
			// Un solo cliente
			const cliente = clientesCompletos[0];
			const url = `https://www.google.com/maps?q=${cliente.latitud},${cliente.longitud}`;
			window.open(url, '_blank');
		} else if (clientesCompletos.length > 1) {
			// Múltiples clientes - crear ruta
			const waypoints = clientesCompletos.map(c => `${c.latitud},${c.longitud}`).join('/');
			const url = `https://www.google.com/maps/dir/${waypoints}`;
			window.open(url, '_blank');
		} else {
			// Sin coordenadas, buscar por nombres
			const query = encodeURIComponent(`${repartoGroup.camion_nombre} ${repartoGroup.ruta_nombre}`);
			const url = `https://www.google.com/maps/search/${query}`;
			window.open(url, '_blank');
		}
		toast.info('Abriendo ruta en Google Maps...');
	};
	
	// Copiar información del grupo de repartos
	const copyGroupInfo = async () => {
		let info = `Reparto: ${repartoGroup.camion_nombre} - ${repartoGroup.ruta_nombre}\n`;
		info += `Total clientes: ${repartoGroup.total_clientes}\n\n`;
		info += `Clientes asignados:\n`;
		
		repartoGroup.clientes.forEach((cliente, index) => {
			const clienteCompleto = clientesData.find(c => c.id === cliente.cliente_id);
			info += `${index + 1}. ${cliente.cliente_nombre}`;
			if (clienteCompleto?.direccion) {
				info += ` - ${clienteCompleto.direccion}`;
			}
			info += `\n`;
		});
		
		if (clientesCompletos.length > 0) {
			info += `\nUbicaciones GPS:\n`;
			clientesCompletos.forEach((cliente, index) => {
				info += `${index + 1}. ${cliente.cliente_nombre}: ${cliente.latitud}, ${cliente.longitud}\n`;
			});
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

{#if show && repartoGroup}
	<!-- Modal Backdrop -->
	<!-- svelte-ignore a11y-click-events-have-key-events -->
	<!-- svelte-ignore a11y-no-noninteractive-element-interactions -->
	<div 
		class="modal fade show d-block" 
		tabindex="-1" 
		style="background-color: rgba(0,0,0,0.5);"
		on:click={handleBackdropClick}
		on:keydown={handleKeydown}
		role="dialog"
		aria-labelledby="repartoGroupMapModalLabel"
		aria-hidden="false"
		aria-modal="true"
	>
		<div class="modal-dialog modal-xl modal-dialog-centered">
			<div class="modal-content">
				<div class="modal-header">
					<h5 class="modal-title" id="repartoGroupMapModalLabel">
						<i class="bi bi-geo-alt me-2"></i>
						Mapa del Reparto: {repartoGroup.camion_nombre}
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
									<i class="bi bi-truck me-1 text-success"></i>
									Camión
								</h6>
								<p class="mb-0">
									<strong>{repartoGroup.camion_nombre}</strong>
								</p>
							</div>
							<div class="col-md-4">
								<h6 class="mb-1">
									<i class="bi bi-signpost-2 me-1 text-info"></i>
									Ruta
								</h6>
								<p class="mb-0">
									<strong>{repartoGroup.ruta_nombre}</strong>
								</p>
							</div>
							<div class="col-md-3">
								<h6 class="mb-1">
									<i class="bi bi-people me-1 text-primary"></i>
									Clientes
								</h6>
								<p class="mb-0">
									<span class="badge bg-primary">{repartoGroup.total_clientes}</span>
									total asignados
								</p>
							</div>
							<div class="col-md-2 text-end">
								<div class="d-flex flex-column gap-1">
									<span class="badge bg-success">
										<i class="bi bi-geo-alt-fill me-1"></i>
										{clientesCompletos.length} con GPS
									</span>
									{#if clientesSinGPS.length > 0}
										<span class="badge bg-warning text-dark">
											<i class="bi bi-exclamation-triangle me-1"></i>
											{clientesSinGPS.length} sin GPS
										</span>
									{/if}
								</div>
							</div>
						</div>
					</div>
					
					<!-- Lista de clientes -->
					<div class="p-3 border-bottom bg-white">
						<h6 class="mb-2">
							<i class="bi bi-list-ul me-1"></i>
							Clientes en esta Ruta:
						</h6>
						<div class="row">
							{#each repartoGroup.clientes as cliente, index}
								{@const clienteCompleto = clientesData.find(c => c.id === cliente.cliente_id)}
								<div class="col-md-6 col-lg-4 mb-2">
									<div class="d-flex align-items-center">
										<span class="badge bg-primary me-2">{index + 1}</span>
										<div class="flex-grow-1">
											<strong class="small">{cliente.cliente_nombre}</strong>
											{#if clienteCompleto?.latitud && clienteCompleto?.longitud}
												<br><small class="text-success">
													<i class="bi bi-geo-alt-fill me-1"></i>
													GPS disponible
												</small>
											{:else}
												<br><small class="text-warning">
													<i class="bi bi-exclamation-triangle me-1"></i>
													Sin GPS
												</small>
											{/if}
										</div>
									</div>
								</div>
							{/each}
						</div>
					</div>
					
					<!-- Mapa -->
					<div 
						bind:this={mapContainer}
						id="reparto-group-map-{repartoGroup.id}"
						class="map-container"
						style="height: 500px; width: 100%; position: relative; background-color: #f0f0f0; z-index: 1;"
					>
						{#if !map}
							<div class="d-flex align-items-center justify-content-center h-100">
								<div class="text-center">
									<div class="spinner-border text-primary mb-2" role="status"></div>
									<small class="text-muted">Cargando mapa con {clientesCompletos.length} ubicaciones...</small>
								</div>
							</div>
						{/if}
					</div>
				</div>
				
				<div class="modal-footer">
					<div class="me-auto">
						<button 
							class="btn btn-outline-secondary btn-sm me-2"
							on:click={copyGroupInfo}
							title="Copiar información completa del reparto"
						>
							<i class="bi bi-clipboard me-1"></i>
							Copiar Info Completa
						</button>
						<button 
							class="btn btn-outline-primary btn-sm"
							on:click={openInExternalMap}
							title="Abrir ruta en Google Maps"
						>
							<i class="bi bi-map me-1"></i>
							{clientesCompletos.length > 1 ? 'Ruta en Google Maps' : 'Ver en Google Maps'}
						</button>
					</div>
					<div>
						<span class="badge bg-info me-2">
							<i class="bi bi-geo-alt me-1"></i>
							{clientesCompletos.length} ubicaciones GPS
						</span>
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
	</div>
{/if}

<style>
	:global(.cliente-marker) {
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
		height: 500px !important;
		width: 100% !important;
		font-family: inherit !important;
		position: relative !important;
		z-index: 1 !important;
		background-color: #ddd !important;
	}
	
	/* Fix para tiles */
	:global(.leaflet-tile) {
		max-width: none !important;
		width: 256px !important;
		height: 256px !important;
	}
	
	/* Controles */
	:global(.leaflet-control-zoom) {
		margin: 10px !important;
		z-index: 1000 !important;
	}
	
	/* Capas */
	:global(.leaflet-map-pane) {
		z-index: 1 !important;
	}
	
	:global(.leaflet-tile-pane) {
		z-index: 1 !important;
	}
	
	/* Popups */
	:global(.leaflet-popup-content) {
		margin: 0 !important;
	}
	
	:global(.leaflet-popup-content-wrapper) {
		border-radius: 8px !important;
	}
</style>
