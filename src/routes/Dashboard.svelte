<script>
	import { user } from '$lib/stores';
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
		onSnapshot
	} from '$lib/firebase';
	import { onMount, onDestroy } from 'svelte';
	import ProjectModal from './ProjectModal.svelte';

	let projects = $state([]);
	let loading = $state(true);
	let unsubscribe;

	let isModalOpen = $state(false);
	let currentProject = $state(null);

	onMount(() => {
		if ($user) {
			const q = query(collection(db, 'projects'), where('userId', '==', $user.uid));
			unsubscribe = onSnapshot(
				q,
				(querySnapshot) => {
					const projData = [];
					querySnapshot.forEach((doc) => {
						projData.push({ id: doc.id, ...doc.data() });
					});
					// sort by createdAt desc if it exists
					projects = projData.sort((a, b) => b.createdAt - a.createdAt);
					loading = false;
				},
				(error) => {
					console.error('Error fetching projects:', error);
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
		} catch (error) {
			console.error('Error signing out:', error);
		}
	};

	const openNewProjectModal = () => {
		currentProject = null;
		isModalOpen = true;
	};

	const openEditProjectModal = (project) => {
		currentProject = { ...project };
		isModalOpen = true;
	};

	const closeModal = () => {
		isModalOpen = false;
		currentProject = null;
	};

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
					userId: $user.uid,
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
</script>

<div class="min-h-screen bg-gray-50 flex flex-col">
	<!-- Navbar -->
	<nav class="bg-white border-b border-gray-200 sticky top-0 z-30">
		<div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
			<div class="flex justify-between h-16 items-center">
				<div class="flex items-center gap-3">
					<div
						class="w-10 h-10 bg-gradient-to-tr from-indigo-500 to-purple-500 rounded-xl shadow-md flex items-center justify-center"
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
						class="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-indigo-600 to-purple-600"
						>DevHub</span
					>
				</div>
				<div class="flex items-center gap-4">
					<div class="hidden sm:flex items-center gap-2">
						<img
							src={$user.photoURL}
							alt={$user.displayName}
							class="w-8 h-8 rounded-full border border-gray-200"
							referrerpolicy="no-referrer"
						/>
						<span class="text-sm font-medium text-gray-700">{$user.displayName}</span>
					</div>
					<button
						onclick={handleSignOut}
						class="text-sm font-medium text-gray-500 hover:text-red-600 transition-colors"
					>
						Sign Out
					</button>
				</div>
			</div>
		</div>
	</nav>

	<!-- Main Content -->
	<main class="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
		<div class="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
			<div>
				<h1 class="text-3xl font-bold text-gray-900">Your Projects</h1>
				<p class="text-gray-500 mt-1">Manage and track the progress of all your applications.</p>
			</div>
			<button
				onclick={openNewProjectModal}
				class="inline-flex items-center justify-center px-5 py-2.5 bg-indigo-600 text-white font-medium rounded-lg shadow hover:bg-indigo-700 hover:shadow-lg transition-all focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 w-full sm:w-auto"
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

		{#if loading}
			<div class="flex justify-center py-20">
				<div
					class="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-indigo-600"
				></div>
			</div>
		{:else if projects.length === 0}
			<div class="bg-white rounded-2xl shadow-sm border border-gray-100 p-12 text-center">
				<div
					class="w-24 h-24 bg-indigo-50 rounded-full flex items-center justify-center mx-auto mb-6"
				>
					<svg
						class="w-12 h-12 text-indigo-300"
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
				<h3 class="text-xl font-semibold text-gray-900 mb-2">No projects yet</h3>
				<p class="text-gray-500 mb-6 max-w-sm mx-auto">
					Get started by creating your first project to track its progress, bugs, and repository.
				</p>
				<button
					onclick={openNewProjectModal}
					class="text-indigo-600 font-medium hover:text-indigo-700"
				>
					+ Create your first project
				</button>
			</div>
		{:else}
			<div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
				{#each projects as project (project.id)}
					<div
						class="bg-white rounded-2xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow group flex flex-col overflow-hidden"
					>
						<!-- Card Header -->
						<div class="p-6 border-b border-gray-50 flex flex-col gap-3">
							<div class="flex justify-between items-start gap-4">
								<h3 class="text-lg font-bold text-gray-900 line-clamp-1" title={project.name}>
									{project.name}
								</h3>
								<span
									class={`inline-flex px-2.5 py-1 text-xs font-semibold rounded-full whitespace-nowrap ${project.status === 'Completed' ? 'bg-green-100 text-green-800' : 'bg-blue-100 text-blue-800'}`}
								>
									{project.status || 'In Development'}
								</span>
							</div>
							{#if project.repo}
								<!-- eslint-disable-next-line svelte/no-navigation-without-resolve -->
								<a
									href={project.repo.startsWith('http') ? project.repo : `https://${project.repo}`}
									target="_blank"
									rel="noopener noreferrer"
									class="text-sm text-gray-500 hover:text-indigo-600 flex items-center gap-1.5 transition-colors w-fit"
								>
									<svg
										class="w-4 h-4"
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
							{:else}
								<span class="text-sm text-gray-400 italic flex items-center gap-1.5">
									<svg
										class="w-4 h-4"
										fill="none"
										stroke="currentColor"
										viewBox="0 0 24 24"
										xmlns="http://www.w3.org/2000/svg"
										><path
											stroke-linecap="round"
											stroke-linejoin="round"
											stroke-width="2"
											d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1"
										></path></svg
									>
									No repository link
								</span>
							{/if}
						</div>

						<!-- Card Body -->
						<div class="p-6 flex-1 flex flex-col gap-4 text-sm bg-gray-50/50">
							<div>
								<span class="text-xs font-bold text-gray-500 uppercase tracking-wider mb-1 block"
									>Progress Notes</span
								>
								<p class="text-gray-700 whitespace-pre-wrap line-clamp-3">
									{project.progressNotes || 'No progress notes yet.'}
								</p>
							</div>
							<div>
								<span class="text-xs font-bold text-gray-500 uppercase tracking-wider mb-1 block"
									>Bug Notes</span
								>
								<p class="text-gray-700 whitespace-pre-wrap line-clamp-3">
									{project.bugNotes || 'No bugs reported.'}
								</p>
							</div>
						</div>

						<!-- Card Footer -->
						<div
							class="px-6 py-4 border-t border-gray-100 flex justify-end gap-2 bg-white mt-auto opacity-0 group-hover:opacity-100 transition-opacity"
						>
							<button
								onclick={() => openEditProjectModal(project)}
								class="px-3 py-1.5 text-sm font-medium text-indigo-600 hover:bg-indigo-50 rounded-md transition-colors"
							>
								Edit
							</button>
							<button
								onclick={() => deleteProject(project.id)}
								class="px-3 py-1.5 text-sm font-medium text-red-600 hover:bg-red-50 rounded-md transition-colors"
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
