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
	
	let errors = {
		email: '',
		password: ''
	};
	let showPassword = false;
	
	// Validar formulario
	const validateForm = () => {
		errors.email = '';
		errors.password = '';
		
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
		if (field === 'email') {
			errors.email = '';
		} else if (field === 'password') {
			errors.password = '';
		}
		authActions.clearError();
	};
	
	// Datos de demo para mostrar al usuario
	const showDemoCredentials = () => {
		toast.info('Credenciales correctas: Usuario "admin" con contraseña "admin". Otros usuarios/contraseñas serán rechazados.');
	};
</script>

<div class="login-container fade-in">
	<div class="login-form">
		<!-- Logo -->
		<div class="logo-section">
			<div class="logo">
				<div class="logo-cubes">
					<div class="cube cube-1"></div>
					<div class="cube cube-2"></div>
					<div class="cube cube-3"></div>
				</div>
				<span class="logo-text">LogiFlow</span>
			</div>
		</div>
		
		<!-- Título -->
		<div class="form-title">
			<h2>Inicia sesión en tu cuenta</h2>
		</div>
		
		<div class="form-content">
			<form on:submit|preventDefault={handleSubmit}>
			<!-- Usuario -->
			<div class="form-group">
				<input 
					type="text" 
					class="form-input {errors.email ? 'error' : ''}" 
					id="email"
					bind:value={formData.email}
					on:input={() => clearFieldError('email')}
					on:keydown={handleKeydown}
					placeholder="Usuario"
					disabled={loading}
					autocomplete="username"
					required
				/>
				{#if errors.email}
					<div class="error-message">{errors.email}</div>
				{/if}
			</div>
			
			<!-- Contraseña -->
			<div class="form-group">
				{#if showPassword}
					<input 
						type="text"
						class="form-input {errors.password ? 'error' : ''}" 
						id="password"
						bind:value={formData.password}
						on:input={() => clearFieldError('password')}
						on:keydown={handleKeydown}
						placeholder="Contraseña"
						disabled={loading}
						autocomplete="current-password"
						required
					/>
				{:else}
					<input 
						type="password"
						class="form-input {errors.password ? 'error' : ''}" 
						id="password"
						bind:value={formData.password}
						on:input={() => clearFieldError('password')}
						on:keydown={handleKeydown}
						placeholder="Contraseña"
						disabled={loading}
						autocomplete="current-password"
						required
					/>
				{/if}
				<button 
					class="password-toggle" 
					type="button"
					on:click={() => showPassword = !showPassword}
					disabled={loading}
				>
					<i class="bi bi-eye{showPassword ? '-slash' : ''}"></i>
				</button>
				{#if errors.password}
					<div class="error-message">{errors.password}</div>
				{/if}
			</div>
			
			<!-- Error general -->
			{#if error}
				<div class="error-alert">
					<i class="bi bi-exclamation-triangle"></i>
					{error}
				</div>
			{/if}
			
			<!-- Botón de login -->
			<button 
				type="submit" 
				class="login-button"
				disabled={loading}
			>
				{#if loading}
					<span class="spinner"></span>
					Verificando...
				{:else}
					INICIAR SESIÓN
				{/if}
			</button>
			</form>
		</div>
		
		<!-- Enlaces -->
		<div class="form-links">
			<button 
				type="button"
				class="link-button"
				on:click={showDemoCredentials}
			>
				¿Olvidaste tu contraseña?
			</button>
			<div class="register-link">
				¿No tienes una cuenta? <a href="/register" class="register-text">Regístrate aquí</a>
			</div>
		</div>
		
		<!-- Footer -->
		<div class="form-footer">
			<small>Términos de uso. Política de privacidad</small>
		</div>
	</div>
</div>
