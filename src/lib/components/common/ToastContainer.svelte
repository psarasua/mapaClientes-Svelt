<script>
	import { toasts, toastActions } from '$lib/stores/toastStore.js';
	import Toast from './Toast.svelte';
	
	const handleDismiss = (event) => {
		toastActions.remove(event.detail);
	};
</script>

<!-- Contenedor de toasts fijo en la esquina superior derecha -->
<div class="toast-container position-fixed top-0 end-0 p-3" style="z-index: 1055;">
	{#each $toasts as toast (toast.id)}
		<Toast 
			{toast} 
			on:dismiss={handleDismiss}
		/>
	{/each}
</div>

<style>
	.toast-container {
		max-height: 100vh;
		overflow-y: auto;
		pointer-events: none;
	}
	
	.toast-container :global(.toast) {
		pointer-events: auto;
	}
	
	/* Scrollbar personalizada para el contenedor */
	.toast-container::-webkit-scrollbar {
		width: 4px;
	}
	
	.toast-container::-webkit-scrollbar-track {
		background: transparent;
	}
	
	.toast-container::-webkit-scrollbar-thumb {
		background: rgba(0, 0, 0, 0.2);
		border-radius: 2px;
	}
</style>
