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

<nav class="navbar navbar-expand-lg sticky-top">
	<div class="container">
		<a class="navbar-brand" href="/">
			<div class="logo">
				<div class="logo-cubes">
					<div class="cube cube-1"></div>
					<div class="cube cube-2"></div>
					<div class="cube cube-3"></div>
				</div>
				<span class="logo-text">LogiFlow</span>
			</div>
		</a>
		
		<button 
			class="navbar-toggler border-0" 
			type="button" 
			data-bs-toggle="collapse" 
			data-bs-target="#navbarNav"
			style="border: none !important; box-shadow: none !important;"
		>
			<span class="navbar-toggler-icon" style="background-image: url('data:image/svg+xml,%3csvg xmlns=\'http://www.w3.org/2000/svg\' viewBox=\'0 0 30 30\'%3e%3cpath stroke=\'rgba%28255, 255, 255, 0.8%29\' stroke-linecap=\'round\' stroke-miterlimit=\'10\' stroke-width=\'2\' d=\'M4 7h22M4 15h22M4 23h22\'/%3e%3c/svg%3e') !important;"></span>
		</button>
		
		<div class="collapse navbar-collapse" id="navbarNav">
			<ul class="navbar-nav me-auto">
				<li class="nav-item">
					<a 
						class="nav-link {$page.url.pathname === '/' ? 'active' : ''}" 
						href="/"
					>
						<i class="bi bi-house me-1"></i>
						Dashboard
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
						<ul class="dropdown-menu dropdown-menu-end shadow-lg" style="border: none; border-radius: var(--radius-lg);">
							<li>
								<span class="dropdown-item-text px-3 py-2">
									<small class="text-muted d-flex align-items-center">
										<i class="bi bi-envelope me-2"></i>
										{user.email || 'Email no disponible'}
									</small>
								</span>
							</li>
							<li><hr class="dropdown-divider my-2"></li>
							<li>
								<button class="dropdown-item px-3 py-2" on:click={handleLogout} style="transition: all 0.2s ease;">
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
