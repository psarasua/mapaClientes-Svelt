<script>
	import { createEventDispatcher } from 'svelte';
	import { debounce } from '$lib/utils/helpers.js';
	
	export let searchTerm = '';
	export let sortBy = 'id';
	export let sortOrder = 'asc';
	export let itemsPerPage = 10;
	export let totalCount = 0;
	export let filterByEstado = 'todos';
	export let loading = false;
	export let stats = { activos: 0, inactivos: 0, total: 0 };
	
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
			// Nuevo campo, empezar con ascendente
			sortBy = field;
			sortOrder = 'asc';
		}
		dispatch('sort', { sortBy, sortOrder });
	};
	
	const handleEstadoFilterChange = (event) => {
		filterByEstado = event.target.value;
		dispatch('filterByEstado', filterByEstado);
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
</script>

<div class="card mb-3">
	<div class="card-body">
		<!-- Estadísticas rápidas -->
		<div class="row mb-3">
			<div class="col-12">
				<div class="d-flex gap-3 flex-wrap">
					<div class="badge bg-primary fs-6 p-2">
						<i class="bi bi-people me-1"></i>
						Total: {stats.total}
					</div>
					<div class="badge bg-success fs-6 p-2">
						<i class="bi bi-check-circle me-1"></i>
						Activos: {stats.activos}
					</div>
					<div class="badge bg-secondary fs-6 p-2">
						<i class="bi bi-x-circle me-1"></i>
						Inactivos: {stats.inactivos}
					</div>
				</div>
			</div>
		</div>
		
		<div class="row g-3 align-items-center">
			<!-- Búsqueda -->
			<div class="col-md-4">
				<div class="input-group">
					<span class="input-group-text">
						<i class="bi bi-search"></i>
					</span>
					<input
						type="text"
						class="form-control"
						placeholder="Buscar por nombre, código, dirección..."
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
			
			<!-- Filtro por Estado -->
			<div class="col-md-2">
				<select 
					class="form-select form-select-sm" 
					bind:value={filterByEstado}
					on:change={handleEstadoFilterChange}
					disabled={loading}
				>
					<option value="todos">Todos</option>
					<option value="Activo">Activos</option>
					<option value="Inactivo">Inactivos</option>
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
						class="btn btn-outline-secondary btn-sm {sortBy === 'nombre' ? 'active' : ''}"
						on:click={() => handleSortChange('nombre')}
						disabled={loading}
						title="Ordenar por Nombre"
					>
						Nombre
						{#if sortBy === 'nombre'}
							<i class="bi bi-arrow-{sortOrder === 'asc' ? 'up' : 'down'} ms-1"></i>
						{/if}
					</button>
				</div>
			</div>
			
			<!-- Items por página -->
			<div class="col-md-2">
				<select 
					class="form-select form-select-sm" 
					bind:value={itemsPerPage}
					on:change={handleItemsPerPageChange}
					disabled={loading}
				>
					<option value={5}>5 por página</option>
					<option value={10}>10 por página</option>
					<option value={25}>25 por página</option>
					<option value={50}>50 por página</option>
				</select>
			</div>
			
			<!-- Acciones -->
			<div class="col-md-2">
				<div class="btn-group w-100" role="group">
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
						title="Crear nuevo cliente"
					>
						<i class="bi bi-plus-lg"></i>
					</button>
				</div>
			</div>
		</div>
		
		<!-- Información de resultados -->
		<div class="row mt-2">
			<div class="col">
				<small class="text-muted">
					{#if searchTerm || filterByEstado !== 'todos'}
						<i class="bi bi-funnel me-1"></i>
						Filtros aplicados: 
						{#if searchTerm}búsqueda "{searchTerm}"{/if}
						{#if searchTerm && filterByEstado !== 'todos'} + {/if}
						{#if filterByEstado !== 'todos'}estado "{filterByEstado}"{/if}
						- Mostrando {totalCount} resultados
					{:else}
						<i class="bi bi-info-circle me-1"></i>
						Mostrando todos los clientes: {totalCount} elementos
					{/if}
				</small>
			</div>
		</div>
	</div>
</div>
