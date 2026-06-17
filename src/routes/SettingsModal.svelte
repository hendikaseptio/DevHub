<script>
	import { theme, accentColor } from '$lib/stores';

	let { user, onClose, onLogout } = $props();
	const colors = ['indigo', 'emerald', 'rose', 'amber'];

	const handleClearCache = () => {
		if (confirm('Are you sure you want to clear cache? This will refresh the page.')) {
			localStorage.clear();
			if ('serviceWorker' in navigator) {
				navigator.serviceWorker.getRegistrations().then(function (registrations) {
					for (let registration of registrations) {
						registration.unregister();
					}
				});
			}
			window.location.reload();
		}
	};
</script>

<div
	class="fixed inset-0 bg-gray-900/60 dark:bg-gray-950/80 backdrop-blur-md flex items-center justify-center p-4 z-50 animate-in fade-in zoom-in-95 duration-200"
>
	<div class="glass-panel w-full max-w-sm overflow-hidden flex flex-col rounded-3xl relative">
		<!-- Header -->
		<div
			class="px-6 py-5 border-b border-gray-200/50 dark:border-gray-700/50 flex justify-between items-center bg-white/50 dark:bg-gray-800/50 backdrop-blur-sm"
		>
			<h2 class="text-xl font-bold text-gray-900 dark:text-white">Settings</h2>
			<button
				onclick={onClose}
				aria-label="Close settings"
				class="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition-colors p-1.5 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-700 focus:ring-2 focus:ring-accent-500 outline-none"
			>
				<svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"
					><path
						stroke-linecap="round"
						stroke-linejoin="round"
						stroke-width="2"
						d="M6 18L18 6M6 6l12 12"
					></path></svg
				>
			</button>
		</div>

		<!-- Body -->
		<div class="p-6 flex flex-col gap-6 bg-white/30 dark:bg-gray-900/30">
			<!-- Profile -->
			<div
				class="flex items-center gap-4 bg-white/50 dark:bg-gray-800/50 p-4 rounded-2xl border border-gray-200/50 dark:border-gray-700/50"
			>
				<img
					src={user?.photoURL}
					alt={user?.displayName}
					class="w-14 h-14 rounded-full border-2 border-accent-200 dark:border-accent-800"
					referrerpolicy="no-referrer"
				/>
				<div class="flex flex-col overflow-hidden">
					<span class="font-bold text-gray-900 dark:text-white text-lg truncate"
						>{user?.displayName}</span
					>
					<span class="text-sm text-gray-500 dark:text-gray-400 truncate">{user?.email}</span>
				</div>
			</div>

			<!-- Appearance Settings -->
			<div class="flex flex-col gap-3">
				<h3
					class="text-sm font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider pl-2"
				>
					Appearance
				</h3>

				<!-- Theme Toggle -->
				<div
					class="flex items-center justify-between p-4 bg-white/50 dark:bg-gray-800/50 rounded-2xl border border-gray-200/50 dark:border-gray-700/50"
				>
					<div class="flex items-center gap-3 text-gray-700 dark:text-gray-200 font-bold">
						<div class="p-2 bg-gray-100 dark:bg-gray-700 rounded-lg">
							<svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
								<path
									stroke-linecap="round"
									stroke-linejoin="round"
									stroke-width="2"
									d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z"
								></path>
							</svg>
						</div>
						Theme
					</div>
					<button
						onclick={() =>
							($theme = $theme === 'dark' ? 'light' : $theme === 'light' ? 'system' : 'dark')}
						class="px-4 py-2 rounded-xl bg-gray-100 dark:bg-gray-700 text-sm font-bold text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors capitalize min-w-[100px] text-center"
					>
						{$theme}
					</button>
				</div>

				<!-- Accent Color -->
				<div
					class="flex items-center justify-between p-4 bg-white/50 dark:bg-gray-800/50 rounded-2xl border border-gray-200/50 dark:border-gray-700/50"
				>
					<div class="flex items-center gap-3 text-gray-700 dark:text-gray-200 font-bold">
						<div class="p-2 bg-gray-100 dark:bg-gray-700 rounded-lg">
							<svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
								<path
									stroke-linecap="round"
									stroke-linejoin="round"
									stroke-width="2"
									d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2.343M11 7.343l1.657-1.657a2 2 0 012.828 0l2.829 2.829a2 2 0 010 2.828l-8.486 8.485M7 17h.01"
								></path>
							</svg>
						</div>
						Accent Color
					</div>
					<div class="flex items-center gap-1.5">
						{#each colors as color (color)}
							<button
								onclick={() => ($accentColor = color)}
								aria-label={`Set accent color to ${color}`}
								class={`w-7 h-7 rounded-full transition-transform ${$accentColor === color ? 'scale-110 shadow-sm ring-2 ring-offset-2 ring-offset-white dark:ring-offset-gray-800 ring-accent-500' : 'hover:scale-110 opacity-80'}`}
								style={`background-color: var(--color-${color}-500)`}
							></button>
						{/each}
					</div>
				</div>
			</div>

			<!-- Actions -->
			<div class="flex flex-col gap-3">
				<h3
					class="text-sm font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider pl-2"
				>
					System
				</h3>
				<button
					onclick={handleClearCache}
					class="flex items-center justify-between p-4 bg-white/50 dark:bg-gray-800/50 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-2xl border border-gray-200/50 dark:border-gray-700/50 transition-colors group"
				>
					<div class="flex items-center gap-3 text-gray-700 dark:text-gray-200 font-bold">
						<div
							class="p-2 bg-amber-100 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400 rounded-lg group-hover:scale-110 transition-transform"
						>
							<svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"
								><path
									stroke-linecap="round"
									stroke-linejoin="round"
									stroke-width="2"
									d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
								></path></svg
							>
						</div>
						Clear Cache & Reload
					</div>
					<svg class="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"
						><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"
						></path></svg
					>
				</button>

				<button
					onclick={onLogout}
					class="flex items-center justify-between p-4 bg-red-50/50 dark:bg-red-900/10 hover:bg-red-100 dark:hover:bg-red-900/30 rounded-2xl border border-red-100 dark:border-red-800/30 transition-colors group"
				>
					<div class="flex items-center gap-3 text-red-700 dark:text-red-400 font-bold">
						<div
							class="p-2 bg-red-100 dark:bg-red-900/40 rounded-lg group-hover:scale-110 transition-transform"
						>
							<svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"
								><path
									stroke-linecap="round"
									stroke-linejoin="round"
									stroke-width="2"
									d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
								></path></svg
							>
						</div>
						Sign Out
					</div>
				</button>
			</div>
		</div>
	</div>
</div>
