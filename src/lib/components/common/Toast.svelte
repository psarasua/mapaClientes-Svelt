<script>
	import { createEventDispatcher, onMount } from 'svelte';
	import { formatDateTime } from '$lib/utils/helpers.js';
	
	export let toast;
	
	const dispatch = createEventDispatcher();
	
	// Configuración de iconos y estilos por tipo
	const toastConfig = {
		success: {
			icon: 'bi-check-circle-fill',
			bgClass: 'bg-success',
			textClass: 'text-white'
		},
		error: {
			icon: 'bi-exclamation-triangle-fill',
			bgClass: 'bg-danger',
			textClass: 'text-white'
		},
		warning: {
			icon: 'bi-exclamation-triangle-fill',
			bgClass: 'bg-warning',
			textClass: 'text-dark'
		},
		info: {
			icon: 'bi-info-circle-fill',
			bgClass: 'bg-info',
			textClass: 'text-white'
		}
	};
	
	$: config = toastConfig[toast.type] || toastConfig.info;
	$: timeAgo = formatDateTime(toast.timestamp);
	
	let progressBar;
	let isVisible = false;
	
	onMount(() => {
		// Animación de entrada
		setTimeout(() => {
			isVisible = true;
		}, 10);
		
		// Barra de progreso si no es persistente
		if (!toast.persistent && toast.duration > 0) {
			let startTime = Date.now();
			const updateProgress = () => {
				const elapsed = Date.now() - startTime;
				const percentage = (elapsed / toast.duration) * 100;
				
				if (progressBar) {
					progressBar.style.width = `${Math.min(percentage, 100)}%`;
				}
				
				if (percentage < 100) {
					requestAnimationFrame(updateProgress);
				}
			};
			updateProgress();
		}
	});
	
	const handleDismiss = () => {
		isVisible = false;
		// Esperar a que termine la animación antes de remover
		setTimeout(() => {
			dispatch('dismiss', toast.id);
		}, 300);
	};
	
	const handleClick = () => {
		if (toast.dismissible) {
			handleDismiss();
		}
	};
</script>

<div 
	class="toast show {config.bgClass} {config.textClass} border-0 shadow-sm {isVisible ? 'toast-visible' : 'toast-hidden'}"
	role={toast.dismissible ? 'button' : 'alert'}
	aria-live="assertive" 
	aria-atomic="true"
	class:clickable={toast.dismissible}
	on:click={handleClick}
	on:keydown={(e) => e.key === 'Enter' && handleClick()}
	tabindex={toast.dismissible ? 0 : undefined}
>
	<div class="toast-header {config.bgClass} {config.textClass} border-0">
		<i class="bi {config.icon} me-2"></i>
		<strong class="me-auto">
			{#if toast.type === 'success'}
				Éxito
			{:else if toast.type === 'error'}
				Error
			{:else if toast.type === 'warning'}
				Advertencia
			{:else}
				Información
			{/if}
		</strong>
		<small class="opacity-75">{timeAgo}</small>
		{#if toast.dismissible}
			<button 
				type="button" 
				class="btn-close {config.textClass === 'text-white' ? 'btn-close-white' : ''} ms-2" 
				aria-label="Cerrar"
				on:click|stopPropagation={handleDismiss}
			></button>
		{/if}
	</div>
	
	<div class="toast-body">
		{toast.message}
	</div>
	
	{#if !toast.persistent && toast.duration > 0}
		<div class="progress" style="height: 3px; border-radius: 0;">
			<div 
				bind:this={progressBar}
				class="progress-bar bg-light opacity-50" 
				role="progressbar"
				style="width: 0%; transition: width 0.1s linear;"
			></div>
		</div>
	{/if}
</div>

<style>
	.toast {
		transition: all 0.3s ease-in-out;
		cursor: default;
		max-width: 350px;
		margin-bottom: 0.5rem;
	}
	
	.toast-visible {
		opacity: 1;
		transform: translateX(0);
	}
	
	.toast-hidden {
		opacity: 0;
		transform: translateX(100%);
	}
	
	.clickable {
		cursor: pointer;
	}
	
	.clickable:hover {
		transform: translateX(-5px);
		box-shadow: 0 0.5rem 1rem rgba(0, 0, 0, 0.15) !important;
	}
	
	.toast-header {
		padding: 0.5rem 0.75rem;
	}
	
	.toast-body {
		padding: 0.75rem;
		word-break: break-word;
	}
</style>
