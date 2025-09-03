<script>
	export let message = 'Cargando...';
</script>

<div class="container d-flex justify-content-center align-items-center py-5">
	<div class="row">
		<div class="col text-center">
			<div class="spinner-border text-primary mb-3" role="status">
				<span class="visually-hidden">Cargando...</span>
			</div>
			<p class="text-muted">{message}</p>
		</div>
	</div>
</div>
