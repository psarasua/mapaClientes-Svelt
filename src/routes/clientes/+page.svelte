<script>
	import ClientesList from '$lib/components/clientes/ClientesList.svelte';
	import ProtectedRoute from '$lib/components/auth/ProtectedRoute.svelte';
</script>

<svelte:head>
	<title>Clientes - Mi Frontend</title>
	<meta name="description" content="Gestión completa de clientes - CRUD con funcionalidades avanzadas, filtros y geolocalización" />
</svelte:head>

<ProtectedRoute>
	<div class="fade-in">
		<div class="row mb-4">
			<div class="col">
				<div class="d-flex align-items-center">
					<i class="bi bi-person-badge display-6 text-primary me-3"></i>
					<div>
						<h1 class="display-5 mb-1">Clientes</h1>
						<p class="lead text-muted mb-0">
							Gestiona tu cartera de clientes con información completa, filtros avanzados y geolocalización
						</p>
					</div>
				</div>
			</div>
		</div>

		<div class="row">
			<div class="col-12">
				<ClientesList />
			</div>
		</div>
	</div>
</ProtectedRoute>
