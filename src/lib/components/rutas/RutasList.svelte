<script>
	import { onMount } from 'svelte';
	import { rutasStore, rutasActions } from '$lib/stores/rutasStore.js';
	import { toast } from '$lib/stores/toastStore.js';
	import RutaModal from './RutaModal.svelte';
	import RutasToolbar from './RutasToolbar.svelte';
	import RutasPagination from './RutasPagination.svelte';
	import Loading from '../common/Loading.svelte';
	import ErrorMessage from '../common/ErrorMessage.svelte';
	
	// Variables reactivas
	$: ({ 
		data: allRutas, 
		filteredData: rutas, 
		loading, 
		error, 
		count,
		searchTerm,
		sortBy,
		sortOrder,
		currentPage,
		itemsPerPage,
		totalPages
	} = $rutasStore);
	
	// Calcular datos paginados
	$: paginatedRutas = rutas.slice(
		(currentPage - 1) * itemsPerPage,
		currentPage * itemsPerPage
	);
	
	// Estado del modal
	let showModal = false;
	let editingRuta = null;
	let modalLoading = false;
	
	// Cargar rutas al montar el componente
	onMount(() => {
		rutasActions.loadRutas();
	});
	
	// Abrir modal para crear nueva ruta
	const handleCreate = () => {
		editingRuta = null;
		showModal = true;
	};
	
	// Abrir modal para editar ruta
	const handleEdit = (ruta) => {
		editingRuta = ruta;
		showModal = true;
	};
	
	// Manejar envío del formulario
	const handleModalSubmit = async (event) => {
		modalLoading = true;
		
		try {
			if (editingRuta) {
				// Editar ruta existente
				await rutasActions.updateRuta(editingRuta.id, event.detail);
			} else {
				// Crear nueva ruta
				await rutasActions.addRuta(event.detail);
			}
			
			showModal = false;
			editingRuta = null;
		} catch (error) {
			toast.error(`Error al guardar ruta: ${error.message}`);
		} finally {
			modalLoading = false;
		}
	};
	
	// Cerrar modal
	const handleModalClose = () => {
		showModal = false;
		editingRuta = null;
		modalLoading = false;
		toast.info('Formulario cerrado');
	};
	
	// Eliminar ruta con confirmación
	const handleDelete = async (ruta) => {
		if (confirm(`¿Estás seguro de que quieres eliminar la ruta "${ruta.nombre}"?`)) {
			try {
				await rutasActions.deleteRuta(ruta.id);
				toast.info(`Ruta "${ruta.nombre}" eliminada de la lista`);
			} catch (error) {
				toast.error(`Error al eliminar ruta: ${error.message}`);
			}
		} else {
			toast.info('Eliminación cancelada');
		}
	};
	
	// Recargar datos
	const handleRefresh = () => {
		toast.info('Actualizando lista de rutas...');
		rutasActions.loadRutas();
	};
	
	// Limpiar error
	const handleClearError = () => {
		rutasActions.clearError();
	};
	
	// Manejar funcionalidades avanzadas
	const handleSearch = (event) => {
		const searchTerm = event.detail;
		rutasActions.setSearchTerm(searchTerm);
		if (searchTerm) {
			toast.info(`Buscando: "${searchTerm}"`);
		} else {
			toast.info('Búsqueda limpiada - mostrando todas las rutas');
		}
	};
	
	const handleSort = (event) => {
		const { sortBy, sortOrder } = event.detail;
		rutasActions.setSorting(sortBy, sortOrder);
		const direction = sortOrder === 'asc' ? 'ascendente' : 'descendente';
		toast.info(`Ordenando por ${sortBy} - ${direction}`);
	};
	
	const handleItemsPerPageChange = (event) => {
		const itemsPerPage = event.detail;
		rutasActions.setItemsPerPage(itemsPerPage);
		toast.info(`Mostrando ${itemsPerPage} elementos por página`);
	};
	
	const handlePageChange = (event) => {
		const page = event.detail;
		rutasActions.setPage(page);
		toast.info(`Navegando a página ${page}`);
	};
	
	const handleExport = (event) => {
		const format = event.detail;
		try {
			rutasActions.exportData(format);
			toast.success(`Datos exportados en formato ${format.toUpperCase()}`);
		} catch (error) {
			toast.error(`Error al exportar datos: ${error.message}`);
		}
	};
</script>

<!-- Toolbar con búsqueda, filtros y exportación -->
<RutasToolbar 
	{searchTerm}
	{sortBy}
	{sortOrder}
	{itemsPerPage}
	totalCount={rutas.length}
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
			<i class="bi bi-signpost-2 me-2"></i>
			Lista de Rutas
			{#if rutas.length > 0}
				<span class="badge bg-primary ms-2">{rutas.length}</span>
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
			<Loading message="Cargando rutas..." />
		{:else if rutas.length === 0}
			<div class="text-center py-4">
				<i class="bi bi-signpost-2 display-1 text-muted mb-3"></i>
				<h5 class="text-muted">No hay rutas registradas</h5>
				<p class="text-muted">Haz clic en "Nueva Ruta" para agregar la primera</p>
				<button class="btn btn-primary" on:click={handleCreate}>
					<i class="bi bi-plus-lg me-1"></i>
					Crear Primera Ruta
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
								<i class="bi bi-signpost-2 me-1"></i>
								Nombre de la Ruta
							</th>
							<th scope="col" class="text-center">
								<i class="bi bi-gear me-1"></i>
								Acciones
							</th>
						</tr>
					</thead>
					<tbody>
						{#each paginatedRutas as ruta (ruta.id)}
							<tr class="fade-in">
								<td>
									<span class="badge bg-secondary">{ruta.id}</span>
								</td>
								<td>
									<div class="d-flex align-items-center">
										<i class="bi bi-geo-alt text-primary me-2"></i>
										<strong>{ruta.nombre}</strong>
									</div>
								</td>
								<td class="text-center">
									<div class="btn-group btn-group-sm" role="group">
										<button 
											class="btn btn-outline-primary" 
											on:click={() => handleEdit(ruta)}
											title="Editar ruta"
											disabled={loading}
										>
											<i class="bi bi-pencil"></i>
										</button>
										<button 
											class="btn btn-outline-danger" 
											on:click={() => handleDelete(ruta)}
											title="Eliminar ruta"
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
	{#if rutas.length > 0 && totalPages > 1}
		<div class="card-footer">
			<RutasPagination 
				{currentPage}
				{totalPages}
				{itemsPerPage}
				totalItems={rutas.length}
				{loading}
				on:pageChange={handlePageChange}
			/>
		</div>
	{/if}
</div>

<!-- Modal para crear/editar ruta -->
<RutaModal 
	bind:show={showModal}
	ruta={editingRuta}
	loading={modalLoading}
	on:submit={handleModalSubmit}
	on:close={handleModalClose}
/>
