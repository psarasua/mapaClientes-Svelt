<script>
	import RutasList from '$lib/components/rutas/RutasList.svelte';
	import ProtectedRoute from '$lib/components/auth/ProtectedRoute.svelte';
</script>

<svelte:head>
	<title>Rutas - Mi Frontend</title>
	<meta name="description" content="Gestión de rutas - CRUD completo con funcionalidades avanzadas" />
</svelte:head>

<ProtectedRoute>
	<div class="fade-in">
		<div class="row mb-4">
			<div class="col">
				<div class="d-flex align-items-center">
					<i class="bi bi-signpost-2 display-6 text-primary me-3"></i>
					<div>
						<h1 class="display-5 mb-1">Rutas</h1>
						<p class="lead text-muted mb-0">
							Gestiona las rutas y zonas de cobertura con operaciones CRUD completas
						</p>
					</div>
				</div>
			</div>
		</div>

		<div class="row">
			<div class="col-12">
				<RutasList />
			</div>
		</div>
	</div>
</ProtectedRoute>
