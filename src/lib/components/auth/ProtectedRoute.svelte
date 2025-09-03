<script>
	import { onMount } from 'svelte';
	import { goto } from '$app/navigation';
	import { page } from '$app/stores';
	import { authStore, isAuthenticated, authActions } from '$lib/stores/authStore.js';
	import Loading from '../common/Loading.svelte';
	
	export let redirectTo = '/login';
	
	let checking = true;
	
	onMount(async () => {
		// Verificar autenticación al cargar
		await authActions.checkAuth();
		checking = false;
		
		// Si no está autenticado, redirigir
		if (!$isAuthenticated) {
			// Guardar la página actual para redirigir después del login
			const currentPath = $page.url.pathname;
			if (currentPath !== '/login') {
				localStorage.setItem('redirectAfterLogin', currentPath);
			}
			goto(redirectTo);
		}
	});
	
	// Reactivo para cambios en autenticación
	$: if (!checking && !$isAuthenticated) {
		goto(redirectTo);
	}
</script>

{#if checking}
	<Loading message="Verificando autenticación..." />
{:else if $isAuthenticated}
	<slot />
{:else}
	<div class="text-center py-5">
		<i class="bi bi-shield-x display-1 text-warning mb-3"></i>
		<h3>Acceso Restringido</h3>
		<p class="text-muted">Necesitas iniciar sesión para acceder a esta página</p>
		<a href="/login" class="btn btn-primary">
			<i class="bi bi-box-arrow-in-right me-1"></i>
			Iniciar Sesión
		</a>
	</div>
{/if}
