<script>
	import { createEventDispatcher } from 'svelte';
	
	export let show = false;
	export let reparto = null; // null para crear, objeto para editar
	export let loading = false;
	export let clientes = [];
	export let camiones = [];
	export let rutas = [];
	
	const dispatch = createEventDispatcher();
	
	let formData = {
		cliente_id: '',
		camion_id: '',
		ruta_id: ''
	};
	
	let errors = {};
	
	// Reactively update form data when reparto changes
	$: if (reparto) {
		formData = {
			cliente_id: reparto.cliente_id?.toString() || '',
			camion_id: reparto.camion_id?.toString() || '',
			ruta_id: reparto.ruta_id?.toString() || ''
		};
	} else {
		formData = {
			cliente_id: '',
			camion_id: '',
			ruta_id: ''
		};
	}
	
	const validateForm = () => {
		errors = {};
		
		if (!formData.cliente_id) {
			errors.cliente_id = 'Debe seleccionar un cliente';
		}
		
		if (!formData.camion_id) {
			errors.camion_id = 'Debe seleccionar un camión';
		}
		
		if (!formData.ruta_id) {
			errors.ruta_id = 'Debe seleccionar una ruta';
		}
		
		return Object.keys(errors).length === 0;
	};
	
	const handleSubmit = () => {
		if (!validateForm()) {
			return;
		}
		
		// Convertir a números
		const submitData = {
			cliente_id: parseInt(formData.cliente_id),
			camion_id: parseInt(formData.camion_id),
			ruta_id: parseInt(formData.ruta_id)
		};
		
		dispatch('submit', submitData);
	};
	
	const handleClose = () => {
		errors = {};
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
	
	// Obtener nombre del cliente seleccionado
	$: selectedCliente = clientes.find(c => c.id.toString() === formData.cliente_id);
	$: selectedCamion = camiones.find(c => c.id.toString() === formData.camion_id);
	$: selectedRuta = rutas.find(r => r.id.toString() === formData.ruta_id);
</script>

{#if show}
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
		aria-labelledby="repartoModalLabel"
		aria-hidden="false"
		aria-modal="true"
	>
		<div class="modal-dialog modal-lg modal-dialog-centered">
			<div class="modal-content">
				<div class="modal-header">
					<h5 class="modal-title" id="repartoModalLabel">
						<i class="bi bi-boxes me-2"></i>
						{reparto ? 'Editar Reparto' : 'Nuevo Reparto'}
					</h5>
					<button 
						type="button" 
						class="btn-close" 
						aria-label="Close"
						on:click={handleClose}
						disabled={loading}
					></button>
				</div>
				
				<form on:submit|preventDefault={handleSubmit}>
					<div class="modal-body">
						<div class="row g-3">
							<!-- Cliente -->
							<div class="col-12">
								<label for="cliente_id" class="form-label">
									<i class="bi bi-person-badge me-1"></i>
									Cliente *
								</label>
								<select 
									class="form-select {errors.cliente_id ? 'is-invalid' : ''}" 
									id="cliente_id"
									bind:value={formData.cliente_id}
									disabled={loading}
									required
								>
									<option value="">Seleccionar cliente...</option>
									{#each clientes as cliente}
										<option value={cliente.id}>
											{cliente.nombre} - {cliente.razonsocial}
										</option>
									{/each}
								</select>
								{#if errors.cliente_id}
									<div class="invalid-feedback">{errors.cliente_id}</div>
								{/if}
								{#if selectedCliente}
									<div class="form-text">
										<i class="bi bi-geo-alt me-1"></i>
										{selectedCliente.direccion}
									</div>
								{/if}
							</div>
							
							<!-- Camión -->
							<div class="col-md-6">
								<label for="camion_id" class="form-label">
									<i class="bi bi-truck me-1"></i>
									Camión *
								</label>
								<select 
									class="form-select {errors.camion_id ? 'is-invalid' : ''}" 
									id="camion_id"
									bind:value={formData.camion_id}
									disabled={loading}
									required
								>
									<option value="">Seleccionar camión...</option>
									{#each camiones as camion}
										<option value={camion.id}>
											{camion.nombre}
										</option>
									{/each}
								</select>
								{#if errors.camion_id}
									<div class="invalid-feedback">{errors.camion_id}</div>
								{/if}
							</div>
							
							<!-- Ruta -->
							<div class="col-md-6">
								<label for="ruta_id" class="form-label">
									<i class="bi bi-signpost-2 me-1"></i>
									Ruta *
								</label>
								<select 
									class="form-select {errors.ruta_id ? 'is-invalid' : ''}" 
									id="ruta_id"
									bind:value={formData.ruta_id}
									disabled={loading}
									required
								>
									<option value="">Seleccionar ruta...</option>
									{#each rutas as ruta}
										<option value={ruta.id}>
											{ruta.nombre}
										</option>
									{/each}
								</select>
								{#if errors.ruta_id}
									<div class="invalid-feedback">{errors.ruta_id}</div>
								{/if}
							</div>
						</div>
						
						<!-- Preview del reparto -->
						{#if selectedCliente && selectedCamion && selectedRuta}
							<div class="mt-4 p-3 bg-light border rounded">
								<h6 class="mb-2">
									<i class="bi bi-eye me-1"></i>
									Vista Previa del Reparto
								</h6>
								<div class="row g-2 small">
									<div class="col-md-4">
										<strong>Cliente:</strong><br>
										<span class="text-primary">{selectedCliente.nombre}</span>
									</div>
									<div class="col-md-4">
										<strong>Camión:</strong><br>
										<span class="text-success">{selectedCamion.nombre}</span>
									</div>
									<div class="col-md-4">
										<strong>Ruta:</strong><br>
										<span class="text-info">{selectedRuta.nombre}</span>
									</div>
								</div>
							</div>
						{/if}
					</div>
					
					<div class="modal-footer">
						<button 
							type="button" 
							class="btn btn-secondary" 
							on:click={handleClose}
							disabled={loading}
						>
							<i class="bi bi-x-lg me-1"></i>
							Cancelar
						</button>
						<button 
							type="submit" 
							class="btn btn-primary"
							disabled={loading}
						>
							{#if loading}
								<span class="spinner-border spinner-border-sm me-2" role="status"></span>
							{:else}
								<i class="bi bi-check-lg me-1"></i>
							{/if}
							{reparto ? 'Actualizar' : 'Crear'}
						</button>
					</div>
				</form>
			</div>
		</div>
	</div>
{/if}
