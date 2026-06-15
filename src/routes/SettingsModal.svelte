<script>
	let { user, onClose, onLogout } = $props();

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

			<!-- Actions -->
			<div class="flex flex-col gap-3">
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
