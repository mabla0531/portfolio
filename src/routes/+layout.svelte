<script lang="ts">
	import './layout.css';
	import mb from '$lib/assets/mb.svg';

	let { children } = $props();
</script>

<svelte:head><link rel="icon" href={mb} /></svelte:head>
{@render children()}
