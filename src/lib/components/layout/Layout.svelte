<script>
	import Header from '../common/Header.svelte';
	import ConnectivityStatus from '../common/ConnectivityStatus.svelte';
</script>

<!-- Indicador de conectividad -->
<ConnectivityStatus />

<div class="d-flex flex-column min-vh-100">
	<Header />
	<main class="container flex-grow-1 py-4">
		<slot />
	</main>
</div>
