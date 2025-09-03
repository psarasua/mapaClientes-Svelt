<script>
	import { createEventDispatcher } from 'svelte';
	import { isValidEmail, isValidPhone } from '$lib/utils/helpers.js';
	
	export let show = false;
	export let cliente = null; // null para crear, objeto para editar
	export let loading = false;
	
	const dispatch = createEventDispatcher();
	
	let formData = {
		codigoalte: '',
		razonsocial: '',
		nombre: '',
		direccion: '',
		telefono: '',
		rut: '',
		estado: 'Activo',
		latitud: '',
		longitud: ''
	};
	
	let errors = {};
	
	// Reactively update form data when cliente changes
	$: if (cliente) {
		formData = {
			codigoalte: cliente.codigoalte || '',
			razonsocial: cliente.razonsocial || '',
			nombre: cliente.nombre || '',
			direccion: cliente.direccion || '',
			telefono: cliente.telefono || '',
			rut: cliente.rut || '',
			estado: cliente.estado || 'Activo',
			latitud: cliente.latitud || '',
			longitud: cliente.longitud || ''
		};
	} else {
		formData = {
			codigoalte: '',
			razonsocial: '',
			nombre: '',
			direccion: '',
			telefono: '',
			rut: '',
			estado: 'Activo',
			latitud: '',
			longitud: ''
		};
	}
	
	const validateForm = () => {
		errors = {};
		
		if (!formData.codigoalte.trim()) {
			errors.codigoalte = 'El código es obligatorio';
		}
		
		if (!formData.razonsocial.trim()) {
			errors.razonsocial = 'La razón social es obligatoria';
		}
		
		if (!formData.nombre.trim()) {
			errors.nombre = 'El nombre es obligatorio';
		}
		
		if (!formData.direccion.trim()) {
			errors.direccion = 'La dirección es obligatoria';
		}
		
		if (!formData.telefono.trim()) {
			errors.telefono = 'El teléfono es obligatorio';
		} else if (!isValidPhone(formData.telefono)) {
			errors.telefono = 'Formato de teléfono inválido';
		}
		
		if (!formData.rut.trim()) {
			errors.rut = 'El RUT es obligatorio';
		}
		
		if (formData.latitud && isNaN(parseFloat(formData.latitud))) {
			errors.latitud = 'La latitud debe ser un número válido';
		}
		
		if (formData.longitud && isNaN(parseFloat(formData.longitud))) {
			errors.longitud = 'La longitud debe ser un número válido';
		}
		
		return Object.keys(errors).length === 0;
	};
	
	const handleSubmit = () => {
		if (!validateForm()) {
			return;
		}
		
		// Convertir coordenadas a string con formato correcto
		const submitData = {
			...formData,
			latitud: formData.latitud ? parseFloat(formData.latitud).toString() : '',
			longitud: formData.longitud ? parseFloat(formData.longitud).toString() : ''
		};
		
		dispatch('submit', submitData);
	};
	
	const handleClose = () => {
		errors = {};
		dispatch('close');
	};
	
	// Close modal when clicking outside or pressing Escape
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
</script>

{#if show}
	<!-- Modal Backdrop -->
	<div 
		class="modal fade show d-block" 
		tabindex="-1" 
		style="background-color: rgba(0,0,0,0.5);"
		on:click={handleBackdropClick}
		on:keydown={handleKeydown}
		role="dialog"
		aria-labelledby="clienteModalLabel"
		aria-hidden="false"
	>
		<div class="modal-dialog modal-lg modal-dialog-centered">
			<div class="modal-content">
				<div class="modal-header">
					<h5 class="modal-title" id="clienteModalLabel">
						<i class="bi bi-person-badge me-2"></i>
						{cliente ? 'Editar Cliente' : 'Nuevo Cliente'}
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
							<!-- Código y Estado -->
							<div class="col-md-8">
								<label for="codigoalte" class="form-label">
									<i class="bi bi-upc me-1"></i>
									Código *
								</label>
								<input 
									type="text" 
									class="form-control {errors.codigoalte ? 'is-invalid' : ''}" 
									id="codigoalte"
									bind:value={formData.codigoalte}
									placeholder="Ej: CLI001"
									disabled={loading}
									required
								/>
								{#if errors.codigoalte}
									<div class="invalid-feedback">{errors.codigoalte}</div>
								{/if}
							</div>
							
							<div class="col-md-4">
								<label for="estado" class="form-label">
									<i class="bi bi-toggle-on me-1"></i>
									Estado
								</label>
								<select 
									class="form-select" 
									id="estado"
									bind:value={formData.estado}
									disabled={loading}
								>
									<option value="Activo">Activo</option>
									<option value="Inactivo">Inactivo</option>
								</select>
							</div>
							
							<!-- Razón Social -->
							<div class="col-12">
								<label for="razonsocial" class="form-label">
									<i class="bi bi-building me-1"></i>
									Razón Social *
								</label>
								<input 
									type="text" 
									class="form-control {errors.razonsocial ? 'is-invalid' : ''}" 
									id="razonsocial"
									bind:value={formData.razonsocial}
									placeholder="Ej: Supermercados La Anónima SA"
									disabled={loading}
									required
								/>
								{#if errors.razonsocial}
									<div class="invalid-feedback">{errors.razonsocial}</div>
								{/if}
							</div>
							
							<!-- Nombre Comercial -->
							<div class="col-12">
								<label for="nombre" class="form-label">
									<i class="bi bi-shop me-1"></i>
									Nombre Comercial *
								</label>
								<input 
									type="text" 
									class="form-control {errors.nombre ? 'is-invalid' : ''}" 
									id="nombre"
									bind:value={formData.nombre}
									placeholder="Ej: La Anónima Belgrano"
									disabled={loading}
									required
								/>
								{#if errors.nombre}
									<div class="invalid-feedback">{errors.nombre}</div>
								{/if}
							</div>
							
							<!-- Dirección -->
							<div class="col-12">
								<label for="direccion" class="form-label">
									<i class="bi bi-geo-alt me-1"></i>
									Dirección *
								</label>
								<input 
									type="text" 
									class="form-control {errors.direccion ? 'is-invalid' : ''}" 
									id="direccion"
									bind:value={formData.direccion}
									placeholder="Ej: Av. Cabildo 2280, Belgrano, CABA"
									disabled={loading}
									required
								/>
								{#if errors.direccion}
									<div class="invalid-feedback">{errors.direccion}</div>
								{/if}
							</div>
							
							<!-- Teléfono y RUT -->
							<div class="col-md-6">
								<label for="telefono" class="form-label">
									<i class="bi bi-telephone me-1"></i>
									Teléfono *
								</label>
								<input 
									type="tel" 
									class="form-control {errors.telefono ? 'is-invalid' : ''}" 
									id="telefono"
									bind:value={formData.telefono}
									placeholder="Ej: +54 11 4784-2100"
									disabled={loading}
									required
								/>
								{#if errors.telefono}
									<div class="invalid-feedback">{errors.telefono}</div>
								{/if}
							</div>
							
							<div class="col-md-6">
								<label for="rut" class="form-label">
									<i class="bi bi-card-text me-1"></i>
									RUT/CUIT *
								</label>
								<input 
									type="text" 
									class="form-control {errors.rut ? 'is-invalid' : ''}" 
									id="rut"
									bind:value={formData.rut}
									placeholder="Ej: 30-12345678-9"
									disabled={loading}
									required
								/>
								{#if errors.rut}
									<div class="invalid-feedback">{errors.rut}</div>
								{/if}
							</div>
							
							<!-- Coordenadas GPS -->
							<div class="col-12">
								<h6 class="mb-2">
									<i class="bi bi-geo me-1"></i>
									Coordenadas GPS (Opcional)
								</h6>
							</div>
							
							<div class="col-md-6">
								<label for="latitud" class="form-label">
									<i class="bi bi-compass me-1"></i>
									Latitud
								</label>
								<input 
									type="number" 
									step="any"
									class="form-control {errors.latitud ? 'is-invalid' : ''}" 
									id="latitud"
									bind:value={formData.latitud}
									placeholder="Ej: -34.5631"
									disabled={loading}
								/>
								{#if errors.latitud}
									<div class="invalid-feedback">{errors.latitud}</div>
								{/if}
							</div>
							
							<div class="col-md-6">
								<label for="longitud" class="form-label">
									<i class="bi bi-compass me-1"></i>
									Longitud
								</label>
								<input 
									type="number" 
									step="any"
									class="form-control {errors.longitud ? 'is-invalid' : ''}" 
									id="longitud"
									bind:value={formData.longitud}
									placeholder="Ej: -58.4578"
									disabled={loading}
								/>
								{#if errors.longitud}
									<div class="invalid-feedback">{errors.longitud}</div>
								{/if}
							</div>
						</div>
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
							{cliente ? 'Actualizar' : 'Crear'}
						</button>
					</div>
				</form>
			</div>
		</div>
	</div>
{/if}
