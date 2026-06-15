<script>
	let { project, onClose, onSave } = $props();

	// svelte-ignore state_referenced_locally
	let formData = $state({
		name: project?.name || '',
		category: project?.category || '',
		repo: project?.repo || '',
		liveUrl: project?.liveUrl || '',
		progressNotes: project?.progressNotes || '',
		bugNotes: project?.bugNotes || '',
		status: project?.status || 'In Development',
		tasks: project?.tasks ? [...project.tasks] : [],
		technologies: project?.technologies ? [...project.technologies] : []
	});

	let newTaskText = $state('');
	let newTechText = $state('');
	let isSubmitting = $state(false);
	let isDetecting = $state(false);

	const addTech = () => {
		if (newTechText.trim() && !formData.technologies.includes(newTechText.trim())) {
			formData.technologies = [...formData.technologies, newTechText.trim()];
			newTechText = '';
		}
	};

	/** @param {string} tech */
	const removeTech = (tech) => {
		formData.technologies = formData.technologies.filter((t) => t !== tech);
	};

	const detectTechStack = async () => {
		if (!formData.repo.includes('github.com')) {
			alert('Auto-detect currently only works with GitHub URLs.');
			return;
		}

		// Extract owner and repo
		const match = formData.repo.match(/github\.com\/([^/]+)\/([^/]+)/);
		if (!match) return;

		const owner = match[1];
		const repo = match[2].replace('.git', '');

		let detected = [...formData.technologies];
		isDetecting = true;

		try {
			const githubToken = localStorage.getItem('githubToken');
			/** @type {any} */
			const headers = githubToken ? { Authorization: `Bearer ${githubToken}` } : {};

			// 1. Fetch Languages
			const langRes = await fetch(`https://api.github.com/repos/${owner}/${repo}/languages`, {
				headers
			});
			if (langRes.status === 404) {
				alert(
					'Repo not found or is private. If it is private, please sign out and sign in with GitHub to allow DevHub to read your private repos.'
				);
				return;
			}

			if (langRes.ok) {
				const langs = await langRes.json();
				Object.keys(langs).forEach((l) => {
					if (!detected.includes(l)) detected.push(l);
				});
			}

			// 2. Fetch package.json
			const pkgRes = await fetch(
				`https://api.github.com/repos/${owner}/${repo}/contents/package.json`,
				{ headers: { ...headers, Accept: 'application/vnd.github.v3.raw' } }
			);
			if (pkgRes.ok) {
				const pkg = await pkgRes.json();
				const deps = { ...(pkg.dependencies || {}), ...(pkg.devDependencies || {}) };
				const addD = (/** @type {string} */ l) => !detected.includes(l) && detected.push(l);
				if (deps['svelte']) addD('Svelte');
				if (deps['@sveltejs/kit']) addD('SvelteKit');
				if (deps['react']) addD('React');
				if (deps['vue']) addD('Vue');
				if (deps['next']) addD('Next.js');
				if (deps['nuxt']) addD('Nuxt');
				if (deps['tailwindcss']) addD('Tailwind CSS');
				if (deps['bootstrap']) addD('Bootstrap');
				if (deps['typescript']) addD('TypeScript');
				if (deps['vite']) addD('Vite');
			}

			// 3. Fetch composer.json
			const compRes = await fetch(
				`https://api.github.com/repos/${owner}/${repo}/contents/composer.json`,
				{ headers: { ...headers, Accept: 'application/vnd.github.v3.raw' } }
			);
			if (compRes.ok) {
				const comp = await compRes.json();
				const reqs = { ...(comp.require || {}), ...(comp['require-dev'] || {}) };
				const addD = (/** @type {string} */ l) => !detected.includes(l) && detected.push(l);
				if (reqs['laravel/framework']) addD('Laravel');
				if (reqs['codeigniter4/framework']) addD('CodeIgniter 4');
			}

			formData.technologies = detected;
		} catch (e) {
			console.error('Failed to auto-detect:', e);
			alert('Failed to auto-detect. The repo might be private or API limit reached.');
		} finally {
			isDetecting = false;
		}
	};

	const addTask = () => {
		if (newTaskText.trim()) {
			formData.tasks = [
				...formData.tasks,
				{
					id: Date.now().toString(),
					text: newTaskText.trim(),
					completed: false
				}
			];
			newTaskText = '';
		}
	};

	/** @param {string} id */
	const removeTask = (id) => {
		formData.tasks = formData.tasks.filter((/** @type {any} */ t) => t.id !== id);
	};

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
					<div class="flex gap-2">
						<input
							type="url"
							id="repo"
							bind:value={formData.repo}
							placeholder="e.g. https://github.com/username/repo"
							class="flex-1 px-4 py-2.5 bg-white/50 dark:bg-gray-900/50 border border-gray-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-accent-500 focus:border-accent-500 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 outline-none transition-all"
						/>
						<button
							type="button"
							onclick={detectTechStack}
							disabled={isDetecting || !formData.repo}
							title="Auto-Detect Tech Stack from GitHub"
							class="px-3 py-2.5 bg-accent-100 text-accent-700 dark:bg-accent-900/30 dark:text-accent-400 rounded-xl hover:bg-accent-200 dark:hover:bg-accent-800/50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed border border-accent-200 dark:border-accent-800 flex items-center justify-center min-w-[48px]"
						>
							{#if isDetecting}
								<div
									class="animate-spin rounded-full h-5 w-5 border-t-2 border-b-2 border-accent-600 dark:border-accent-400"
								></div>
							{:else}
								<svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"
									><path
										stroke-linecap="round"
										stroke-linejoin="round"
										stroke-width="2"
										d="M13 10V3L4 14h7v7l9-11h-7z"
									></path></svg
								>
							{/if}
						</button>
					</div>
				</div>

				<!-- Tech Stack Field -->
				<div>
					<label class="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">
						Tech Stack
					</label>
					<div class="flex flex-wrap gap-2 mb-2">
						{#each formData.technologies as tech (tech)}
							<div
								class="flex items-center gap-1 bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 px-3 py-1 rounded-lg text-sm border border-gray-200 dark:border-gray-700"
							>
								<span>{tech}</span>
								<button
									type="button"
									onclick={() => removeTech(tech)}
									class="text-gray-400 hover:text-red-500 transition-colors ml-1 focus:outline-none"
								>
									<svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"
										><path
											stroke-linecap="round"
											stroke-linejoin="round"
											stroke-width="2"
											d="M6 18L18 6M6 6l12 12"
										></path></svg
									>
								</button>
							</div>
						{/each}
					</div>
					<div class="flex gap-2">
						<input
							type="text"
							bind:value={newTechText}
							placeholder="Add technology (e.g. Svelte, Laravel)..."
							onkeydown={(e) => e.key === 'Enter' && (e.preventDefault(), addTech())}
							class="flex-1 px-4 py-2.5 bg-white/50 dark:bg-gray-900/50 border border-gray-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-accent-500 focus:border-accent-500 dark:text-white placeholder-gray-400 outline-none transition-all"
						/>
						<button
							type="button"
							onclick={addTech}
							class="px-4 py-2 bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 border border-gray-200 dark:border-gray-700 rounded-xl hover:bg-gray-200 dark:hover:bg-gray-700 font-bold transition-all"
						>
							Add
						</button>
					</div>
				</div>

				<!-- Live URL Field -->
				<div>
					<label for="liveUrl" class="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-1"
						>Live URL (Production)</label
					>
					<input
						type="url"
						id="liveUrl"
						bind:value={formData.liveUrl}
						placeholder="e.g. https://my-awesome-app.com"
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

				<!-- Tasks (Checklist) -->
				<div>
					<span class="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2"
						>To-Do List</span
					>
					<div class="space-y-3 mb-3">
						{#each formData.tasks as task (task.id)}
							<div
								class="flex items-center gap-3 bg-white/50 dark:bg-gray-800/50 p-3 rounded-xl border border-gray-200 dark:border-gray-700"
							>
								<input
									type="checkbox"
									bind:checked={task.completed}
									class="w-5 h-5 text-accent-600 rounded border-gray-300 focus:ring-accent-500 dark:border-gray-600 dark:bg-gray-700"
								/>
								<input
									type="text"
									bind:value={task.text}
									class="flex-1 bg-transparent border-none focus:ring-0 text-gray-900 dark:text-white p-0 {task.completed
										? 'line-through text-gray-400 dark:text-gray-500'
										: ''}"
								/>
								<button
									type="button"
									onclick={() => removeTask(task.id)}
									aria-label="Remove task"
									class="text-red-500 hover:text-red-700 p-1"
								>
									<svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"
										><path
											stroke-linecap="round"
											stroke-linejoin="round"
											stroke-width="2"
											d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
										></path></svg
									>
								</button>
							</div>
						{/each}
					</div>
					<div class="flex gap-2">
						<input
							type="text"
							bind:value={newTaskText}
							placeholder="Add a new task..."
							onkeydown={(e) => e.key === 'Enter' && (e.preventDefault(), addTask())}
							class="flex-1 px-4 py-2.5 bg-white/50 dark:bg-gray-900/50 border border-gray-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-accent-500 focus:border-accent-500 dark:text-white placeholder-gray-400 outline-none transition-all"
						/>
						<button
							type="button"
							onclick={addTask}
							class="px-4 py-2 bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 border border-gray-200 dark:border-gray-700 rounded-xl hover:bg-gray-200 dark:hover:bg-gray-700 font-bold transition-all"
						>
							Add
						</button>
					</div>
				</div>

				<!-- Description (formerly Progress Notes) -->
				<div>
					<label
						for="progressNotes"
						class="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-1"
						>Project Description</label
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
