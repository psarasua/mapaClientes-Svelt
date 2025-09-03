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
				<div class="card h-100 shadow-sm card-hover">
					<div class="card-body text-center">
						<i class="bi bi-truck display-1 text-primary mb-3"></i>
						<h5 class="card-title">Gestión de Camiones</h5>
						<p class="card-text">
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
			<div class="card h-100 shadow-sm card-hover">
				<div class="card-body text-center">
					<i class="bi bi-signpost-2 display-1 text-success mb-3"></i>
					<h5 class="card-title">Gestión de Rutas</h5>
					<p class="card-text">
						Administra rutas y zonas de cobertura con funcionalidades completas de búsqueda y filtrado.
					</p>
					<a href="/rutas" class="btn btn-success">
						<i class="bi bi-arrow-right me-1"></i>
						Gestionar
					</a>
				</div>
			</div>
		</div>

		<div class="col-md-6 col-lg-4">
			<div class="card h-100 shadow-sm card-hover">
				<div class="card-body text-center">
					<i class="bi bi-person-badge display-1 text-warning mb-3"></i>
					<h5 class="card-title">Gestión de Clientes</h5>
					<p class="card-text">
						Administra tu cartera de clientes con información completa y geolocalización GPS.
					</p>
					<a href="/clientes" class="btn btn-warning">
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
			<div class="card border-primary shadow-lg">
				<div class="card-header bg-primary text-white">
					<h4 class="mb-0">
						<i class="bi bi-boxes me-2"></i>
						Centro de Control - Repartos
					</h4>
				</div>
				<div class="card-body">
					<div class="row align-items-center">
						<div class="col-md-8">
							<h5 class="mb-2">Sistema Central de Gestión</h5>
							<p class="mb-3">
								Los <strong>Repartos</strong> son el corazón de la aplicación. Aquí se conectan todos los elementos:
								clientes, camiones y rutas. Cada reparto incluye ubicación GPS para optimizar las entregas.
							</p>
							<div class="d-flex gap-3 flex-wrap">
								<div class="d-flex align-items-center">
									<i class="bi bi-person-badge text-warning me-1"></i>
									<small>Clientes con ubicación GPS</small>
								</div>
								<div class="d-flex align-items-center">
									<i class="bi bi-truck text-success me-1"></i>
									<small>Asignación de camiones</small>
								</div>
								<div class="d-flex align-items-center">
									<i class="bi bi-signpost-2 text-info me-1"></i>
									<small>Planificación de rutas</small>
								</div>
								<div class="d-flex align-items-center">
									<i class="bi bi-geo-alt text-danger me-1"></i>
									<small>Mapas interactivos</small>
								</div>
							</div>
						</div>
						<div class="col-md-4 text-center">
							<a href="/repartos" class="btn btn-primary btn-lg">
								<i class="bi bi-boxes me-2"></i>
								Gestionar Repartos
							</a>
							<p class="mt-2 mb-0 small text-muted">
								<i class="bi bi-star-fill text-warning me-1"></i>
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
				<div class="card border-primary shadow">
					<div class="card-body text-center p-5">
						<i class="bi bi-shield-lock display-1 text-primary mb-4"></i>
						<h3 class="mb-3">Acceso Restringido</h3>
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
