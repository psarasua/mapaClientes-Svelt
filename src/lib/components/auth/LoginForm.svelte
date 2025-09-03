<script>
	import { createEventDispatcher } from 'svelte';
	import { authStore, authActions } from '$lib/stores/authStore.js';
	import { toast } from '$lib/stores/toastStore.js';
	import { isValidEmail } from '$lib/utils/helpers.js';
	
	const dispatch = createEventDispatcher();
	
	// Variables reactivas del store
	$: ({ loading, error } = $authStore);
	
	// Datos del formulario
	let formData = {
		email: '',
		password: ''
	};
	
	let errors = {};
	let showPassword = false;
	
	// Validar formulario
	const validateForm = () => {
		errors = {};
		
		if (!formData.email.trim()) {
			errors.email = 'El usuario es obligatorio';
		}
		
		if (!formData.password.trim()) {
			errors.password = 'La contraseña es obligatoria';
		} else if (formData.password.length < 3) {
			errors.password = 'La contraseña debe tener al menos 3 caracteres';
		}
		
		return Object.keys(errors).length === 0;
	};
	
	// Manejar envío del formulario
	const handleSubmit = async () => {
		if (!validateForm()) {
			toast.warning('Por favor, corrige los errores en el formulario');
			return;
		}
		
		try {
			// Preparar credenciales - puede ser email o username
			const credentials = {
				email: formData.email,
				username: formData.email, // Enviar el mismo valor como username también
				password: formData.password
			};
			
			await authActions.login(credentials);
			
			// Verificar si hay una página pendiente de redirección
			const redirectPath = localStorage.getItem('redirectAfterLogin');
			if (redirectPath) {
				localStorage.removeItem('redirectAfterLogin');
				dispatch('loginSuccess', { redirectTo: redirectPath });
			} else {
				dispatch('loginSuccess', { redirectTo: '/' });
			}
		} catch (error) {
			// El error ya se maneja en el store y se muestra como toast
		}
	};
	
	// Manejar tecla Enter
	const handleKeydown = (event) => {
		if (event.key === 'Enter') {
			handleSubmit();
		}
	};
	
	// Limpiar errores cuando el usuario escribe
	const clearFieldError = (field) => {
		if (errors[field]) {
			errors = { ...errors };
			delete errors[field];
		}
		authActions.clearError();
	};
	
	// Datos de demo para mostrar al usuario
	const showDemoCredentials = () => {
		toast.info('Credenciales correctas: Usuario "admin" con contraseña "admin". Otros usuarios/contraseñas serán rechazados.');
	};
</script>

<div class="card shadow-lg border-0">
	<div class="card-header bg-primary text-white text-center py-4">
		<i class="bi bi-shield-lock display-4 mb-3"></i>
		<h3 class="mb-0">Iniciar Sesión</h3>
		<p class="mb-0 opacity-75">Accede a tu sistema de gestión</p>
	</div>
	
	<div class="card-body p-4">
		<form on:submit|preventDefault={handleSubmit}>
			<!-- Usuario -->
			<div class="mb-3">
				<label for="email" class="form-label">
					<i class="bi bi-person me-1"></i>
					Usuario *
				</label>
				<input 
					type="text" 
					class="form-control form-control-lg {errors.email ? 'is-invalid' : ''}" 
					id="email"
					bind:value={formData.email}
					on:input={() => clearFieldError('email')}
					on:keydown={handleKeydown}
					placeholder="admin"
					disabled={loading}
					autocomplete="username"
					required
				/>
				{#if errors.email}
					<div class="invalid-feedback">{errors.email}</div>
				{/if}
				<div class="form-text">
					<i class="bi bi-info-circle me-1"></i>
					Usuario: <code>admin</code>
				</div>
			</div>
			
			<!-- Contraseña -->
			<div class="mb-4">
				<label for="password" class="form-label">
					<i class="bi bi-key me-1"></i>
					Contraseña *
				</label>
				<div class="input-group">
					{#if showPassword}
						<input 
							type="text"
							class="form-control form-control-lg {errors.password ? 'is-invalid' : ''}" 
							id="password"
							bind:value={formData.password}
							on:input={() => clearFieldError('password')}
							on:keydown={handleKeydown}
							placeholder="admin"
							disabled={loading}
							autocomplete="current-password"
							required
						/>
					{:else}
						<input 
							type="password"
							class="form-control form-control-lg {errors.password ? 'is-invalid' : ''}" 
							id="password"
							bind:value={formData.password}
							on:input={() => clearFieldError('password')}
							on:keydown={handleKeydown}
							placeholder="admin"
							disabled={loading}
							autocomplete="current-password"
							required
						/>
					{/if}
					<button 
						class="btn btn-outline-secondary" 
						type="button"
						on:click={() => showPassword = !showPassword}
						disabled={loading}
					>
						<i class="bi bi-eye{showPassword ? '-slash' : ''}"></i>
					</button>
				</div>
				{#if errors.password}
					<div class="invalid-feedback d-block">{errors.password}</div>
				{/if}
			</div>
			
			<!-- Error general -->
			{#if error}
				<div class="alert alert-danger">
					<i class="bi bi-exclamation-triangle me-2"></i>
					{error}
				</div>
			{/if}
			
			<!-- Botón de login -->
			<button 
				type="submit" 
				class="btn btn-primary btn-lg w-100 mb-3"
				disabled={loading}
			>
				{#if loading}
					<span class="spinner-border spinner-border-sm me-2" role="status"></span>
					Verificando credenciales...
				{:else}
					<i class="bi bi-box-arrow-in-right me-2"></i>
					Iniciar Sesión
				{/if}
			</button>
		</form>
		
		<!-- Información de ayuda -->
		<div class="text-center">
			<button 
				type="button"
				class="btn btn-link btn-sm text-muted"
				on:click={showDemoCredentials}
			>
				<i class="bi bi-info-circle me-1"></i>
				¿Necesitas ayuda con las credenciales?
			</button>
		</div>
	</div>
	
	<div class="card-footer bg-light text-center">
		<small class="text-muted">
			<i class="bi bi-shield-check me-1"></i>
			Sistema seguro de autenticación
		</small>
	</div>
</div>
