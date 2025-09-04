<script>
	import { onlineStore } from '../../utils/stores.js';
	import { toast } from '$lib/stores/toastStore.js';
	
	// Store reactivo que detecta conectividad
	$: isOnline = $onlineStore;
	
	// Mostrar toast cuando cambie la conectividad
	let previousStatus = true;
	
	$: {
		if (typeof window !== 'undefined') {
			if (previousStatus !== isOnline) {
				if (isOnline) {
					toast.success('Conexión restaurada');
				} else {
					toast.error('Sin conexión a internet');
				}
				previousStatus = isOnline;
			}
		}
	}
</script>

{#if !isOnline}
	<div class="connectivity-banner">
		<div class="container-fluid">
			<div class="text-center py-2">
				<i class="bi bi-wifi-off me-2"></i>
				<small>Sin conexión - Los datos pueden no estar actualizados</small>
			</div>
		</div>
	</div>
{/if}

<style>
	.connectivity-banner {
		background: linear-gradient(135deg, #dc3545, #c82333);
		color: white;
		position: fixed;
		top: 0;
		left: 0;
		right: 0;
		z-index: 1060;
		animation: slideDown 0.3s ease-out;
	}
	
	@keyframes slideDown {
		from {
			transform: translateY(-100%);
		}
		to {
			transform: translateY(0);
		}
	}
</style>
