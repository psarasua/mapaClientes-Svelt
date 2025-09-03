<script>
	import { onMount } from 'svelte';
	import api from '$lib/services/api.js';
	import Loading from './Loading.svelte';
	import ErrorMessage from './ErrorMessage.svelte';

	let status = 'loading';
	let apiData = null;
	let error = null;

	const checkApiStatus = async () => {
		try {
			status = 'loading';
			error = null;
			
			const response = await api.get('/');
			apiData = response.data;
			status = 'success';
		} catch (err) {
			error = err.message;
			status = 'error';
		}
	};

	onMount(() => {
		checkApiStatus();
	});
</script>

<div class="card">
	<div class="card-header">
		<h5 class="mb-0">
			<i class="bi bi-server me-2"></i>
			Estado de la API
		</h5>
	</div>
	<div class="card-body">
		{#if status === 'loading'}
			<Loading message="Verificando conexión con la API..." />
		{:else if status === 'error'}
			<ErrorMessage 
				message="Error al conectar con la API: {error}" 
				onRetry={checkApiStatus}
			/>
		{:else if status === 'success' && apiData}
			<div class="alert alert-success">
				<i class="bi bi-check-circle-fill me-2"></i>
				<strong>Conexión exitosa!</strong>
			</div>
			
			<div class="row">
				<div class="col-md-6">
					<h6><i class="bi bi-chat-text me-1"></i> Mensaje:</h6>
					<p class="text-success">{apiData.message}</p>
				</div>
				<div class="col-md-6">
					<h6><i class="bi bi-clock me-1"></i> Timestamp:</h6>
					<p class="text-muted">{new Date(apiData.timestamp).toLocaleString('es-ES')}</p>
				</div>
			</div>
			
			{#if apiData.environment}
				<div class="mt-2">
					<span class="badge bg-info">
						<i class="bi bi-gear me-1"></i>
						Entorno: {apiData.environment}
					</span>
				</div>
			{/if}
			
			<div class="mt-3">
				<button class="btn btn-outline-primary btn-sm" on:click={checkApiStatus}>
					<i class="bi bi-arrow-clockwise me-1"></i>
					Verificar nuevamente
				</button>
			</div>
		{/if}
	</div>
</div>
