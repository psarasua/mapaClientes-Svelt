<script>
	import { createEventDispatcher } from 'svelte';
	import { debounce } from '$lib/utils/helpers.js';
	
	export let searchTerm = '';
	export let sortBy = 'id';
	export let sortOrder = 'desc';
	export let itemsPerPage = 15;
	export let totalCount = 0;
	export let filterByCamion = 'todos';
	export let filterByRuta = 'todos';
	export let loading = false;
	export let stats = { totalRepartos: 0, camionesActivos: 0, rutasActivas: 0, clientesAsignados: 0 };
	export let camiones = [];
	export let rutas = [];
	
	const dispatch = createEventDispatcher();
	
	// Debounce search para evitar demasiadas llamadas
	const debouncedSearch = debounce((term) => {
		dispatch('search', term);
	}, 300);
	
	const handleSearchInput = (event) => {
		searchTerm = event.target.value;
		debouncedSearch(searchTerm);
	};
	
	const handleSortChange = (field) => {
		if (sortBy === field) {
			// Cambiar orden si es el mismo campo
			sortOrder = sortOrder === 'asc' ? 'desc' : 'asc';
		} else {
			// Nuevo campo, empezar con descendente para repartos (más recientes primero)
			sortBy = field;
			sortOrder = field === 'id' ? 'desc' : 'asc';
		}
		dispatch('sort', { sortBy, sortOrder });
	};
	
	const handleCamionFilterChange = (event) => {
		filterByCamion = event.target.value;
		dispatch('filterByCamion', filterByCamion);
	};
	
	const handleRutaFilterChange = (event) => {
		filterByRuta = event.target.value;
		dispatch('filterByRuta', filterByRuta);
	};
	
	const handleItemsPerPageChange = (event) => {
		const newValue = parseInt(event.target.value);
		itemsPerPage = newValue;
		dispatch('itemsPerPageChange', newValue);
	};
	
	const handleExport = (format) => {
		dispatch('export', format);
	};
	
	const handleCreateNew = () => {
		dispatch('createNew');
	};
	
	const handleRefresh = () => {
		dispatch('refresh');
	};
	
	const clearAllFilters = () => {
		searchTerm = '';
		filterByCamion = 'todos';
		filterByRuta = 'todos';
		dispatch('search', '');
		dispatch('filterByCamion', 'todos');
		dispatch('filterByRuta', 'todos');
	};
</script>

<div class="card mb-3">
	<div class="card-body">
		<!-- Estadísticas rápidas -->
		<div class="row mb-3">
			<div class="col-12">
				<div class="d-flex gap-3 flex-wrap">
					<div class="badge bg-primary fs-6 p-2">
						<i class="bi bi-boxes me-1"></i>
						Repartos: {stats.totalRepartos}
					</div>
					<div class="badge bg-success fs-6 p-2">
						<i class="bi bi-truck me-1"></i>
						Camiones: {stats.camionesActivos}
					</div>
					<div class="badge bg-info fs-6 p-2">
						<i class="bi bi-signpost-2 me-1"></i>
						Rutas: {stats.rutasActivas}
					</div>
					<div class="badge bg-warning fs-6 p-2">
						<i class="bi bi-people me-1"></i>
						Clientes: {stats.clientesAsignados}
					</div>
				</div>
			</div>
		</div>
		
		<div class="row g-3 align-items-center">
			<!-- Búsqueda -->
			<div class="col-md-3">
				<div class="input-group">
					<span class="input-group-text">
						<i class="bi bi-search"></i>
					</span>
					<input
						type="text"
						class="form-control"
						placeholder="Buscar cliente, camión, ruta..."
						value={searchTerm}
						on:input={handleSearchInput}
						disabled={loading}
					/>
					{#if searchTerm}
						<button 
							class="btn btn-outline-secondary" 
							type="button"
							on:click={() => {
								searchTerm = '';
								dispatch('search', '');
							}}
						>
							<i class="bi bi-x"></i>
						</button>
					{/if}
				</div>
			</div>
			
			<!-- Filtro por Camión -->
			<div class="col-md-2">
				<select 
					class="form-select form-select-sm" 
					bind:value={filterByCamion}
					on:change={handleCamionFilterChange}
					disabled={loading}
				>
					<option value="todos">Todos los camiones</option>
					{#each camiones as camion}
						<option value={camion.id}>{camion.nombre}</option>
					{/each}
				</select>
			</div>
			
			<!-- Filtro por Ruta -->
			<div class="col-md-2">
				<select 
					class="form-select form-select-sm" 
					bind:value={filterByRuta}
					on:change={handleRutaFilterChange}
					disabled={loading}
				>
					<option value="todos">Todas las rutas</option>
					{#each rutas as ruta}
						<option value={ruta.id}>{ruta.nombre}</option>
					{/each}
				</select>
			</div>
			
			<!-- Ordenamiento -->
			<div class="col-md-2">
				<div class="btn-group w-100" role="group">
					<button 
						class="btn btn-outline-secondary btn-sm {sortBy === 'id' ? 'active' : ''}"
						on:click={() => handleSortChange('id')}
						disabled={loading}
						title="Ordenar por ID"
					>
						ID
						{#if sortBy === 'id'}
							<i class="bi bi-arrow-{sortOrder === 'asc' ? 'up' : 'down'} ms-1"></i>
						{/if}
					</button>
					<button 
						class="btn btn-outline-secondary btn-sm {sortBy === 'cliente_nombre' ? 'active' : ''}"
						on:click={() => handleSortChange('cliente_nombre')}
						disabled={loading}
						title="Ordenar por Cliente"
					>
						Cliente
						{#if sortBy === 'cliente_nombre'}
							<i class="bi bi-arrow-{sortOrder === 'asc' ? 'up' : 'down'} ms-1"></i>
						{/if}
					</button>
				</div>
			</div>
			
			<!-- Acciones -->
			<div class="col-md-3">
				<div class="btn-group w-100" role="group">
					<!-- Limpiar filtros -->
					{#if searchTerm || filterByCamion !== 'todos' || filterByRuta !== 'todos'}
						<button 
							class="btn btn-outline-warning btn-sm" 
							on:click={clearAllFilters}
							disabled={loading}
							title="Limpiar todos los filtros"
						>
							<i class="bi bi-funnel-fill me-1"></i>
							Limpiar
						</button>
					{/if}
					
					<!-- Exportar -->
					<div class="btn-group" role="group">
						<button 
							class="btn btn-outline-success btn-sm dropdown-toggle" 
							type="button" 
							data-bs-toggle="dropdown"
							disabled={loading || totalCount === 0}
							title="Exportar datos"
						>
							<i class="bi bi-download me-1"></i>
							Exportar
						</button>
						<ul class="dropdown-menu">
							<li>
								<button class="dropdown-item" on:click={() => handleExport('csv')}>
									<i class="bi bi-filetype-csv me-2"></i>
									Exportar CSV
								</button>
							</li>
							<li>
								<button class="dropdown-item" on:click={() => handleExport('json')}>
									<i class="bi bi-filetype-json me-2"></i>
									Exportar JSON
								</button>
							</li>
						</ul>
					</div>
					
					<!-- Refresh -->
					<button 
						class="btn btn-outline-secondary btn-sm" 
						on:click={handleRefresh}
						disabled={loading}
						title="Actualizar datos"
					>
						<i class="bi bi-arrow-clockwise"></i>
					</button>
					
					<!-- Nuevo -->
					<button 
						class="btn btn-primary btn-sm" 
						on:click={handleCreateNew}
						disabled={loading}
						title="Crear nuevo reparto"
					>
						<i class="bi bi-plus-lg"></i>
					</button>
				</div>
			</div>
		</div>
		
		<!-- Items por página -->
		<div class="row mt-2">
			<div class="col-md-6">
				<small class="text-muted">
					{#if searchTerm || filterByCamion !== 'todos' || filterByRuta !== 'todos'}
						<i class="bi bi-funnel me-1"></i>
						Filtros aplicados - Mostrando {totalCount} resultados
					{:else}
						<i class="bi bi-info-circle me-1"></i>
						Mostrando todos los repartos: {totalCount} elementos
					{/if}
				</small>
			</div>
			<div class="col-md-6 text-end">
				<div class="d-flex align-items-center justify-content-end gap-2">
					<small class="text-muted">Elementos por página:</small>
					<select 
						class="form-select form-select-sm" 
						style="width: auto;"
						bind:value={itemsPerPage}
						on:change={handleItemsPerPageChange}
						disabled={loading}
					>
						<option value={10}>10</option>
						<option value={15}>15</option>
						<option value={25}>25</option>
						<option value={50}>50</option>
					</select>
				</div>
			</div>
		</div>
	</div>
</div>
