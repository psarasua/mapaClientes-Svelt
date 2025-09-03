<script>
	export let message = 'Ha ocurrido un error inesperado';
	export let onRetry = null;
	export let variant = 'danger';
</script>

<div class="alert alert-{variant} d-flex align-items-center justify-content-between">
	<div class="d-flex align-items-center">
		<i class="bi bi-exclamation-triangle-fill me-2"></i>
		<span>{message}</span>
	</div>
	{#if onRetry}
		<button class="btn btn-outline-{variant} btn-sm" on:click={onRetry}>
			<i class="bi bi-arrow-clockwise me-1"></i>
			Reintentar
		</button>
	{/if}
</div>
