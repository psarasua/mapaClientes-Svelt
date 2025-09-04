<script>
	import { onMount } from 'svelte';
	import { goto } from '$app/navigation';
	import { isAuthenticated, authStore, authActions } from '$lib/stores/authStore.js';
	import ApiStatus from '$lib/components/common/ApiStatus.svelte';

	$: user = $authStore.user;

	onMount(async () => {
		// Verificar autenticación al cargar
		await authActions.checkAuth();
		
		// Si no está autenticado, redirigir inmediatamente a login
		if (!$isAuthenticated) {
			goto('/login');
			return;
		}
	});

	// Reactivo para cambios en autenticación
	$: if (!$isAuthenticated && typeof window !== 'undefined') {
		goto('/login');
	}
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
					¡Bienvenido, {user.name || user.username || 'Usuario'}!
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

	<!-- Solo mostrar contenido si está autenticado -->
	{#if $isAuthenticated}
		<!-- Dashboard - En construcción -->
		<div class="row justify-content-center">
			<div class="col-12 text-center py-5">
				<div class="text-muted">
					<i class="bi bi-tools display-1 mb-3"></i>
					<h3>Dashboard en construcción</h3>
					<p>Esta sección se desarrollará próximamente</p>
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
