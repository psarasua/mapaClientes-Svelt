<script>
	import { onMount } from 'svelte';
	import { camionesStore, camionesActions } from '$lib/stores/camionesStore.js';
	import { toast } from '$lib/stores/toastStore.js';
	import CamionModal from './CamionModal.svelte';
	import CamionesToolbar from './CamionesToolbar.svelte';
	import CamionesPagination from './CamionesPagination.svelte';
	import Loading from '../common/Loading.svelte';
	import ErrorMessage from '../common/ErrorMessage.svelte';
	
	// Variables reactivas
	$: ({ 
		data: allCamiones, 
		filteredData: camiones, 
		loading, 
		error, 
		count,
		searchTerm,
		sortBy,
		sortOrder,
		currentPage,
		itemsPerPage,
		totalPages
	} = $camionesStore);
	
	// Calcular datos paginados
	$: paginatedCamiones = camiones.slice(
		(currentPage - 1) * itemsPerPage,
		currentPage * itemsPerPage
	);
	
	// Estado del modal
	let showModal = false;
	let editingCamion = null;
	let modalLoading = false;
	
	// Cargar camiones al montar el componente
	onMount(() => {
		toast.info('Inicializando gestión de camiones...');
		camionesActions.loadCamiones();
	});
	
	// Abrir modal para crear nuevo camión
	const handleCreate = () => {
		editingCamion = null;
		showModal = true;
		toast.info('Abriendo formulario para nuevo camión');
	};
	
	// Abrir modal para editar camión
	const handleEdit = (camion) => {
		editingCamion = camion;
		showModal = true;
		toast.info(`Editando camión: "${camion.nombre}"`);
	};
	
	// Manejar envío del formulario
	const handleModalSubmit = async (event) => {
		modalLoading = true;
		
		try {
			if (editingCamion) {
				// Editar camión existente
				await camionesActions.updateCamion(editingCamion.id, event.detail);
			} else {
				// Crear nuevo camión
				await camionesActions.addCamion(event.detail);
			}
			
			showModal = false;
			editingCamion = null;
		} catch (error) {
			toast.error(`Error al guardar camión: ${error.message}`);
		} finally {
			modalLoading = false;
		}
	};
	
	// Cerrar modal
	const handleModalClose = () => {
		showModal = false;
		editingCamion = null;
		modalLoading = false;
		toast.info('Formulario cerrado');
	};
	
	// Eliminar camión con confirmación
	const handleDelete = async (camion) => {
		if (confirm(`¿Estás seguro de que quieres eliminar el camión "${camion.nombre}"?`)) {
			try {
				await camionesActions.deleteCamion(camion.id);
				toast.info(`Camión "${camion.nombre}" eliminado de la lista`);
			} catch (error) {
				toast.error(`Error al eliminar camión: ${error.message}`);
			}
		} else {
			toast.info('Eliminación cancelada');
		}
	};
	
	// Recargar datos
	const handleRefresh = () => {
		toast.info('Actualizando lista de camiones...');
		camionesActions.loadCamiones();
	};
	
	// Limpiar error
	const handleClearError = () => {
		camionesActions.clearError();
	};
	
	// Manejar funcionalidades avanzadas
	const handleSearch = (event) => {
		const searchTerm = event.detail;
		camionesActions.setSearchTerm(searchTerm);
		if (searchTerm) {
			toast.info(`Buscando: "${searchTerm}"`);
		} else {
			toast.info('Búsqueda limpiada - mostrando todos los camiones');
		}
	};
	
	const handleSort = (event) => {
		const { sortBy, sortOrder } = event.detail;
		camionesActions.setSorting(sortBy, sortOrder);
		const direction = sortOrder === 'asc' ? 'ascendente' : 'descendente';
		toast.info(`Ordenando por ${sortBy} - ${direction}`);
	};
	
	const handleItemsPerPageChange = (event) => {
		const itemsPerPage = event.detail;
		camionesActions.setItemsPerPage(itemsPerPage);
		toast.info(`Mostrando ${itemsPerPage} elementos por página`);
	};
	
	const handlePageChange = (event) => {
		const page = event.detail;
		camionesActions.setPage(page);
		toast.info(`Navegando a página ${page}`);
	};
	
	const handleExport = (event) => {
		const format = event.detail;
		try {
			camionesActions.exportData(format);
			toast.success(`Datos exportados en formato ${format.toUpperCase()}`);
		} catch (error) {
			toast.error(`Error al exportar datos: ${error.message}`);
		}
	};
</script>

<!-- Toolbar con búsqueda, filtros y exportación -->
<CamionesToolbar 
	{searchTerm}
	{sortBy}
	{sortOrder}
	{itemsPerPage}
	totalCount={camiones.length}
	{loading}
	on:search={handleSearch}
	on:sort={handleSort}
	on:itemsPerPageChange={handleItemsPerPageChange}
	on:export={handleExport}
	on:createNew={handleCreate}
	on:refresh={handleRefresh}
/>

<div class="card">
	<div class="card-header">
		<h5 class="mb-0">
			<i class="bi bi-truck me-2"></i>
			Lista de Camiones
			{#if camiones.length > 0}
				<span class="badge bg-primary ms-2">{camiones.length}</span>
				{#if searchTerm}
					<small class="text-muted ms-2">de {count} total</small>
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
		
		{#if loading}
			<Loading message="Cargando camiones..." />
		{:else if camiones.length === 0}
			<div class="text-center py-4">
				<i class="bi bi-truck display-1 text-muted mb-3"></i>
				<h5 class="text-muted">No hay camiones registrados</h5>
				<p class="text-muted">Haz clic en "Nuevo Camión" para agregar el primero</p>
				<button class="btn btn-primary" on:click={handleCreate}>
					<i class="bi bi-plus-lg me-1"></i>
					Crear Primer Camión
				</button>
			</div>
		{:else}
			<div class="table-responsive">
				<table class="table table-hover">
					<thead class="table-light">
						<tr>
							<th scope="col">
								<i class="bi bi-hash me-1"></i>
								ID
							</th>
							<th scope="col">
								<i class="bi bi-tag me-1"></i>
								Nombre
							</th>
							<th scope="col" class="text-center">
								<i class="bi bi-gear me-1"></i>
								Acciones
							</th>
						</tr>
					</thead>
					<tbody>
						{#each paginatedCamiones as camion (camion.id)}
							<tr class="fade-in">
								<td>
									<span class="badge bg-secondary">{camion.id}</span>
								</td>
								<td>
									<strong>{camion.nombre}</strong>
								</td>
								<td class="text-center">
									<div class="btn-group btn-group-sm" role="group">
										<button 
											class="btn btn-outline-primary" 
											on:click={() => handleEdit(camion)}
											title="Editar camión"
											disabled={loading}
										>
											<i class="bi bi-pencil"></i>
										</button>
										<button 
											class="btn btn-outline-danger" 
											on:click={() => handleDelete(camion)}
											title="Eliminar camión"
											disabled={loading}
										>
											<i class="bi bi-trash"></i>
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
	{#if camiones.length > 0 && totalPages > 1}
		<div class="card-footer">
			<CamionesPagination 
				{currentPage}
				{totalPages}
				{itemsPerPage}
				totalItems={camiones.length}
				{loading}
				on:pageChange={handlePageChange}
			/>
		</div>
	{/if}
</div>

<!-- Modal para crear/editar camión -->
<CamionModal 
	bind:show={showModal}
	camion={editingCamion}
	loading={modalLoading}
	on:submit={handleModalSubmit}
	on:close={handleModalClose}
/>
