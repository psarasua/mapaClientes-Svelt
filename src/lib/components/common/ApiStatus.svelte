<script>
	import { onMount } from 'svelte';
	import api from '$lib/services/api.js';

	let status = 'checking';

	const checkApi = async () => {
		try {
			await api.get('/');
			status = 'ok';
		} catch (err) {
			status = 'error';
		}
	};

	onMount(() => {
		checkApi();
	});
</script>

<div class="small text-muted text-center py-2">
	{#if status === 'checking'}
		<i class="bi bi-circle text-warning"></i> Verificando API...
	{:else if status === 'ok'}
		<i class="bi bi-check-circle text-success"></i> API conectada
	{:else}
		<i class="bi bi-x-circle text-danger"></i> API desconectada
	{/if}
</div>
