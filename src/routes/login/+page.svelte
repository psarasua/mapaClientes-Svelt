<script>
	import { onMount } from 'svelte';
	import { goto } from '$app/navigation';
	import { authStore, isAuthenticated } from '$lib/stores/authStore.js';
	import LoginForm from '$lib/components/auth/LoginForm.svelte';
	
	// Si ya está autenticado, redirigir al inicio
	onMount(() => {
		if ($isAuthenticated) {
			goto('/');
		}
	});
	
	// Manejar login exitoso
	const handleLoginSuccess = () => {
		goto('/');
	};
	
	// Redirigir si se autentica durante la sesión
	$: if ($isAuthenticated) {
		goto('/');
	}
</script>

<svelte:head>
	<title>Iniciar Sesión - Mi Frontend</title>
	<meta name="description" content="Accede a tu sistema de gestión logística" />
</svelte:head>

<div class="min-vh-100 d-flex align-items-center bg-light">
	<div class="container-fluid px-4">
		<div class="row justify-content-center">
			<div class="col-md-6 col-lg-5 col-xl-4">
				<!-- Logo/Título de la aplicación -->
				<div class="text-center mb-4">
					<i class="bi bi-truck display-1 text-primary mb-3"></i>
					<h1 class="h3 text-primary">Mi Frontend</h1>
					<p class="text-muted">Sistema de Gestión Logística</p>
				</div>
				
				<!-- Formulario de login -->
				<LoginForm on:loginSuccess={handleLoginSuccess} />
				
				<!-- Información adicional -->
				<div class="text-center mt-4">
					<small class="text-muted">
						<i class="bi bi-shield-lock me-1"></i>
						Acceso seguro al sistema
					</small>
				</div>
			</div>
		</div>
		
		<!-- Información del sistema -->
		<div class="row justify-content-center mt-5">
			<div class="col-md-8 col-lg-6">
				<div class="card border-0 bg-transparent">
					<div class="card-body text-center">
						<h5 class="text-muted mb-3">
							<i class="bi bi-info-circle me-2"></i>
							Funcionalidades del Sistema
						</h5>
						<div class="row g-3">
							<div class="col-6 col-md-3">
								<div class="text-center">
									<i class="bi bi-truck text-success mb-2 fs-4"></i>
									<br>
									<small class="text-muted">Camiones</small>
								</div>
							</div>
							<div class="col-6 col-md-3">
								<div class="text-center">
									<i class="bi bi-signpost-2 text-info mb-2 fs-4"></i>
									<br>
									<small class="text-muted">Rutas</small>
								</div>
							</div>
							<div class="col-6 col-md-3">
								<div class="text-center">
									<i class="bi bi-person-badge text-warning mb-2 fs-4"></i>
									<br>
									<small class="text-muted">Clientes</small>
								</div>
							</div>
							<div class="col-6 col-md-3">
								<div class="text-center">
									<i class="bi bi-boxes text-primary mb-2 fs-4"></i>
									<br>
									<small class="text-muted">Repartos</small>
								</div>
							</div>
						</div>
					</div>
				</div>
			</div>
		</div>
	</div>
</div>
