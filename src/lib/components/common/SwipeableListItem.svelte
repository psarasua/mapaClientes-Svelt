<script>
	import { createEventDispatcher } from 'svelte';
	import { pan } from 'svelte-gestures';
	import { windowSize } from '../../utils/stores.js';
	
	export let item;
	export let showActions = true;
	
	const dispatch = createEventDispatcher();
	
	// Detectar si es móvil
	$: isMobile = $windowSize.width < 768;
	
	let element;
	let isOpen = false;
	let translateX = 0;
	
	// Configuración del swipe
	const panConfig = {
		threshold: 10, // Píxeles mínimos para activar
		delay: 0
	};
	
	// Manejar gestos de pan (swipe)
	const handlePan = (event) => {
		if (!isMobile || !showActions) return;
		
		const { direction, deltaX } = event.detail;
		
		if (direction === 'left' && deltaX < -50) {
			// Swipe left - mostrar acciones
			isOpen = true;
			translateX = -80; // Mostrar 80px de acciones
		} else if (direction === 'right' && deltaX > 50) {
			// Swipe right - ocultar acciones
			isOpen = false;
			translateX = 0;
		}
	};
	
	// Cerrar acciones al hacer click fuera
	const handleClick = () => {
		if (isOpen) {
			isOpen = false;
			translateX = 0;
		}
	};
	
	// Acciones rápidas
	const handleEdit = (e) => {
		e.stopPropagation();
		dispatch('edit', item);
		isOpen = false;
		translateX = 0;
	};
	
	const handleDelete = (e) => {
		e.stopPropagation();
		dispatch('delete', item);
		isOpen = false;
		translateX = 0;
	};
	
	const handleView = (e) => {
		e.stopPropagation();
		dispatch('view', item);
		isOpen = false;
		translateX = 0;
	};
</script>

<div 
	class="swipeable-item {isMobile ? 'mobile' : ''}"
	bind:this={element}
	use:pan={panConfig}
	on:pan={handlePan}
	on:click={handleClick}
	on:keydown={(e) => e.key === 'Enter' && handleClick()}
	role="button"
	tabindex="0"
	style="transform: translateX({translateX}px);"
>
	<!-- Contenido principal -->
	<div class="item-content">
		<slot />
	</div>
	
	<!-- Acciones de swipe (solo móvil) -->
	{#if isMobile && showActions}
		<div class="swipe-actions">
			<button 
				class="action-btn view-btn" 
				on:click={handleView}
				title="Ver detalles"
			>
				<i class="bi bi-eye"></i>
			</button>
			<button 
				class="action-btn edit-btn" 
				on:click={handleEdit}
				title="Editar"
			>
				<i class="bi bi-pencil"></i>
			</button>
			<button 
				class="action-btn delete-btn" 
				on:click={handleDelete}
				title="Eliminar"
			>
				<i class="bi bi-trash"></i>
			</button>
		</div>
	{/if}
</div>

<style>
	.swipeable-item {
		position: relative;
		background: white;
		border-radius: 8px;
		overflow: hidden;
		transition: transform 0.3s ease;
		margin-bottom: 0.5rem;
	}
	
	.swipeable-item.mobile {
		cursor: grab;
	}
	
	.swipeable-item.mobile:active {
		cursor: grabbing;
	}
	
	.item-content {
		padding: 1rem;
		background: white;
		position: relative;
		z-index: 1;
	}
	
	.swipe-actions {
		position: absolute;
		right: 0;
		top: 0;
		height: 100%;
		display: flex;
		align-items: center;
		background: #f8f9fa;
		padding: 0 0.5rem;
		gap: 0.25rem;
	}
	
	.action-btn {
		width: 35px;
		height: 35px;
		border: none;
		border-radius: 6px;
		display: flex;
		align-items: center;
		justify-content: center;
		font-size: 14px;
		transition: all 0.2s ease;
	}
	
	.view-btn {
		background: #17a2b8;
		color: white;
	}
	
	.edit-btn {
		background: #ffc107;
		color: #212529;
	}
	
	.delete-btn {
		background: #dc3545;
		color: white;
	}
	
	.action-btn:hover {
		transform: scale(1.1);
		box-shadow: 0 2px 8px rgba(0,0,0,0.2);
	}
</style>
