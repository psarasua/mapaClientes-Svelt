<script>
	import { page } from '$app/stores';
</script>

<svelte:head>
	<title>Error {$page.status} - Mi Frontend</title>
</svelte:head>

<div class="text-center py-5">
	<div class="row justify-content-center">
		<div class="col-lg-6">
			<i class="bi bi-exclamation-triangle display-1 text-warning mb-4"></i>
			<h1 class="display-4 mb-3">{$page.status}</h1>
			<h2 class="mb-4">
				{#if $page.status === 404}
					Página no encontrada
				{:else if $page.status === 500}
					Error interno del servidor
				{:else}
					Error
				{/if}
			</h2>
			<p class="lead text-muted mb-4">
				{#if $page.status === 404}
					Lo sentimos, la página que estás buscando no existe o ha sido movida.
				{:else}
					Ha ocurrido un error inesperado. Por favor, inténtalo de nuevo más tarde.
				{/if}
			</p>
			<div class="d-flex justify-content-center gap-3">
				<a href="/" class="btn btn-primary btn-lg">
					<i class="bi bi-house-door me-2"></i>
					Volver al Inicio
				</a>
				<button 
					class="btn btn-outline-secondary btn-lg"
					on:click={() => history.back()}
				>
					<i class="bi bi-arrow-left me-2"></i>
					Volver Atrás
				</button>
			</div>
		</div>
	</div>
</div>
