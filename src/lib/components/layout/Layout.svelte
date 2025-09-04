<script>
	import Header from '../common/Header.svelte';
	import ToastContainer from '../common/ToastContainer.svelte';
</script>

<div class="d-flex flex-column min-vh-100">
	<Header />
	<main class="container flex-grow-1 py-4">
		<slot />
	</main>
</div>

<!-- Sistema de notificaciones toast -->
<ToastContainer />
