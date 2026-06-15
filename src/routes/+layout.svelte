<script>
	import './layout.css';
	import { onMount } from 'svelte';
	import { auth } from '$lib/firebase';
	import { user, authLoading } from '$lib/stores';

	let { children } = $props();

	onMount(() => {
		const unsubscribe = auth.onAuthStateChanged((currentUser) => {
			$user = currentUser;
			$authLoading = false;
		});

		return () => unsubscribe();
	});
</script>

<div class="min-h-screen bg-gray-50 text-gray-900 font-sans">
	{#if $authLoading}
		<div class="flex items-center justify-center min-h-screen">
			<div
				class="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-600"
			></div>
		</div>
	{:else}
		{@render children()}
	{/if}
</div>
