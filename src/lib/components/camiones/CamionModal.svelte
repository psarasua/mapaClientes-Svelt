<script>
	import { createEventDispatcher } from 'svelte';
	
	export let show = false;
	export let camion = null; // null para crear, objeto para editar
	export let loading = false;
	
	const dispatch = createEventDispatcher();
	
	let formData = {
		nombre: ''
	};
	
	// Reactively update form data when camion changes
	$: if (camion) {
		formData = {
			nombre: camion.nombre || ''
		};
	} else {
		formData = {
			nombre: ''
		};
	}
	
	const handleSubmit = () => {
		if (!formData.nombre.trim()) {
			alert('El nombre del camión es obligatorio');
			return;
		}
		
		dispatch('submit', formData);
	};
	
	const handleClose = () => {
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
		aria-labelledby="camionModalLabel"
		aria-hidden="false"
	>
		<div class="modal-dialog modal-dialog-centered">
			<div class="modal-content">
				<div class="modal-header">
					<h5 class="modal-title" id="camionModalLabel">
						<i class="bi bi-truck me-2"></i>
						{camion ? 'Editar Camión' : 'Nuevo Camión'}
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
						<div class="mb-3">
							<label for="nombreCamion" class="form-label">
								<i class="bi bi-tag me-1"></i>
								Nombre del Camión *
							</label>
							<input 
								type="text" 
								class="form-control" 
								id="nombreCamion"
								bind:value={formData.nombre}
								placeholder="Ej: Volvo FH16 750"
								disabled={loading}
								required
							/>
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
							disabled={loading || !formData.nombre.trim()}
						>
							{#if loading}
								<span class="spinner-border spinner-border-sm me-2" role="status"></span>
							{:else}
								<i class="bi bi-check-lg me-1"></i>
							{/if}
							{camion ? 'Actualizar' : 'Crear'}
						</button>
					</div>
				</form>
			</div>
		</div>
	</div>
{/if}
