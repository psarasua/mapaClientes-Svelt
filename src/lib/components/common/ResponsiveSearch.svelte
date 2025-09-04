<script>
	import { createEventDispatcher } from 'svelte';
	import { debounceStore, windowSize } from '../../utils/stores.js';
	import { writable } from 'svelte/store';
	
	export let placeholder = 'Buscar...';
	export let disabled = false;
	export let value = '';
	
	const dispatch = createEventDispatcher();
	
	// Store para el término de búsqueda
	const searchTerm = writable(value);
	
	// Debounce automático con svelte-legos (300ms)
	const debouncedSearch = debounceStore(searchTerm, 300);
	
	// Detectar tamaño de pantalla para UI responsive
	$: isMobile = $windowSize.width < 768;
	
	// Emitir evento cuando cambie la búsqueda debounced
	debouncedSearch.subscribe(term => {
		dispatch('search', term);
	});
	
	// Actualizar store cuando cambie el prop value
	$: searchTerm.set(value);
	
	// Limpiar búsqueda
	const clearSearch = () => {
		searchTerm.set('');
	};
	
	// Manejar input
	const handleInput = (event) => {
		searchTerm.set(event.target.value);
	};
</script>

<div class="search-container">
	<div class="input-group {isMobile ? 'input-group-sm' : ''}">
		<span class="input-group-text">
			<i class="bi bi-search text-muted"></i>
		</span>
		<input
			type="text"
			class="form-control"
			{placeholder}
			value={$searchTerm}
			on:input={handleInput}
			{disabled}
		/>
		{#if $searchTerm}
			<button 
				class="btn btn-outline-secondary" 
				type="button"
				on:click={clearSearch}
				title="Limpiar búsqueda"
			>
				<i class="bi bi-x"></i>
			</button>
		{/if}
	</div>
	
	{#if isMobile && $searchTerm}
		<div class="search-info mt-1">
			<small class="text-muted">
				<i class="bi bi-phone me-1"></i>
				Búsqueda activa
			</small>
		</div>
	{/if}
</div>

<style>
	.search-container {
		width: 100%;
	}
	
	.input-group-text {
		background-color: var(--bs-light);
		border-right: none;
	}
	
	.form-control {
		border-left: none;
	}
	
	.form-control:focus {
		border-color: var(--bs-primary);
		box-shadow: 0 0 0 0.25rem rgba(13, 110, 253, 0.15);
	}
	
	.search-info {
		text-align: center;
	}
</style>
