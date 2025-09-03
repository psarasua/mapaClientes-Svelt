<script>
	import { page } from '$app/stores';
	import { authStore, isAuthenticated, authActions } from '$lib/stores/authStore.js';
	import { goto } from '$app/navigation';
	
	// Variables reactivas
	$: user = $authStore.user;
	
	const handleLogout = () => {
		authActions.logout();
		goto('/login');
	};
</script>

<nav class="navbar navbar-expand-lg navbar-dark bg-primary sticky-top">
	<div class="container">
		<a class="navbar-brand" href="/">
			<i class="bi bi-house-door me-2"></i>
			Mi Frontend
		</a>
		
		<button 
			class="navbar-toggler" 
			type="button" 
			data-bs-toggle="collapse" 
			data-bs-target="#navbarNav"
		>
			<span class="navbar-toggler-icon"></span>
		</button>
		
		<div class="collapse navbar-collapse" id="navbarNav">
			<ul class="navbar-nav me-auto">
				<li class="nav-item">
					<a 
						class="nav-link {$page.url.pathname === '/' ? 'active' : ''}" 
						href="/"
					>
						<i class="bi bi-house me-1"></i>
						Inicio
					</a>
				</li>
				
				{#if $isAuthenticated}
					<li class="nav-item">
						<a 
							class="nav-link {$page.url.pathname === '/camiones' ? 'active' : ''}" 
							href="/camiones"
						>
							<i class="bi bi-truck me-1"></i>
							Camiones
						</a>
					</li>
					<li class="nav-item">
						<a 
							class="nav-link {$page.url.pathname === '/rutas' ? 'active' : ''}" 
							href="/rutas"
						>
							<i class="bi bi-signpost-2 me-1"></i>
							Rutas
						</a>
					</li>
					<li class="nav-item">
						<a 
							class="nav-link {$page.url.pathname === '/clientes' ? 'active' : ''}" 
							href="/clientes"
						>
							<i class="bi bi-person-badge me-1"></i>
							Clientes
						</a>
					</li>
					<li class="nav-item">
						<a 
							class="nav-link {$page.url.pathname === '/repartos' ? 'active' : ''}" 
							href="/repartos"
						>
							<i class="bi bi-boxes me-1"></i>
							Repartos
						</a>
					</li>
				{/if}
				
				<li class="nav-item">
					<a 
						class="nav-link {$page.url.pathname === '/about' ? 'active' : ''}" 
						href="/about"
					>
						<i class="bi bi-info-circle me-1"></i>
						Acerca de
					</a>
				</li>
			</ul>
			
			<!-- Menú de usuario -->
			<ul class="navbar-nav">
				{#if $isAuthenticated && user}
					<li class="nav-item dropdown">
						<a 
							class="nav-link dropdown-toggle" 
							href="#" 
							role="button" 
							data-bs-toggle="dropdown"
						>
							<i class="bi bi-person-circle me-1"></i>
							{user.name || user.username}
						</a>
						<ul class="dropdown-menu dropdown-menu-end">
							<li>
								<span class="dropdown-item-text">
									<small class="text-muted">
										<i class="bi bi-envelope me-1"></i>
										{user.email || 'Email no disponible'}
									</small>
								</span>
							</li>
							<li><hr class="dropdown-divider"></li>
							<li>
								<button class="dropdown-item" on:click={handleLogout}>
									<i class="bi bi-box-arrow-right me-2"></i>
									Cerrar Sesión
								</button>
							</li>
						</ul>
					</li>
				{:else}
					<li class="nav-item">
						<a 
							class="nav-link {$page.url.pathname === '/login' ? 'active' : ''}" 
							href="/login"
						>
							<i class="bi bi-box-arrow-in-right me-1"></i>
							Iniciar Sesión
						</a>
					</li>
				{/if}
			</ul>
		</div>
	</div>
</nav>
