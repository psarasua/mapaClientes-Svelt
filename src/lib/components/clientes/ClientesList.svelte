<script>
	import { onMount } from 'svelte';
	import { clientesStore, clientesActions } from '$lib/stores/clientesStore.js';
	import { toast } from '$lib/stores/toastStore.js';
	import ClienteModal from './ClienteModal.svelte';
	import MapModal from './MapModal.svelte';
	import ClientesToolbar from './ClientesToolbar.svelte';
	import ClientesPagination from './ClientesPagination.svelte';
	import Loading from '../common/Loading.svelte';
	import ErrorMessage from '../common/ErrorMessage.svelte';
	
	// Variables reactivas
	$: ({ 
		data: allClientes, 
		filteredData: clientes, 
		loading, 
		error, 
		count,
		searchTerm,
		sortBy,
		sortOrder,
		filterByEstado,
		currentPage,
		itemsPerPage,
		totalPages
	} = $clientesStore);
	
	// Calcular datos paginados
	$: paginatedClientes = clientes.slice(
		(currentPage - 1) * itemsPerPage,
		currentPage * itemsPerPage
	);
	
	// Calcular estadísticas
	$: stats = {
		total: allClientes.length,
		activos: allClientes.filter(c => c.estado === 'Activo').length,
		inactivos: allClientes.filter(c => c.estado === 'Inactivo').length
	};
	
	// Estado del modal
	let showModal = false;
	let editingCliente = null;
	let modalLoading = false;
	
	// Estado del modal de mapa
	let showMapModal = false;
	let selectedClienteForMap = null;
	
	// Cargar clientes al montar el componente
	onMount(() => {
		toast.info('Inicializando gestión de clientes...');
		clientesActions.loadClientes();
	});
	
	// Abrir modal para crear nuevo cliente
	const handleCreate = () => {
		editingCliente = null;
		showModal = true;
		toast.info('Abriendo formulario para nuevo cliente');
	};
	
	// Abrir modal para editar cliente
	const handleEdit = (cliente) => {
		editingCliente = cliente;
		showModal = true;
		toast.info(`Editando cliente: "${cliente.nombre}"`);
	};
	
	// Manejar envío del formulario
	const handleModalSubmit = async (event) => {
		modalLoading = true;
		
		try {
			if (editingCliente) {
				// Editar cliente existente
				await clientesActions.updateCliente(editingCliente.id, event.detail);
			} else {
				// Crear nuevo cliente
				await clientesActions.addCliente(event.detail);
			}
			
			showModal = false;
			editingCliente = null;
		} catch (error) {
			toast.error(`Error al guardar cliente: ${error.message}`);
		} finally {
			modalLoading = false;
		}
	};
	
	// Cerrar modal
	const handleModalClose = () => {
		showModal = false;
		editingCliente = null;
		modalLoading = false;
		toast.info('Formulario cerrado');
	};
	
	// Eliminar cliente con confirmación
	const handleDelete = async (cliente) => {
		if (confirm(`¿Estás seguro de que quieres eliminar el cliente "${cliente.nombre}"?\n\nEsta acción no se puede deshacer.`)) {
			try {
				await clientesActions.deleteCliente(cliente.id);
				toast.info(`Cliente "${cliente.nombre}" eliminado de la lista`);
			} catch (error) {
				toast.error(`Error al eliminar cliente: ${error.message}`);
			}
		} else {
			toast.info('Eliminación cancelada');
		}
	};
	
	// Ver detalles del cliente
	const handleViewDetails = (cliente) => {
		toast.info(`Mostrando detalles de: ${cliente.nombre}`);
		// Aquí podrías implementar un modal de detalles o navegación
	};
	
	// Mostrar ubicación en mapa
	const handleShowMap = (cliente) => {
		selectedClienteForMap = cliente;
		showMapModal = true;
		toast.info(`Abriendo mapa para: ${cliente.nombre}`);
	};
	
	// Cerrar modal de mapa
	const handleMapModalClose = () => {
		showMapModal = false;
		selectedClienteForMap = null;
	};
	
	// Recargar datos
	const handleRefresh = () => {
		toast.info('Actualizando lista de clientes...');
		clientesActions.loadClientes();
	};
	
	// Limpiar error
	const handleClearError = () => {
		clientesActions.clearError();
	};
	
	// Manejar funcionalidades avanzadas
	const handleSearch = (event) => {
		const searchTerm = event.detail;
		clientesActions.setSearchTerm(searchTerm);
		if (searchTerm) {
			toast.info(`Buscando: "${searchTerm}"`);
		} else {
			toast.info('Búsqueda limpiada - mostrando todos los clientes');
		}
	};
	
	const handleFilterByEstado = (event) => {
		const estado = event.detail;
		clientesActions.setFilterByEstado(estado);
		if (estado === 'todos') {
			toast.info('Mostrando clientes de todos los estados');
		} else {
			toast.info(`Filtrando por estado: ${estado}`);
		}
	};
	
	const handleSort = (event) => {
		const { sortBy, sortOrder } = event.detail;
		clientesActions.setSorting(sortBy, sortOrder);
		const direction = sortOrder === 'asc' ? 'ascendente' : 'descendente';
		toast.info(`Ordenando por ${sortBy} - ${direction}`);
	};
	
	const handleItemsPerPageChange = (event) => {
		const itemsPerPage = event.detail;
		clientesActions.setItemsPerPage(itemsPerPage);
		toast.info(`Mostrando ${itemsPerPage} elementos por página`);
	};
	
	const handlePageChange = (event) => {
		const page = event.detail;
		clientesActions.setPage(page);
		toast.info(`Navegando a página ${page}`);
	};
	
	const handleExport = (event) => {
		const format = event.detail;
		try {
			clientesActions.exportData(format);
			toast.success(`Datos exportados en formato ${format.toUpperCase()}`);
		} catch (error) {
			toast.error(`Error al exportar datos: ${error.message}`);
		}
	};
	
	// Formatear teléfono para mostrar
	const formatPhone = (phone) => {
		return phone || 'No disponible';
	};
	
	// Obtener clase CSS para el estado
	const getEstadoClass = (estado) => {
		return estado === 'Activo' ? 'bg-success' : 'bg-secondary';
	};
</script>

<!-- Toolbar con búsqueda, filtros y exportación -->
<ClientesToolbar 
	{searchTerm}
	{sortBy}
	{sortOrder}
	{itemsPerPage}
	{filterByEstado}
	{stats}
	totalCount={clientes.length}
	{loading}
	on:search={handleSearch}
	on:filterByEstado={handleFilterByEstado}
	on:sort={handleSort}
	on:itemsPerPageChange={handleItemsPerPageChange}
	on:export={handleExport}
	on:createNew={handleCreate}
	on:refresh={handleRefresh}
/>

<div class="card">
	<div class="card-header">
		<h5 class="mb-0">
			<i class="bi bi-person-badge me-2"></i>
			Lista de Clientes
			{#if clientes.length > 0}
				<span class="badge bg-primary ms-2">{clientes.length}</span>
				{#if searchTerm || filterByEstado !== 'todos'}
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
			<Loading message="Cargando clientes..." />
		{:else if clientes.length === 0}
			<div class="text-center py-4">
				<i class="bi bi-person-badge display-1 text-muted mb-3"></i>
				<h5 class="text-muted">No hay clientes registrados</h5>
				<p class="text-muted">
					{#if searchTerm || filterByEstado !== 'todos'}
						No se encontraron clientes que coincidan con los filtros aplicados.
					{:else}
						Haz clic en "Nuevo Cliente" para agregar el primero.
					{/if}
				</p>
				{#if !searchTerm && filterByEstado === 'todos'}
					<button class="btn btn-primary" on:click={handleCreate}>
						<i class="bi bi-plus-lg me-1"></i>
						Crear Primer Cliente
					</button>
				{/if}
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
								<i class="bi bi-upc me-1"></i>
								Código
							</th>
							<th scope="col">
								<i class="bi bi-shop me-1"></i>
								Nombre
							</th>
							<th scope="col">
								<i class="bi bi-geo-alt me-1"></i>
								Dirección
							</th>
							<th scope="col">
								<i class="bi bi-telephone me-1"></i>
								Teléfono
							</th>
							<th scope="col">
								<i class="bi bi-toggle-on me-1"></i>
								Estado
							</th>
							<th scope="col" class="text-center">
								<i class="bi bi-gear me-1"></i>
								Acciones
							</th>
						</tr>
					</thead>
					<tbody>
						{#each paginatedClientes as cliente (cliente.id)}
							<tr class="fade-in">
								<td>
									<span class="badge bg-secondary">{cliente.id}</span>
								</td>
								<td>
									<code class="text-primary">{cliente.codigoalte}</code>
								</td>
								<td>
									<div>
										<strong>{cliente.nombre}</strong>
										<br>
										<small class="text-muted">{cliente.razonsocial}</small>
									</div>
								</td>
								<td>
									<div class="text-truncate" style="max-width: 200px;" title={cliente.direccion}>
										<i class="bi bi-geo-alt-fill text-danger me-1"></i>
										{cliente.direccion}
									</div>
								</td>
								<td>
									<a href="tel:{cliente.telefono}" class="text-decoration-none">
										<i class="bi bi-telephone-fill text-success me-1"></i>
										{formatPhone(cliente.telefono)}
									</a>
								</td>
								<td>
									<span class="badge {getEstadoClass(cliente.estado)}">
										{cliente.estado}
									</span>
								</td>
								<td class="text-center">
									<div class="btn-group btn-group-sm" role="group">
										<button 
											class="btn btn-outline-success" 
											on:click={() => handleShowMap(cliente)}
											title="Ver ubicación en mapa"
											disabled={loading}
										>
											<i class="bi bi-geo-alt"></i>
										</button>
										<button 
											class="btn btn-outline-info" 
											on:click={() => handleViewDetails(cliente)}
											title="Ver detalles"
											disabled={loading}
										>
											<i class="bi bi-eye"></i>
										</button>
										<button 
											class="btn btn-outline-primary" 
											on:click={() => handleEdit(cliente)}
											title="Editar cliente"
											disabled={loading}
										>
											<i class="bi bi-pencil"></i>
										</button>
										<button 
											class="btn btn-outline-danger" 
											on:click={() => handleDelete(cliente)}
											title="Eliminar cliente"
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
	{#if clientes.length > 0 && totalPages > 1}
		<div class="card-footer">
			<ClientesPagination 
				{currentPage}
				{totalPages}
				{itemsPerPage}
				totalItems={clientes.length}
				{loading}
				on:pageChange={handlePageChange}
			/>
		</div>
	{/if}
</div>

<!-- Modal para crear/editar cliente -->
<ClienteModal 
	bind:show={showModal}
	cliente={editingCliente}
	loading={modalLoading}
	on:submit={handleModalSubmit}
	on:close={handleModalClose}
/>

<!-- Modal para mostrar mapa -->
<MapModal 
	bind:show={showMapModal}
	cliente={selectedClienteForMap}
	on:close={handleMapModalClose}
/>
