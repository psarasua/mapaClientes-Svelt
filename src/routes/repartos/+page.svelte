<script>
	import RepartosList from '$lib/components/repartos/RepartosList.svelte';
	import ProtectedRoute from '$lib/components/auth/ProtectedRoute.svelte';
</script>

<svelte:head>
	<title>Repartos - Mi Frontend</title>
	<meta name="description" content="Gestión completa de repartos - Sistema central que conecta clientes, camiones y rutas con mapas GPS" />
</svelte:head>

<ProtectedRoute>
	<div class="fade-in">
		<div class="row mb-4">
			<div class="col">
				<div class="d-flex align-items-center">
					<i class="bi bi-boxes display-6 text-primary me-3"></i>
					<div>
						<h1 class="display-5 mb-1">Repartos</h1>
						<p class="lead text-muted mb-0">
							Sistema central de gestión que conecta clientes, camiones y rutas con ubicación GPS
						</p>
					</div>
				</div>
			</div>
		</div>

		<div class="row">
			<div class="col-12">
				<!-- Información del sistema -->
				<div class="alert alert-info mb-4">
					<div class="d-flex align-items-center">
						<i class="bi bi-info-circle-fill me-2"></i>
						<div>
							<strong>Centro de Control de Repartos</strong>
							<p class="mb-0 small">
								Esta es la tabla principal que conecta toda la aplicación. Cada reparto asigna un cliente específico a un camión y una ruta determinada. 
								Usa el botón de mapa <i class="bi bi-geo-alt text-success"></i> para ver la ubicación GPS de cada cliente.
							</p>
						</div>
					</div>
				</div>
				
				<RepartosList />
			</div>
		</div>
	</div>
</ProtectedRoute>
