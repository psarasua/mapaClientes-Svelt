<script>
	import { createEventDispatcher } from 'svelte';
	
	export let currentPage = 1;
	export let totalPages = 1;
	export let itemsPerPage = 10;
	export let totalItems = 0;
	export let loading = false;
	
	const dispatch = createEventDispatcher();
	
	$: startItem = ((currentPage - 1) * itemsPerPage) + 1;
	$: endItem = Math.min(currentPage * itemsPerPage, totalItems);
	
	// Calcular páginas a mostrar
	$: {
		const delta = 2; // Páginas a mostrar a cada lado de la actual
		const range = [];
		const rangeWithDots = [];
		
		for (
			let i = Math.max(2, currentPage - delta);
			i <= Math.min(totalPages - 1, currentPage + delta);
			i++
		) {
			range.push(i);
		}
		
		if (currentPage - delta > 2) {
			rangeWithDots.push(1, '...');
		} else {
			rangeWithDots.push(1);
		}
		
		rangeWithDots.push(...range);
		
		if (currentPage + delta < totalPages - 1) {
			rangeWithDots.push('...', totalPages);
		} else {
			if (totalPages > 1) {
				rangeWithDots.push(totalPages);
			}
		}
		
		visiblePages = rangeWithDots;
	}
	
	let visiblePages = [];
	
	const goToPage = (page) => {
		if (page !== currentPage && page >= 1 && page <= totalPages && !loading) {
			dispatch('pageChange', page);
		}
	};
	
	const goToPrevious = () => {
		if (currentPage > 1) {
			goToPage(currentPage - 1);
		}
	};
	
	const goToNext = () => {
		if (currentPage < totalPages) {
			goToPage(currentPage + 1);
		}
	};
</script>

{#if totalPages > 1}
	<div class="d-flex justify-content-between align-items-center">
		<!-- Información de elementos -->
		<div>
			<small class="text-muted">
				Mostrando {startItem} a {endItem} de {totalItems} elementos
			</small>
		</div>
		
		<!-- Paginación -->
		<nav aria-label="Paginación de camiones">
			<ul class="pagination pagination-sm mb-0">
				<!-- Anterior -->
				<li class="page-item {currentPage === 1 ? 'disabled' : ''}">
					<button 
						class="page-link" 
						on:click={goToPrevious}
						disabled={currentPage === 1 || loading}
						aria-label="Página anterior"
					>
						<i class="bi bi-chevron-left"></i>
					</button>
				</li>
				
				<!-- Páginas -->
				{#each visiblePages as page}
					{#if page === '...'}
						<li class="page-item disabled">
							<span class="page-link">...</span>
						</li>
					{:else}
						<li class="page-item {currentPage === page ? 'active' : ''}">
							<button 
								class="page-link" 
								on:click={() => goToPage(page)}
								disabled={loading}
								aria-label="Página {page}"
								aria-current={currentPage === page ? 'page' : undefined}
							>
								{page}
							</button>
						</li>
					{/if}
				{/each}
				
				<!-- Siguiente -->
				<li class="page-item {currentPage === totalPages ? 'disabled' : ''}">
					<button 
						class="page-link" 
						on:click={goToNext}
						disabled={currentPage === totalPages || loading}
						aria-label="Página siguiente"
					>
						<i class="bi bi-chevron-right"></i>
					</button>
				</li>
			</ul>
		</nav>
	</div>
{/if}
