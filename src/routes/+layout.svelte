<script>
	import './layout.css';
	import { onMount } from 'svelte';
	import { auth } from '$lib/firebase';
	import { user, authLoading, theme, accentColor } from '$lib/stores';

	let { children } = $props();

	onMount(() => {
		// Initialize theme from localStorage
		const savedTheme = localStorage.getItem('theme');
		if (savedTheme) {
			$theme = savedTheme;
		}

		const savedAccent = localStorage.getItem('accentColor');
		if (savedAccent) {
			$accentColor = savedAccent;
		}

		// Auth listener
		const unsubscribe = auth.onAuthStateChanged((currentUser) => {
			$user = currentUser;
			$authLoading = false;
		});

		return () => unsubscribe();
	});

	// Effect to apply theme
	$effect(() => {
		if (typeof document !== 'undefined') {
			const isDark =
				$theme === 'dark' ||
				($theme === 'system' && window.matchMedia('(prefers-color-scheme: dark)').matches);

			if (isDark) {
				document.documentElement.classList.add('dark');
			} else {
				document.documentElement.classList.remove('dark');
			}
			localStorage.setItem('theme', $theme);
		}
	});

	// Effect to apply accent color
	$effect(() => {
		if (typeof document !== 'undefined') {
			document.documentElement.setAttribute('data-accent', $accentColor);
			localStorage.setItem('accentColor', $accentColor);
		}
	});
</script>

<div class="min-h-screen font-sans">
	{#if $authLoading}
		<div class="flex items-center justify-center min-h-screen">
			<div
				class="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[var(--color-accent-600)] dark:border-[var(--color-accent-400)]"
			></div>
		</div>
	{:else}
		{@render children()}
	{/if}
</div>
