<script>
	import { onMount } from 'svelte';
	import { repartosStore, repartosActions } from '$lib/stores/repartosStore.js';
	import { toast } from '$lib/stores/toastStore.js';
	import { clientesService } from '$lib/services/clientesService.js';
	import { camionesService } from '$lib/services/camionesService.js';
	import { rutasService } from '$lib/services/rutasService.js';
	import RepartoModal from './RepartoModal.svelte';
	import RepartoGroupMapModal from './RepartoGroupMapModal.svelte';
	import RepartosToolbar from './RepartosToolbar.svelte';
	import RepartosPagination from './RepartosPagination.svelte';
	import Loading from '../common/Loading.svelte';
	import ErrorMessage from '../common/ErrorMessage.svelte';
	
	// Variables reactivas
	$: ({ 
		data: allRepartos, 
		groupedData: allGroups,
		filteredData: grupos, 
		loading, 
		error, 
		count,
		searchTerm,
		sortBy,
		sortOrder,
		filterByCamion,
		filterByRuta,
		currentPage,
		itemsPerPage,
		totalPages
	} = $repartosStore);
	
	// Calcular datos paginados
	$: paginatedGrupos = grupos.slice(
		(currentPage - 1) * itemsPerPage,
		currentPage * itemsPerPage
	);
	
	// Datos de referencia
	let clientes = [];
	let camiones = [];
	let rutas = [];
	let dataLoading = false;
	
	// Calcular estadísticas
	$: stats = {
		totalRepartos: allRepartos.length,
		camionesActivos: new Set(allRepartos.map(r => r.camion_id)).size,
		rutasActivas: new Set(allRepartos.map(r => r.ruta_id)).size,
		clientesAsignados: new Set(allRepartos.map(r => r.cliente_id)).size
	};
	
	// Estado del modal
	let showModal = false;
	let editingReparto = null;
	let modalLoading = false;
	
	// Estado del modal de mapa
	let showMapModal = false;
	let selectedGroupForMap = null;
	
	// Cargar todos los datos necesarios
	const loadAllData = async () => {
		dataLoading = true;
		toast.info('Cargando datos del sistema...');
		
		try {
			const [clientesResponse, camionesResponse, rutasResponse] = await Promise.all([
				clientesService.getAll(),
				camionesService.getAll(),
				rutasService.getAll()
			]);
			
			clientes = clientesResponse.data || [];
			camiones = camionesResponse.data || [];
			rutas = rutasResponse.data || [];
			
			toast.success('Datos del sistema cargados correctamente');
		} catch (error) {
			toast.error(`Error al cargar datos del sistema: ${error.message}`);
		} finally {
			dataLoading = false;
		}
	};
	
	// Cargar repartos al montar el componente
	onMount(async () => {
		toast.info('Inicializando gestión de repartos...');
		await loadAllData();
		repartosActions.loadRepartos();
	});
	
	// Abrir modal para crear nuevo reparto
	const handleCreate = () => {
		editingReparto = null;
		showModal = true;
		toast.info('Abriendo formulario para nuevo reparto');
	};
	
	// Abrir modal para editar reparto
	const handleEdit = (reparto) => {
		editingReparto = reparto;
		showModal = true;
		toast.info(`Editando reparto #${reparto.id}`);
	};
	
	// Manejar envío del formulario
	const handleModalSubmit = async (event) => {
		modalLoading = true;
		
		try {
			if (editingReparto) {
				// Editar reparto existente
				await repartosActions.updateReparto(editingReparto.id, event.detail);
			} else {
				// Crear nuevo reparto
				await repartosActions.addReparto(event.detail);
			}
			
			showModal = false;
			editingReparto = null;
		} catch (error) {
			toast.error(`Error al guardar reparto: ${error.message}`);
		} finally {
			modalLoading = false;
		}
	};
	
	// Cerrar modal
	const handleModalClose = () => {
		showModal = false;
		editingReparto = null;
		modalLoading = false;
		toast.info('Formulario cerrado');
	};
	
	// Eliminar reparto con confirmación
	const handleDelete = async (reparto) => {
		if (confirm(`¿Estás seguro de que quieres eliminar el reparto #${reparto.id}?\n\nCliente: ${reparto.cliente_nombre}\nCamión: ${reparto.camion_nombre}\nRuta: ${reparto.ruta_nombre}`)) {
			try {
				await repartosActions.deleteReparto(reparto.id);
				toast.info(`Reparto #${reparto.id} eliminado de la lista`);
			} catch (error) {
				toast.error(`Error al eliminar reparto: ${error.message}`);
			}
		} else {
			toast.info('Eliminación cancelada');
		}
	};
	
	// Mostrar ubicación en mapa
	const handleShowMap = (grupo) => {
		selectedGroupForMap = grupo;
		showMapModal = true;
		toast.info(`Abriendo mapa para ${grupo.camion_nombre} - ${grupo.ruta_nombre}`);
	};
	
	// Cerrar modal de mapa
	const handleMapModalClose = () => {
		showMapModal = false;
		selectedGroupForMap = null;
	};
	
	// Recargar datos
	const handleRefresh = () => {
		toast.info('Actualizando datos...');
		loadAllData().then(() => {
			repartosActions.loadRepartos();
		});
	};
	
	// Limpiar error
	const handleClearError = () => {
		repartosActions.clearError();
	};
	
	// Manejar funcionalidades avanzadas
	const handleSearch = (event) => {
		const searchTerm = event.detail;
		repartosActions.setSearchTerm(searchTerm);
		if (searchTerm) {
			toast.info(`Buscando: "${searchTerm}"`);
		} else {
			toast.info('Búsqueda limpiada - mostrando todos los repartos');
		}
	};
	
	const handleFilterByCamion = (event) => {
		const camionId = event.detail;
		repartosActions.setFilterByCamion(camionId);
		if (camionId === 'todos') {
			toast.info('Mostrando repartos de todos los camiones');
		} else {
			const camion = camiones.find(c => c.id.toString() === camionId);
			toast.info(`Filtrando por camión: ${camion?.nombre || camionId}`);
		}
	};
	
	const handleFilterByRuta = (event) => {
		const rutaId = event.detail;
		repartosActions.setFilterByRuta(rutaId);
		if (rutaId === 'todos') {
			toast.info('Mostrando repartos de todas las rutas');
		} else {
			const ruta = rutas.find(r => r.id.toString() === rutaId);
			toast.info(`Filtrando por ruta: ${ruta?.nombre || rutaId}`);
		}
	};
	
	const handleSort = (event) => {
		const { sortBy, sortOrder } = event.detail;
		repartosActions.setSorting(sortBy, sortOrder);
		const direction = sortOrder === 'asc' ? 'ascendente' : 'descendente';
		toast.info(`Ordenando por ${sortBy} - ${direction}`);
	};
	
	const handleItemsPerPageChange = (event) => {
		const itemsPerPage = event.detail;
		repartosActions.setItemsPerPage(itemsPerPage);
		toast.info(`Mostrando ${itemsPerPage} elementos por página`);
	};
	
	const handlePageChange = (event) => {
		const page = event.detail;
		repartosActions.setPage(page);
		toast.info(`Navegando a página ${page}`);
	};
	
	const handleExport = (event) => {
		const format = event.detail;
		try {
			repartosActions.exportData(format);
			toast.success(`Datos exportados en formato ${format.toUpperCase()}`);
		} catch (error) {
			toast.error(`Error al exportar datos: ${error.message}`);
		}
	};
	
	// Obtener cliente completo para mostrar más información
	const getClienteCompleto = (clienteId) => {
		return clientes.find(c => c.id === clienteId);
	};
</script>

<!-- Toolbar con búsqueda, filtros y exportación -->
<RepartosToolbar 
	{searchTerm}
	{sortBy}
	{sortOrder}
	{itemsPerPage}
	{filterByCamion}
	{filterByRuta}
	{stats}
	{camiones}
	{rutas}
	totalCount={grupos.length}
	loading={loading || dataLoading}
	on:search={handleSearch}
	on:filterByCamion={handleFilterByCamion}
	on:filterByRuta={handleFilterByRuta}
	on:sort={handleSort}
	on:itemsPerPageChange={handleItemsPerPageChange}
	on:export={handleExport}
	on:createNew={handleCreate}
	on:refresh={handleRefresh}
/>

<div class="card">
	<div class="card-header">
		<h5 class="mb-0">
			<i class="bi bi-boxes me-2"></i>
			Repartos Agrupados por Camión y Ruta
			{#if grupos.length > 0}
				<span class="badge bg-primary ms-2">{grupos.length}</span>
				grupos
				{#if searchTerm || filterByCamion !== 'todos' || filterByRuta !== 'todos'}
					<small class="text-muted ms-2">de {allGroups.length} total</small>
				{/if}
			{/if}
		</h5>
	</div>
	
	<div class="card-body">
		{#if error}
			<ErrorMessage 
				message={error} 
				onRetry={handleRefresh}
				on:click={handleClearError}
			/>
		{/if}
		
		{#if loading || dataLoading}
			<Loading message={dataLoading ? "Cargando datos del sistema..." : "Cargando repartos..."} />
		{:else if grupos.length === 0}
			<div class="text-center py-4">
				<i class="bi bi-boxes display-1 text-muted mb-3"></i>
				<h5 class="text-muted">No hay grupos de repartos</h5>
				<p class="text-muted">
					{#if searchTerm || filterByCamion !== 'todos' || filterByRuta !== 'todos'}
						No se encontraron grupos de repartos que coincidan con los filtros aplicados.
					{:else}
						Haz clic en "Nuevo Reparto" para crear el primero.
					{/if}
				</p>
				{#if !searchTerm && filterByCamion === 'todos' && filterByRuta === 'todos'}
					<button class="btn btn-primary" on:click={handleCreate}>
						<i class="bi bi-plus-lg me-1"></i>
						Crear Primer Reparto
					</button>
				{/if}
			</div>
		{:else}
			<div class="table-responsive">
				<table class="table table-hover">
					<thead class="table-light">
						<tr>
							<th scope="col">
								<i class="bi bi-truck me-1"></i>
								Camión
							</th>
							<th scope="col">
								<i class="bi bi-signpost-2 me-1"></i>
								Ruta
							</th>
							<th scope="col">
								<i class="bi bi-people me-1"></i>
								Clientes Asignados
							</th>
							<th scope="col" class="text-center">
								<i class="bi bi-geo-alt me-1"></i>
								Ubicaciones GPS
							</th>
							<th scope="col" class="text-center">
								<i class="bi bi-gear me-1"></i>
								Acciones
							</th>
						</tr>
					</thead>
					<tbody>
						{#each paginatedGrupos as grupo (grupo.id)}
							{@const clientesConGPS = grupo.clientes.filter(cliente => {
								const clienteCompleto = clientes.find(c => c.id === cliente.cliente_id);
								return clienteCompleto?.latitud && clienteCompleto?.longitud;
							})}
							<tr class="fade-in">
								<td>
									<div class="d-flex align-items-center">
										<i class="bi bi-truck text-success me-2"></i>
										<strong>{grupo.camion_nombre}</strong>
									</div>
								</td>
								<td>
									<div class="d-flex align-items-center">
										<i class="bi bi-signpost-2 text-info me-2"></i>
										<span class="text-truncate" style="max-width: 250px;" title={grupo.ruta_nombre}>
											{grupo.ruta_nombre}
										</span>
									</div>
								</td>
								<td>
									<div>
										<span class="badge bg-primary me-1">{grupo.total_clientes}</span>
										clientes asignados
										<br>
										<div class="mt-1">
											{#each grupo.clientes.slice(0, 3) as cliente, index}
												<small class="text-muted d-block">
													{index + 1}. {cliente.cliente_nombre}
												</small>
											{/each}
											{#if grupo.clientes.length > 3}
												<small class="text-muted">
													<i class="bi bi-three-dots me-1"></i>
													y {grupo.clientes.length - 3} más...
												</small>
											{/if}
										</div>
									</div>
								</td>
								<td class="text-center">
									<div class="d-flex flex-column align-items-center gap-1">
										{#if clientesConGPS.length > 0}
											<span class="badge bg-success">
												<i class="bi bi-geo-alt-fill me-1"></i>
												{clientesConGPS.length} con GPS
											</span>
										{/if}
										{#if grupo.total_clientes - clientesConGPS.length > 0}
											<span class="badge bg-warning text-dark">
												<i class="bi bi-exclamation-triangle me-1"></i>
												{grupo.total_clientes - clientesConGPS.length} sin GPS
											</span>
										{/if}
										{#if clientesConGPS.length === 0}
											<span class="badge bg-secondary">
												<i class="bi bi-geo-alt me-1"></i>
												Sin ubicaciones
											</span>
										{/if}
									</div>
								</td>
								<td class="text-center">
									<div class="btn-group btn-group-sm" role="group">
										<button 
											class="btn btn-outline-success" 
											on:click={() => handleShowMap(grupo)}
											title="Ver todas las ubicaciones en mapa"
											disabled={loading || dataLoading}
										>
											<i class="bi bi-geo-alt"></i>
											<span class="d-none d-md-inline ms-1">Mapa</span>
										</button>
										<button 
											class="btn btn-outline-primary" 
											on:click={() => handleEdit(grupo)}
											title="Editar repartos de este grupo"
											disabled={loading || dataLoading}
										>
											<i class="bi bi-pencil"></i>
										</button>
									</div>
								</td>
							</tr>
						{/each}
					</tbody>
				</table>
			</div>
		{/if}
	</div>
	
	<!-- Paginación -->
	{#if grupos.length > 0 && totalPages > 1}
		<div class="card-footer">
			<RepartosPagination 
				{currentPage}
				{totalPages}
				{itemsPerPage}
				totalItems={grupos.length}
				loading={loading || dataLoading}
				on:pageChange={handlePageChange}
			/>
		</div>
	{/if}
</div>

<!-- Modal para crear/editar reparto -->
<RepartoModal 
	bind:show={showModal}
	reparto={editingReparto}
	{clientes}
	{camiones}
	{rutas}
	loading={modalLoading}
	on:submit={handleModalSubmit}
	on:close={handleModalClose}
/>

<!-- Modal para mostrar mapa de grupo -->
<RepartoGroupMapModal 
	bind:show={showMapModal}
	repartoGroup={selectedGroupForMap}
	clientesData={clientes}
	on:close={handleMapModalClose}
/>
