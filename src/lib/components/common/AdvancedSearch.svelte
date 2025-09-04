<script>
	import { createEventDispatcher } from 'svelte';
	import { debounceStore } from 'svelte-legos';
	import { writable } from 'svelte/store';
	
	export let placeholder = 'Buscar...';
	export let searchFields = ['nombre']; // Campos por los que buscar
	export let disabled = false;
	
	const dispatch = createEventDispatcher();
	
	// Store para el término de búsqueda
	const searchTerm = writable('');
	
	// Debounce automático con svelte-legos
	const debouncedSearch = debounceStore(searchTerm, 300);
	
	// Emitir evento cuando cambie la búsqueda debounced
	debouncedSearch.subscribe(term => {
		dispatch('search', { term, fields: searchFields });
	});
	
	// Limpiar búsqueda
	const clearSearch = () => {
		searchTerm.set('');
	};
	
	// Manejar input
	const handleInput = (event) => {
		searchTerm.set(event.target.value);
	};
</script>

<div class="position-relative">
	<div class="input-group">
		<span class="input-group-text bg-light border-end-0">
			<i class="bi bi-search text-muted"></i>
		</span>
		<input
			type="text"
			class="form-control border-start-0 ps-0"
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
	
	{#if $searchTerm}
		<small class="text-muted mt-1 d-block">
			<i class="bi bi-info-circle me-1"></i>
			Buscando en: {searchFields.join(', ')}
		</small>
	{/if}
</div>

<style>
	.input-group-text {
		border-right: none !important;
		background-color: transparent !important;
	}
	
	.form-control:focus {
		border-color: var(--bs-primary) !important;
		box-shadow: 0 0 0 0.25rem rgba(13, 110, 253, 0.15) !important;
	}
</style>
