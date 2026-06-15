<script>
	let { project, onClose, onSave } = $props();

	// svelte-ignore state_referenced_locally
	let formData = $state({
		name: project?.name || '',
		category: project?.category || '',
		repo: project?.repo || '',
		progressNotes: project?.progressNotes || '',
		bugNotes: project?.bugNotes || '',
		status: project?.status || 'In Development'
	});

	let isSubmitting = $state(false);

	const handleSubmit = async () => {
		if (!formData.name.trim()) {
			alert('Project name is required');
			return;
		}

		isSubmitting = true;
		await onSave(formData);
		isSubmitting = false;
	};
</script>

<div
	class="fixed inset-0 bg-gray-900/60 dark:bg-gray-950/80 backdrop-blur-md flex items-center justify-center p-4 z-50 animate-in fade-in zoom-in-95 duration-200"
>
	<div class="glass-panel w-full max-w-lg overflow-hidden flex flex-col max-h-[90vh] rounded-3xl">
		<!-- Header -->
		<div
			class="px-6 py-5 border-b border-gray-200/50 dark:border-gray-700/50 flex justify-between items-center bg-white/50 dark:bg-gray-800/50 backdrop-blur-sm"
		>
			<div class="flex items-center gap-3">
				<div
					class="w-8 h-8 rounded-lg bg-accent-100 dark:bg-accent-900/50 text-accent-600 dark:text-accent-400 flex items-center justify-center border border-accent-200 dark:border-accent-700"
				>
					<svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"
						><path
							stroke-linecap="round"
							stroke-linejoin="round"
							stroke-width="2"
							d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
						></path></svg
					>
				</div>
				<h2 class="text-xl font-bold text-gray-900 dark:text-white">
					{project ? 'Edit Project' : 'New Project'}
				</h2>
			</div>
			<button
				onclick={onClose}
				aria-label="Close modal"
				class="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition-colors p-1.5 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-700 focus:ring-2 focus:ring-accent-500 outline-none"
			>
				<svg
					class="w-5 h-5"
					fill="none"
					stroke="currentColor"
					viewBox="0 0 24 24"
					xmlns="http://www.w3.org/2000/svg"
					><path
						stroke-linecap="round"
						stroke-linejoin="round"
						stroke-width="2"
						d="M6 18L18 6M6 6l12 12"
					></path></svg
				>
			</button>
		</div>

		<!-- Form Body -->
		<div class="p-6 overflow-y-auto bg-white/30 dark:bg-gray-900/30">
			<form
				onsubmit={(e) => {
					e.preventDefault();
					handleSubmit();
				}}
				class="space-y-5"
			>
				<!-- Name Field -->
				<div>
					<label for="name" class="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-1"
						>Project Name <span class="text-red-500">*</span></label
					>
					<input
						type="text"
						id="name"
						bind:value={formData.name}
						placeholder="e.g. Awesome Web App"
						class="w-full px-4 py-2.5 bg-white/50 dark:bg-gray-900/50 border border-gray-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-accent-500 focus:border-accent-500 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 outline-none transition-all"
						required
					/>
				</div>

				<!-- Category Field -->
				<div>
					<label
						for="category"
						class="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-1"
						>Project Category</label
					>
					<input
						type="text"
						id="category"
						bind:value={formData.category}
						placeholder="e.g. Blog, Wedding, E-commerce"
						class="w-full px-4 py-2.5 bg-white/50 dark:bg-gray-900/50 border border-gray-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-accent-500 focus:border-accent-500 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 outline-none transition-all"
					/>
				</div>

				<!-- Repo Field -->
				<div>
					<label for="repo" class="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-1"
						>Repository Link</label
					>
					<input
						type="url"
						id="repo"
						bind:value={formData.repo}
						placeholder="e.g. https://github.com/username/repo"
						class="w-full px-4 py-2.5 bg-white/50 dark:bg-gray-900/50 border border-gray-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-accent-500 focus:border-accent-500 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 outline-none transition-all"
					/>
				</div>

				<!-- Status Field -->
				<div>
					<label for="status" class="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-1"
						>Status</label
					>
					<div class="relative">
						<select
							id="status"
							bind:value={formData.status}
							class="w-full px-4 py-2.5 bg-white/50 dark:bg-gray-900/50 border border-gray-200 dark:border-gray-700 rounded-xl appearance-none focus:ring-2 focus:ring-accent-500 focus:border-accent-500 dark:text-white outline-none transition-all pr-10"
						>
							<option value="In Development">In Development</option>
							<option value="Completed">Completed</option>
						</select>
						<div
							class="pointer-events-none absolute inset-y-0 right-0 flex items-center px-4 text-gray-500 dark:text-gray-400"
						>
							<svg class="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"
								><path
									stroke-linecap="round"
									stroke-linejoin="round"
									stroke-width="2"
									d="M19 9l-7 7-7-7"
								></path></svg
							>
						</div>
					</div>
				</div>

				<!-- Progress Notes -->
				<div>
					<label
						for="progressNotes"
						class="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-1"
						>Progress Notes</label
					>
					<textarea
						id="progressNotes"
						bind:value={formData.progressNotes}
						rows="3"
						placeholder="What are you currently working on?"
						class="w-full px-4 py-2.5 bg-white/50 dark:bg-gray-900/50 border border-gray-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-accent-500 focus:border-accent-500 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 outline-none transition-all resize-none"
					></textarea>
				</div>

				<!-- Bug Notes -->
				<div>
					<label
						for="bugNotes"
						class="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-1">Bug Notes</label
					>
					<textarea
						id="bugNotes"
						bind:value={formData.bugNotes}
						rows="3"
						placeholder="Any known issues or bugs?"
						class="w-full px-4 py-2.5 bg-white/50 dark:bg-gray-900/50 border border-gray-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-accent-500 focus:border-accent-500 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 outline-none transition-all resize-none"
					></textarea>
				</div>
			</form>
		</div>

		<!-- Footer -->
		<div
			class="px-6 py-5 border-t border-gray-200/50 dark:border-gray-700/50 flex justify-end gap-3 bg-white/50 dark:bg-gray-800/50 backdrop-blur-sm"
		>
			<button
				type="button"
				onclick={onClose}
				class="px-5 py-2.5 text-sm font-bold text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-600 rounded-xl shadow-sm hover:bg-gray-50 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-200 dark:focus:ring-gray-600 transition-all"
			>
				Cancel
			</button>
			<button
				type="button"
				onclick={handleSubmit}
				disabled={isSubmitting}
				class="px-6 py-2.5 text-sm font-bold text-white bg-accent-600 border border-transparent rounded-xl shadow-lg shadow-accent-500/30 hover:bg-accent-700 hover:shadow-xl hover:-translate-y-0.5 focus:outline-none focus:ring-2 focus:ring-accent-500 focus:ring-offset-2 dark:focus:ring-offset-gray-900 transition-all flex items-center justify-center min-w-[120px]"
			>
				{#if isSubmitting}
					<div class="animate-spin rounded-full h-5 w-5 border-t-2 border-b-2 border-white"></div>
				{:else}
					Save Project
				{/if}
			</button>
		</div>
	</div>
</div>
