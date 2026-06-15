<script>
	import { user, theme, accentColor } from '$lib/stores';
	import {
		auth,
		signOut,
		db,
		collection,
		addDoc,
		updateDoc,
		doc,
		deleteDoc,
		query,
		where,
		orderBy,
		onSnapshot
	} from '$lib/firebase';
	import { onMount, onDestroy } from 'svelte';
	import ProjectModal from './ProjectModal.svelte';
	import SettingsModal from './SettingsModal.svelte';

	/** @type {any[]} */
	let projects = $state([]);
	let loading = $state(true);
	/** @type {any} */
	let unsubscribe;

	let isModalOpen = $state(false);
	let isSettingsOpen = $state(false);
	/** @type {any} */
	let currentProject = $state(null);
	/** @type {string | null} */
	let indexErrorLink = $state(null);

	let searchQuery = $state('');
	let filterStatus = $state('All');
	let filterBugs = $state(false);
	let viewMode = $state('card');

	let filteredProjects = $derived(
		projects.filter((p) => {
			const matchesSearch =
				p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
				(p.category && p.category.toLowerCase().includes(searchQuery.toLowerCase()));
			const matchesStatus = filterStatus === 'All' || p.status === filterStatus;
			const matchesBugs = filterBugs ? !!p.bugNotes && p.bugNotes.trim().length > 0 : true;
			return matchesSearch && matchesStatus && matchesBugs;
		})
	);

	const colors = ['indigo', 'emerald', 'rose', 'amber'];

	onMount(() => {
		if ($user) {
			const q = query(
				collection(db, 'projects'),
				where('userId', '==', $user?.uid),
				orderBy('createdAt', 'desc')
			);
			unsubscribe = onSnapshot(
				q,
				(querySnapshot) => {
					/** @type {any[]} */
					const projData = [];
					querySnapshot.forEach((doc) => {
						projData.push({ id: doc.id, ...doc.data() });
					});
					projects = projData;
					loading = false;
				},
				(error) => {
					console.error('Error fetching projects:', error);
					if (error.message.includes('requires an index')) {
						const match = error.message.match(/https:\/\/console\.firebase\.google\.com[^\s]*/);
						if (match) {
							indexErrorLink = match[0];
						}
					}
					loading = false;
				}
			);
		}
	});

	onDestroy(() => {
		if (unsubscribe) unsubscribe();
	});

	const handleSignOut = async () => {
		try {
			await signOut(auth);
			localStorage.removeItem('githubToken');
		} catch (error) {
			console.error('Error signing out:', error);
		}
	};

	const openNewProjectModal = () => {
		currentProject = null;
		isModalOpen = true;
	};

	/** @param {any} project */
	const openEditProjectModal = (project) => {
		currentProject = { ...project };
		isModalOpen = true;
	};

	const closeModal = () => {
		isModalOpen = false;
		currentProject = null;
	};

	/** @param {any} projectData */
	const saveProject = async (projectData) => {
		try {
			if (currentProject && currentProject.id) {
				// Update
				const projectRef = doc(db, 'projects', currentProject.id);
				await updateDoc(projectRef, {
					...projectData,
					updatedAt: Date.now()
				});
			} else {
				// Create
				await addDoc(collection(db, 'projects'), {
					...projectData,
					userId: $user?.uid,
					createdAt: Date.now(),
					updatedAt: Date.now()
				});
			}
			closeModal();
		} catch (error) {
			console.error('Error saving project: ', error);
			alert('Failed to save project.');
		}
	};

	/** @param {string} id */
	const deleteProject = async (id) => {
		if (confirm('Are you sure you want to delete this project?')) {
			try {
				await deleteDoc(doc(db, 'projects', id));
			} catch (error) {
				console.error('Error deleting project:', error);
				alert('Failed to delete project');
			}
		}
	};

	/**
	 * @param {any} project
	 * @param {string} taskId
	 */
	const toggleTask = async (project, taskId) => {
		const newTasks = (project.tasks || []).map((/** @type {any} */ t) =>
			t.id === taskId ? { ...t, completed: !t.completed } : t
		);
		try {
			await updateDoc(doc(db, 'projects', project.id), { tasks: newTasks });
		} catch (e) {
			console.error('Error updating task:', e);
		}
	};
</script>

<div class="min-h-screen flex flex-col relative z-10">
	<!-- Navbar -->
	<nav class="glass-panel sticky top-0 z-30 border-t-0 border-x-0">
		<div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
			<div class="flex justify-between h-16 items-center">
				<div class="flex items-center gap-3">
					<div
						class="w-10 h-10 bg-gradient-to-tr from-accent-500 to-accent-600 rounded-xl shadow-md flex items-center justify-center border border-white/20"
					>
						<svg
							class="w-6 h-6 text-white"
							fill="none"
							stroke="currentColor"
							viewBox="0 0 24 24"
							xmlns="http://www.w3.org/2000/svg"
						>
							<path
								stroke-linecap="round"
								stroke-linejoin="round"
								stroke-width="2"
								d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4"
							></path>
						</svg>
					</div>
					<span
						class="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-accent-600 to-accent-400"
						>DevHub</span
					>
				</div>

				<div class="flex items-center gap-6">
					<!-- Theme & Accent Controls -->
					<div
						class="hidden md:flex items-center gap-4 border-r border-gray-200 dark:border-gray-700 pr-6"
					>
						<div
							class="flex items-center bg-gray-100/50 dark:bg-gray-800/50 rounded-lg p-1 border border-gray-200 dark:border-gray-700"
						>
							{#each colors as color (color)}
								<button
									onclick={() => ($accentColor = color)}
									aria-label={`Set accent color to ${color}`}
									class={`w-6 h-6 rounded-md m-0.5 transition-transform ${$accentColor === color ? 'scale-110 shadow-sm ring-2 ring-offset-1 ring-offset-white dark:ring-offset-gray-900 ring-gray-400 dark:ring-gray-500' : 'hover:scale-105 opacity-80'}`}
									style={`background-color: var(--color-${color}-500)`}
								></button>
							{/each}
						</div>

						<select
							bind:value={$theme}
							class="text-xs font-medium bg-gray-100/50 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 rounded-lg focus:ring-accent-500 focus:border-accent-500 block py-1.5 px-3 outline-none"
						>
							<option value="light">Light</option>
							<option value="dark">Dark</option>
							<option value="system">System</option>
						</select>
					</div>

					<div class="hidden sm:flex items-center gap-3">
						<button
							onclick={() => (isSettingsOpen = true)}
							class="flex items-center gap-3 p-1.5 pr-4 rounded-full bg-white/50 dark:bg-gray-800/50 hover:bg-gray-100 dark:hover:bg-gray-700 border border-gray-200/50 dark:border-gray-700/50 transition-colors focus:ring-2 focus:ring-accent-500 outline-none group"
						>
							<img
								src={$user?.photoURL}
								alt={$user?.displayName}
								class="w-9 h-9 rounded-full border-2 border-accent-100 dark:border-accent-900 group-hover:scale-105 transition-transform"
								referrerpolicy="no-referrer"
							/>
							<div class="flex flex-col text-left">
								<span
									class="text-sm font-bold text-gray-900 dark:text-gray-100 leading-tight truncate max-w-[120px]"
									>{$user?.displayName}</span
								>
								<span class="text-xs font-medium text-gray-500 dark:text-gray-400">Settings</span>
							</div>
						</button>
					</div>
				</div>
			</div>
		</div>
	</nav>

	<!-- Main Content -->
	<main class="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
		<!-- Mobile Controls (visible only on small screens) -->
		<div class="md:hidden flex justify-between items-center mb-6 glass p-3 rounded-xl">
			<button
				onclick={() => (isSettingsOpen = true)}
				class="flex items-center gap-3 p-1.5 pr-4 rounded-full bg-white/50 dark:bg-gray-800/50 hover:bg-gray-100 dark:hover:bg-gray-700 border border-gray-200/50 dark:border-gray-700/50 transition-colors focus:ring-2 focus:ring-accent-500 outline-none group"
			>
				<img
					src={$user?.photoURL}
					alt={$user?.displayName}
					class="w-8 h-8 rounded-full border-2 border-accent-100 dark:border-accent-900 group-hover:scale-105 transition-transform"
					referrerpolicy="no-referrer"
				/>
				<div class="flex flex-col text-left">
					<span
						class="text-xs font-bold text-gray-900 dark:text-gray-100 leading-tight truncate max-w-[100px]"
						>{$user?.displayName}</span
					>
				</div>
			</button>

			<div class="flex items-center gap-2">
				{#each colors as color (color)}
					<button
						onclick={() => ($accentColor = color)}
						aria-label={`Set accent color to ${color}`}
						class={`w-5 h-5 rounded-full transition-transform ${$accentColor === color ? 'scale-125 ring-2 ring-offset-1 ring-offset-white dark:ring-offset-gray-900 ring-gray-400' : 'opacity-80'}`}
						style={`background-color: var(--color-${color}-500)`}
					></button>
				{/each}
			</div>
			<select
				bind:value={$theme}
				class="text-xs bg-transparent border-none text-gray-700 dark:text-gray-300 outline-none"
			>
				<option value="light">Light</option>
				<option value="dark">Dark</option>
				<option value="system">Auto</option>
			</select>
		</div>

		<div class="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
			<div>
				<h1 class="text-4xl font-extrabold text-gray-900 dark:text-white tracking-tight">
					Your Projects
				</h1>
				<p class="text-gray-500 dark:text-gray-400 mt-2 text-lg">
					Manage and track the progress of all your applications.
				</p>
			</div>
			<button
				onclick={openNewProjectModal}
				class="inline-flex items-center justify-center px-6 py-3 bg-accent-600 text-white font-semibold rounded-xl shadow-lg hover:bg-accent-500 hover:shadow-xl hover:-translate-y-0.5 transition-all focus:outline-none focus:ring-2 focus:ring-accent-500 focus:ring-offset-2 dark:focus:ring-offset-gray-900 w-full sm:w-auto"
			>
				<svg
					class="w-5 h-5 mr-2"
					fill="none"
					stroke="currentColor"
					viewBox="0 0 24 24"
					xmlns="http://www.w3.org/2000/svg"
					><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"
					></path></svg
				>
				New Project
			</button>
		</div>

		<!-- Statistics -->
		{#if projects.length > 0}
			<div class="grid grid-cols-3 gap-4 mb-8">
				<div
					class="glass-panel p-4 rounded-2xl flex flex-col items-center justify-center text-center border-b-4 border-gray-300 dark:border-gray-600"
				>
					<span class="text-3xl font-extrabold text-gray-900 dark:text-white"
						>{projects.length}</span
					>
					<span class="text-xs font-bold text-gray-500 uppercase tracking-widest mt-1">Total</span>
				</div>
				<div
					class="glass-panel p-4 rounded-2xl flex flex-col items-center justify-center text-center border-b-4 border-accent-500"
				>
					<span class="text-3xl font-extrabold text-accent-600 dark:text-accent-400"
						>{projects.filter((p) => p.status === 'In Development').length}</span
					>
					<span class="text-xs font-bold text-gray-500 uppercase tracking-widest mt-1"
						>In Progress</span
					>
				</div>
				<div
					class="glass-panel p-4 rounded-2xl flex flex-col items-center justify-center text-center border-b-4 border-emerald-500"
				>
					<span class="text-3xl font-extrabold text-emerald-500"
						>{projects.filter((p) => p.status === 'Completed').length}</span
					>
					<span class="text-xs font-bold text-gray-500 uppercase tracking-widest mt-1"
						>Completed</span
					>
				</div>
			</div>
		{/if}

		<!-- Search & Filter Bar -->
		{#if projects.length > 0 || searchQuery !== '' || filterStatus !== 'All'}
			<div class="flex flex-col sm:flex-row gap-4 mb-8 glass p-2 rounded-2xl">
				<!-- Search -->
				<div class="relative flex-1">
					<div class="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
						<svg class="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"
							><path
								stroke-linecap="round"
								stroke-linejoin="round"
								stroke-width="2"
								d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
							></path></svg
						>
					</div>
					<input
						type="text"
						bind:value={searchQuery}
						placeholder="Search by project name or category..."
						class="w-full pl-11 pr-4 py-3 bg-transparent border-none text-gray-900 dark:text-white placeholder-gray-400 focus:ring-0 outline-none transition-all"
					/>
				</div>

				<!-- Divider -->
				<div class="hidden sm:block w-px bg-gray-200 dark:bg-gray-700 my-2"></div>

				<!-- Filter Status -->
				<div class="sm:w-56 relative flex items-center">
					<div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
						<svg class="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"
							><path
								stroke-linecap="round"
								stroke-linejoin="round"
								stroke-width="2"
								d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z"
							></path></svg
						>
					</div>
					<select
						bind:value={filterStatus}
						class="w-full pl-10 pr-10 py-3 bg-transparent border-none text-gray-700 dark:text-gray-300 font-medium appearance-none focus:ring-0 outline-none cursor-pointer"
					>
						<option value="All">All Statuses</option>
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

				<!-- Bug Filter Toggle -->
				<button
					onclick={() => (filterBugs = !filterBugs)}
					class="flex items-center gap-2 px-4 py-3 rounded-xl border transition-colors whitespace-nowrap {filterBugs
						? 'bg-rose-100/80 text-rose-700 border-rose-200 dark:bg-rose-900/30 dark:text-rose-400 dark:border-rose-800'
						: 'bg-white/30 dark:bg-gray-800/30 text-gray-600 dark:text-gray-400 border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800'}"
					title="Show projects with bugs"
				>
					<svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"
						><path
							stroke-linecap="round"
							stroke-linejoin="round"
							stroke-width="2"
							d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
						></path></svg
					>
					<span class="font-bold text-sm hidden sm:inline">Has Bugs</span>
				</button>

				<!-- View Toggle -->
				<div
					class="flex items-center gap-1 bg-white/30 dark:bg-gray-800/30 p-1 rounded-xl border border-gray-200 dark:border-gray-700 ml-auto w-full sm:w-auto justify-center"
				>
					<button
						onclick={() => (viewMode = 'card')}
						class="p-2 rounded-lg transition-colors {viewMode === 'card'
							? 'bg-white dark:bg-gray-700 shadow-sm text-accent-600 dark:text-accent-400'
							: 'text-gray-500 hover:text-gray-700 dark:hover:text-gray-300'}"
						title="Card View"
					>
						<svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"
							><path
								stroke-linecap="round"
								stroke-linejoin="round"
								stroke-width="2"
								d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z"
							></path></svg
						>
					</button>
					<button
						onclick={() => (viewMode = 'list')}
						class="p-2 rounded-lg transition-colors {viewMode === 'list'
							? 'bg-white dark:bg-gray-700 shadow-sm text-accent-600 dark:text-accent-400'
							: 'text-gray-500 hover:text-gray-700 dark:hover:text-gray-300'}"
						title="List View"
					>
						<svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"
							><path
								stroke-linecap="round"
								stroke-linejoin="round"
								stroke-width="2"
								d="M4 6h16M4 12h16M4 18h16"
							></path></svg
						>
					</button>
				</div>
			</div>
		{/if}

		{#if loading}
			<div class="flex justify-center py-20">
				<div
					class="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-accent-600"
				></div>
			</div>
		{:else if indexErrorLink}
			<div
				class="glass-panel rounded-2xl p-8 text-center max-w-2xl mx-auto mt-10 border-red-200 dark:border-red-900/50"
			>
				<div
					class="w-16 h-16 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center mx-auto mb-4"
				>
					<svg
						class="w-8 h-8 text-red-500 dark:text-red-400"
						fill="none"
						stroke="currentColor"
						viewBox="0 0 24 24"
						xmlns="http://www.w3.org/2000/svg"
						><path
							stroke-linecap="round"
							stroke-linejoin="round"
							stroke-width="2"
							d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
						></path></svg
					>
				</div>
				<h3 class="text-xl font-bold text-red-800 dark:text-red-300 mb-2">
					Firestore Index Required
				</h3>
				<p class="text-red-600 dark:text-red-400 mb-6">
					You need to create a composite index in Firestore for the projects to load and sort
					properly.
				</p>
				<!-- eslint-disable svelte/no-navigation-without-resolve -->
				<a
					href={indexErrorLink}
					target="_blank"
					rel="noopener noreferrer"
					class="inline-block bg-red-600 text-white font-medium px-6 py-3 rounded-xl hover:bg-red-700 transition-colors shadow-lg"
				>
					Click here to build the Index automatically
				</a>
				<!-- eslint-enable svelte/no-navigation-without-resolve -->
			</div>
		{:else if projects.length === 0}
			<div
				class="glass-panel rounded-3xl p-16 text-center max-w-2xl mx-auto mt-8 border-dashed border-2 border-accent-200 dark:border-accent-800"
			>
				<div
					class="w-24 h-24 bg-accent-50 dark:bg-accent-900/30 rounded-full flex items-center justify-center mx-auto mb-6 shadow-inner"
				>
					<svg
						class="w-12 h-12 text-accent-400 dark:text-accent-500"
						fill="none"
						stroke="currentColor"
						viewBox="0 0 24 24"
						xmlns="http://www.w3.org/2000/svg"
						><path
							stroke-linecap="round"
							stroke-linejoin="round"
							stroke-width="1.5"
							d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"
						></path></svg
					>
				</div>
				<h3 class="text-2xl font-bold text-gray-900 dark:text-white mb-3">No projects yet</h3>
				<p class="text-gray-500 dark:text-gray-400 mb-8 max-w-md mx-auto text-lg">
					Get started by creating your first project to track its progress, bugs, and repository.
				</p>
				<button
					onclick={openNewProjectModal}
					class="text-accent-600 dark:text-accent-400 font-bold hover:text-accent-500 flex items-center justify-center gap-2 mx-auto"
				>
					<svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"
						><path
							stroke-linecap="round"
							stroke-linejoin="round"
							stroke-width="2"
							d="M12 4v16m8-8H4"
						></path></svg
					>
					Create your first project
				</button>
			</div>
		{:else if filteredProjects.length === 0}
			<div
				class="glass-panel rounded-3xl p-16 text-center max-w-2xl mx-auto mt-8 border-dashed border-2 border-gray-200 dark:border-gray-800"
			>
				<div
					class="w-20 h-20 bg-gray-100 dark:bg-gray-800/50 rounded-full flex items-center justify-center mx-auto mb-5 shadow-inner"
				>
					<svg class="w-10 h-10 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"
						><path
							stroke-linecap="round"
							stroke-linejoin="round"
							stroke-width="2"
							d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
						></path></svg
					>
				</div>
				<h3 class="text-2xl font-bold text-gray-900 dark:text-white mb-2">No matches found</h3>
				<p class="text-gray-500 dark:text-gray-400 mb-6">
					We couldn't find any projects matching your search criteria.
				</p>
				<button
					onclick={() => {
						searchQuery = '';
						filterStatus = 'All';
					}}
					class="text-accent-600 dark:text-accent-400 font-bold hover:underline"
				>
					Clear all filters
				</button>
			</div>
		{:else}
			<div
				class={viewMode === 'card'
					? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6'
					: 'flex flex-col gap-4'}
			>
				{#each filteredProjects as project (project.id)}
					<div
						class="glass-card rounded-2xl overflow-hidden flex group relative {viewMode === 'list'
							? 'flex-col md:flex-row'
							: 'flex-col'}"
					>
						<!-- Decorative gradient blob -->
						<div
							class="absolute -top-10 -right-10 w-32 h-32 bg-accent-500/10 dark:bg-accent-500/20 blur-2xl rounded-full pointer-events-none"
						></div>

						<!-- Card Header -->
						<div
							class="p-6 flex flex-col gap-3 relative z-10 border-gray-100/50 dark:border-gray-700/50 {viewMode ===
							'list'
								? 'md:w-2/5 lg:w-1/3 border-b md:border-b-0 md:border-r'
								: 'border-b'}"
						>
							<div class="flex justify-between items-start gap-4">
								<div class="flex flex-col">
									<h3
										class="text-xl font-bold text-gray-900 dark:text-white line-clamp-1"
										title={project.name}
									>
										{project.name}
									</h3>
									{#if project.category}
										<span class="text-xs font-medium text-accent-600 dark:text-accent-400 mt-0.5">
											{project.category}
										</span>
									{/if}
								</div>
								<span
									class={`inline-flex px-3 py-1 text-[10px] uppercase tracking-wider font-bold rounded-lg whitespace-nowrap shadow-sm ${
										project.status === 'Completed'
											? 'bg-emerald-100/80 text-emerald-800 dark:bg-emerald-500/20 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-500/30'
											: 'bg-accent-100/80 text-accent-800 dark:bg-accent-500/20 dark:text-accent-300 border border-accent-200 dark:border-accent-500/30'
									}`}
								>
									{project.status || 'In Development'}
								</span>
							</div>
							<div class="flex flex-col gap-1.5 mt-1">
								{#if project.repo}
									<!-- eslint-disable svelte/no-navigation-without-resolve -->
									<a
										href={project.repo.startsWith('http')
											? project.repo
											: `https://${project.repo}`}
										target="_blank"
										rel="noopener noreferrer"
										class="text-sm text-gray-500 dark:text-gray-400 hover:text-accent-600 dark:hover:text-accent-400 flex items-center gap-1.5 transition-colors w-fit bg-gray-50 dark:bg-gray-800/50 px-2 py-1 rounded-md border border-gray-100 dark:border-gray-700/50"
									>
										<svg
											class="w-4 h-4 flex-shrink-0"
											fill="currentColor"
											viewBox="0 0 24 24"
											xmlns="http://www.w3.org/2000/svg"
											><path
												fill-rule="evenodd"
												clip-rule="evenodd"
												d="M12 2C6.477 2 2 6.477 2 12c0 4.42 2.865 8.166 6.839 9.489.5.092.682-.217.682-.482 0-.237-.008-.866-.013-1.7-2.782.603-3.369-1.34-3.369-1.34-.454-1.156-1.11-1.462-1.11-1.462-.908-.62.069-.608.069-.608 1.003.07 1.531 1.03 1.531 1.03.892 1.529 2.341 1.087 2.91.831.092-.646.35-1.086.636-1.336-2.22-.253-4.555-1.11-4.555-4.943 0-1.091.39-1.984 1.029-2.683-.103-.253-.446-1.27.098-2.647 0 0 .84-.269 2.75 1.025A9.578 9.578 0 0112 6.836c.85.004 1.705.114 2.504.336 1.909-1.294 2.747-1.025 2.747-1.025.546 1.379.203 2.394.1 2.647.64.699 1.028 1.592 1.028 2.683 0 3.842-2.339 4.687-4.566 4.935.359.309.678.919.678 1.852 0 1.336-.012 2.415-.012 2.743 0 .267.18.578.688.48C19.138 20.161 22 16.416 22 12c0-5.523-4.477-10-10-10z"
											></path></svg
										>
										<span class="line-clamp-1">{project.repo.replace(/^https?:\/\//, '')}</span>
									</a>
									<!-- eslint-enable svelte/no-navigation-without-resolve -->
								{/if}
								{#if project.liveUrl}
									<!-- eslint-disable svelte/no-navigation-without-resolve -->
									<a
										href={project.liveUrl.startsWith('http')
											? project.liveUrl
											: `https://${project.liveUrl}`}
										target="_blank"
										rel="noopener noreferrer"
										class="text-sm text-gray-500 dark:text-gray-400 hover:text-emerald-600 dark:hover:text-emerald-400 flex items-center gap-1.5 transition-colors w-fit bg-gray-50 dark:bg-gray-800/50 px-2 py-1 rounded-md border border-gray-100 dark:border-gray-700/50"
									>
										<svg
											class="w-4 h-4 flex-shrink-0"
											fill="none"
											stroke="currentColor"
											viewBox="0 0 24 24"
											><path
												stroke-linecap="round"
												stroke-linejoin="round"
												stroke-width="2"
												d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9"
											></path></svg
										>
										<span class="line-clamp-1">{project.liveUrl.replace(/^https?:\/\//, '')}</span>
									</a>
									<!-- eslint-enable svelte/no-navigation-without-resolve -->
								{/if}
								{#if !project.repo && !project.liveUrl}
									<span
										class="text-sm text-gray-400 dark:text-gray-500 italic flex items-center gap-1.5 px-2 py-1"
									>
										<svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"
											><path
												stroke-linecap="round"
												stroke-linejoin="round"
												stroke-width="2"
												d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1"
											></path></svg
										>
										No links provided
									</span>
								{/if}
							</div>
							{#if project.technologies && project.technologies.length > 0}
								<div class="flex flex-wrap gap-1.5 mt-2">
									{#each project.technologies as tech (tech)}
										<span
											class="text-[10px] font-bold px-2 py-0.5 rounded-md bg-gray-100 dark:bg-gray-800/80 text-gray-600 dark:text-gray-300 border border-gray-200/50 dark:border-gray-700/50"
										>
											{tech}
										</span>
									{/each}
								</div>
							{/if}
						</div>

						<!-- Card Body -->
						<div
							class="p-6 flex-1 flex flex-col gap-5 text-sm bg-gray-50/30 dark:bg-gray-800/20 relative z-10"
						>
							{#if project.tasks && project.tasks.length > 0}
								<div>
									<div class="flex items-center gap-2 mb-2">
										<div class="w-1.5 h-1.5 rounded-full bg-accent-500"></div>
										<span
											class="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-widest"
											>To-Do List</span
										>
									</div>
									<div class="flex flex-col gap-2">
										{#each project.tasks as task (task.id)}
											<label class="flex items-start gap-2.5 group cursor-pointer">
												<input
													type="checkbox"
													checked={task.completed}
													onchange={() => toggleTask(project, task.id)}
													class="mt-0.5 w-4 h-4 text-accent-600 rounded border-gray-300 focus:ring-accent-500 dark:border-gray-600 dark:bg-gray-700 cursor-pointer transition-all"
												/>
												<span
													class="text-gray-700 dark:text-gray-300 text-sm {task.completed
														? 'line-through text-gray-400 dark:text-gray-500'
														: 'group-hover:text-accent-600 dark:group-hover:text-accent-400 transition-colors'}"
												>
													{task.text}
												</span>
											</label>
										{/each}
									</div>
								</div>
							{/if}

							{#if project.progressNotes}
								<div>
									<div class="flex items-center gap-2 mb-2">
										<div class="w-1.5 h-1.5 rounded-full bg-accent-300"></div>
										<span
											class="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-widest"
											>Description</span
										>
									</div>
									<p
										class="text-gray-700 dark:text-gray-300 whitespace-pre-wrap line-clamp-3 leading-relaxed"
									>
										{project.progressNotes}
									</p>
								</div>
							{/if}

							{#if project.bugNotes}
								<div>
									<div class="flex items-center gap-2 mb-2">
										<div class="w-1.5 h-1.5 rounded-full bg-red-400"></div>
										<span
											class="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-widest"
											>Bug Notes</span
										>
									</div>
									<p
										class="text-gray-700 dark:text-gray-300 whitespace-pre-wrap line-clamp-3 leading-relaxed"
									>
										{project.bugNotes}
									</p>
								</div>
							{/if}

							{#if !project.progressNotes && !project.bugNotes && (!project.tasks || project.tasks.length === 0)}
								<div
									class="flex items-center justify-center h-full opacity-50 text-gray-500 italic"
								>
									No details provided.
								</div>
							{/if}
						</div>

						<!-- Card Footer / Actions (Now visible always, integrated into body or right edge) -->
						<div
							class="px-6 py-4 flex items-center justify-end gap-2 bg-white/50 dark:bg-gray-800/50 transition-all duration-300 relative z-10 backdrop-blur-md border-gray-100/50 dark:border-gray-700/50 {viewMode ===
							'list'
								? 'border-t md:border-t-0 md:border-l md:flex-col md:w-32 lg:w-40 justify-center'
								: 'border-t mt-auto'}"
						>
							<button
								onclick={() => openEditProjectModal(project)}
								class="px-4 py-2 text-sm font-bold text-accent-700 dark:text-accent-300 bg-accent-50 dark:bg-accent-900/30 hover:bg-accent-100 dark:hover:bg-accent-900/50 rounded-lg transition-colors border border-accent-100 dark:border-accent-800/50 {viewMode ===
								'list'
									? 'w-full'
									: ''}"
							>
								Edit
							</button>
							<button
								onclick={() => deleteProject(project.id)}
								class="px-4 py-2 text-sm font-bold text-red-700 dark:text-red-300 bg-red-50 dark:bg-red-900/30 hover:bg-red-100 dark:hover:bg-red-900/50 rounded-lg transition-colors border border-red-100 dark:border-red-800/50 {viewMode ===
								'list'
									? 'w-full'
									: ''}"
							>
								Delete
							</button>
						</div>
					</div>
				{/each}
			</div>
		{/if}
	</main>
</div>

{#if isModalOpen}
	<ProjectModal project={currentProject} onClose={closeModal} onSave={saveProject} />
{/if}

{#if isSettingsOpen}
	<SettingsModal user={$user} onClose={() => (isSettingsOpen = false)} onLogout={handleSignOut} />
{/if}
