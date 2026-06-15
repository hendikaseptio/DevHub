<script>
	let { project = null, onClose, onSave } = $props();

	let formData = $state({
		name: project?.name || '',
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
	class="fixed inset-0 bg-gray-900/50 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-in fade-in duration-200"
>
	<div
		class="bg-white rounded-2xl shadow-xl w-full max-w-lg overflow-hidden flex flex-col max-h-[90vh]"
	>
		<!-- Header -->
		<div class="px-6 py-4 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
			<h2 class="text-xl font-bold text-gray-900">
				{project ? 'Edit Project' : 'New Project'}
			</h2>
			<button
				onclick={onClose}
				class="text-gray-400 hover:text-gray-600 transition-colors p-1 rounded-lg hover:bg-gray-100"
			>
				<svg
					class="w-6 h-6"
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
		<div class="p-6 overflow-y-auto">
			<form on:submit|preventDefault={handleSubmit} class="space-y-5">
				<!-- Name Field -->
				<div>
					<label for="name" class="block text-sm font-medium text-gray-700 mb-1"
						>Project Name <span class="text-red-500">*</span></label
					>
					<input
						type="text"
						id="name"
						bind:value={formData.name}
						placeholder="e.g. Awesome Web App"
						class="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all"
						required
					/>
				</div>

				<!-- Repo Field -->
				<div>
					<label for="repo" class="block text-sm font-medium text-gray-700 mb-1"
						>Repository Link</label
					>
					<input
						type="url"
						id="repo"
						bind:value={formData.repo}
						placeholder="e.g. https://github.com/username/repo"
						class="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all"
					/>
				</div>

				<!-- Status Field -->
				<div>
					<label for="status" class="block text-sm font-medium text-gray-700 mb-1">Status</label>
					<div class="relative">
						<select
							id="status"
							bind:value={formData.status}
							class="w-full px-4 py-2 border border-gray-200 rounded-lg appearance-none bg-white focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all pr-10"
						>
							<option value="In Development">In Development</option>
							<option value="Completed">Completed</option>
						</select>
						<div
							class="pointer-events-none absolute inset-y-0 right-0 flex items-center px-4 text-gray-500"
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
					<label for="progressNotes" class="block text-sm font-medium text-gray-700 mb-1"
						>Progress Notes</label
					>
					<textarea
						id="progressNotes"
						bind:value={formData.progressNotes}
						rows="3"
						placeholder="What are you currently working on?"
						class="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all resize-none"
					></textarea>
				</div>

				<!-- Bug Notes -->
				<div>
					<label for="bugNotes" class="block text-sm font-medium text-gray-700 mb-1"
						>Bug Notes</label
					>
					<textarea
						id="bugNotes"
						bind:value={formData.bugNotes}
						rows="3"
						placeholder="Any known issues or bugs?"
						class="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all resize-none"
					></textarea>
				</div>
			</form>
		</div>

		<!-- Footer -->
		<div class="px-6 py-4 border-t border-gray-100 flex justify-end gap-3 bg-gray-50/50">
			<button
				type="button"
				onclick={onClose}
				class="px-5 py-2.5 text-sm font-medium text-gray-700 bg-white border border-gray-200 rounded-lg shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-gray-200 transition-all"
			>
				Cancel
			</button>
			<button
				type="button"
				onclick={handleSubmit}
				disabled={isSubmitting}
				class="px-5 py-2.5 text-sm font-medium text-white bg-indigo-600 border border-transparent rounded-lg shadow hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 transition-all flex items-center justify-center min-w-[100px]"
			>
				{#if isSubmitting}
					<div class="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-white"></div>
				{:else}
					Save Project
				{/if}
			</button>
		</div>
	</div>
</div>
