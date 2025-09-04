<script>
	import '../app.css';
	import Layout from '$lib/components/layout/Layout.svelte';
	import { onMount } from 'svelte';
	import { authActions } from '$lib/stores/authStore.js';
	import { Toaster } from 'svelte-french-toast';

	// Importar Bootstrap JS y verificar autenticación
	onMount(async () => {
		if (typeof window !== 'undefined') {
			await import('bootstrap/dist/js/bootstrap.bundle.min.js');
			// Verificar autenticación al cargar la aplicación
			await authActions.checkAuth();
		}
	});
</script>

<Layout>
	<slot />
</Layout>

<!-- Toaster de svelte-french-toast configurado para bottom-right -->
<Toaster position="bottom-right" />
