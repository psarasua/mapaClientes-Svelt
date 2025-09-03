<script>
	import CamionesList from '$lib/components/camiones/CamionesList.svelte';
	import ProtectedRoute from '$lib/components/auth/ProtectedRoute.svelte';
</script>

<svelte:head>
	<title>Camiones - Mi Frontend</title>
	<meta name="description" content="Gestión de camiones - CRUD completo" />
</svelte:head>

<ProtectedRoute>
	<div class="fade-in">
		<div class="row mb-4">
			<div class="col">
				<div class="d-flex align-items-center">
					<i class="bi bi-truck display-6 text-primary me-3"></i>
					<div>
						<h1 class="display-5 mb-1">Camiones</h1>
						<p class="lead text-muted mb-0">
							Gestiona tu flota de camiones con operaciones CRUD completas
						</p>
					</div>
				</div>
			</div>
		</div>

		<div class="row">
			<div class="col-12">
				<CamionesList />
			</div>
		</div>
	</div>
</ProtectedRoute>
