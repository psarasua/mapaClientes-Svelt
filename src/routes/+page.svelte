<script>
	import { onMount } from 'svelte';
	import { isAuthenticated, authStore } from '$lib/stores/authStore.js';
	import ApiStatus from '$lib/components/common/ApiStatus.svelte';

	$: user = $authStore.user;

	onMount(() => {
		// Aquí puedes agregar lógica de inicialización si es necesaria
	});
</script>

<svelte:head>
	<title>Inicio - Mi Frontend</title>
	<meta name="description" content="Página de inicio de Mi Frontend en SvelteKit" />
</svelte:head>

<div class="fade-in">
	<div class="row mb-4">
		<div class="col">
			<h1 class="display-4 text-center mb-4">
				<i class="bi bi-house-door me-3"></i>
				{#if $isAuthenticated && user}
					¡Bienvenido, {user.name || user.username}!
				{:else}
					Bienvenido a Mi Frontend
				{/if}
			</h1>
			<p class="lead text-center text-muted">
				{#if $isAuthenticated}
					Sistema de Gestión Logística - Panel de Control
				{:else}
					Una aplicación SvelteKit moderna para consumir tu API
				{/if}
			</p>
		</div>
	</div>

	{#if $isAuthenticated}
		<div class="row g-4">
			<div class="col-md-6 col-lg-4">
				<div class="card h-100 fade-in">
					<div class="card-header text-center">
						<i class="bi bi-truck display-1 mb-3" style="color: var(--primary);"></i>
						<h5 class="card-title mb-0">Gestión de Camiones</h5>
					</div>
					<div class="card-body text-center">
						<p class="card-text text-muted mb-4">
							CRUD completo para gestionar tu flota de camiones con operaciones en tiempo real.
						</p>
						<a href="/camiones" class="btn btn-primary">
							<i class="bi bi-arrow-right me-1"></i>
							Gestionar
						</a>
					</div>
				</div>
			</div>

		<div class="col-md-6 col-lg-4">
			<div class="card h-100 fade-in" style="animation-delay: 0.1s;">
				<div class="card-header text-center">
					<i class="bi bi-signpost-2 display-1 mb-3" style="color: var(--success);"></i>
					<h5 class="card-title mb-0">Gestión de Rutas</h5>
				</div>
				<div class="card-body text-center">
					<p class="card-text text-muted mb-4">
						Administra rutas y zonas de cobertura con funcionalidades completas de búsqueda y filtrado.
					</p>
					<a href="/rutas" class="btn btn-primary">
						<i class="bi bi-arrow-right me-1"></i>
						Gestionar
					</a>
				</div>
			</div>
		</div>

		<div class="col-md-6 col-lg-4">
			<div class="card h-100 fade-in" style="animation-delay: 0.2s;">
				<div class="card-header text-center">
					<i class="bi bi-person-badge display-1 mb-3" style="color: var(--orange);"></i>
					<h5 class="card-title mb-0">Gestión de Clientes</h5>
				</div>
				<div class="card-body text-center">
					<p class="card-text text-muted mb-4">
						Administra tu cartera de clientes con información completa y geolocalización GPS.
					</p>
					<a href="/clientes" class="btn btn-primary">
						<i class="bi bi-arrow-right me-1"></i>
						Gestionar
					</a>
				</div>
			</div>
		</div>
		</div>

		<!-- Centro de Control - Repartos -->
		<div class="row mt-5">
		<div class="col-12">
			<div class="card fade-in" style="animation-delay: 0.3s;">
				<div class="card-header" style="background-color: var(--primary); color: var(--text-white);">
					<h4 class="mb-0 d-flex align-items-center">
						<i class="bi bi-boxes me-2"></i>
						Centro de Control - Repartos
					</h4>
				</div>
				<div class="card-body">
					<div class="row align-items-center">
						<div class="col-md-8">
							<h5 class="mb-3" style="color: var(--primary);">Sistema Central de Gestión</h5>
							<p class="mb-4 text-muted">
								Los <strong>Repartos</strong> son el corazón de la aplicación. Aquí se conectan todos los elementos:
								clientes, camiones y rutas. Cada reparto incluye ubicación GPS para optimizar las entregas.
							</p>
							<div class="d-flex gap-4 flex-wrap">
								<div class="d-flex align-items-center">
									<div class="badge me-2" style="background-color: var(--orange);">
										<i class="bi bi-person-badge me-1"></i>
									</div>
									<small class="text-muted">Clientes con GPS</small>
								</div>
								<div class="d-flex align-items-center">
									<div class="badge me-2" style="background-color: var(--success);">
										<i class="bi bi-truck me-1"></i>
									</div>
									<small class="text-muted">Asignación de camiones</small>
								</div>
								<div class="d-flex align-items-center">
									<div class="badge me-2" style="background-color: var(--accent);">
										<i class="bi bi-signpost-2 me-1"></i>
									</div>
									<small class="text-muted">Planificación de rutas</small>
								</div>
								<div class="d-flex align-items-center">
									<div class="badge me-2" style="background-color: var(--primary);">
										<i class="bi bi-geo-alt me-1"></i>
									</div>
									<small class="text-muted">Mapas interactivos</small>
								</div>
							</div>
						</div>
						<div class="col-md-4 text-center">
							<a href="/repartos" class="btn btn-primary btn-lg mb-3">
								<i class="bi bi-boxes me-2"></i>
								Gestionar Repartos
							</a>
							<p class="mb-0 small text-muted d-flex align-items-center justify-content-center">
								<i class="bi bi-star-fill me-1" style="color: var(--orange);"></i>
								Funcionalidad Principal
							</p>
						</div>
					</div>
				</div>
			</div>
			</div>
		</div>
	{:else}
		<!-- Contenido para usuarios no autenticados -->
		<div class="row justify-content-center">
			<div class="col-md-8 col-lg-6">
				<div class="card shadow-lg fade-in">
					<div class="card-body text-center p-5">
						<i class="bi bi-shield-lock display-1 text-primary mb-4"></i>
						<h3 class="mb-3 text-gradient-primary">Acceso Restringido</h3>
						<p class="text-muted mb-4">
							Para acceder al sistema de gestión logística necesitas iniciar sesión con tus credenciales.
						</p>
						<a href="/login" class="btn btn-primary btn-lg">
							<i class="bi bi-box-arrow-in-right me-2"></i>
							Iniciar Sesión
						</a>
					</div>
				</div>
			</div>
		</div>
	{/if}

	<!-- Estado de la API -->
	<div class="row mt-4">
		<div class="col-12">
			<ApiStatus />
		</div>
	</div>
</div>
