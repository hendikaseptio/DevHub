<script>
	import { page } from '$app/stores';
	import { onMount, onDestroy, tick } from 'svelte';
	import { goto } from '$app/navigation';
	import {
		db,
		collection,
		addDoc,
		updateDoc,
		deleteDoc,
		doc,
		query,
		where,
		orderBy,
		onSnapshot,
		getDoc
	} from '$lib/firebase';
	import { user } from '$lib/stores';

	const projectId = $page.params.id;

	/** @type {any} */
	let project = $state(null);
	/** @type {any[]} */
	let diagrams = $state([]);
	let loading = $state(true);
	/** @type {any} */
	let unsubscribe;

	// Modal state
	let isModalOpen = $state(false);
	/** @type {any} */
	let editingDiagram = $state(null);
	let modalName = $state('');
	let modalType = $state('flowchart');
	let modalCode = $state('');
	let isSaving = $state(false);

	// View state
	/** @type {string | null} */
	let viewingDiagramId = $state(null);
	let renderError = $state('');

	const FLOWCHART_TEMPLATE = `flowchart TD
    A([Start]) --> B[User opens login page]
    B --> C[/Enter email & password/]
    C --> D{Valid input?}
    D -- No --> E[Show validation error]
    E --> C
    D -- Yes --> F[Send request to server]
    F --> G{Credentials match?}
    G -- No --> H[Show wrong credentials error]
    H --> C
    G -- Yes --> I[Generate session token]
    I --> J[Redirect to Dashboard]
    J --> K([End])`;

	const ERD_TEMPLATE = `erDiagram
    USER {
        string id PK
        string name
        string email
        string password_hash
        datetime created_at
    }
    PROJECT {
        string id PK
        string user_id FK
        string name
        string status
        datetime created_at
    }
    USER ||--o{ PROJECT : "owns"`;

	const openNewModal = () => {
		editingDiagram = null;
		modalName = '';
		modalType = 'flowchart';
		modalCode = FLOWCHART_TEMPLATE;
		renderError = '';
		isModalOpen = true;
	};

	/** @param {any} diagram */
	const openEditModal = (diagram) => {
		editingDiagram = diagram;
		modalName = diagram.name;
		modalType = diagram.type;
		modalCode = diagram.code;
		renderError = '';
		isModalOpen = true;
	};

	const closeModal = () => {
		isModalOpen = false;
		editingDiagram = null;
	};

	$effect(() => {
		if (modalType === 'flowchart' && !editingDiagram) {
			modalCode = FLOWCHART_TEMPLATE;
		} else if (modalType === 'erd' && !editingDiagram) {
			modalCode = ERD_TEMPLATE;
		}
	});

	const saveDiagram = async () => {
		if (!modalName.trim() || !modalCode.trim()) return;
		isSaving = true;
		try {
			if (editingDiagram) {
				await updateDoc(doc(db, 'diagrams', editingDiagram.id), {
					name: modalName.trim(),
					type: modalType,
					code: modalCode.trim(),
					updatedAt: Date.now()
				});
			} else {
				const newDoc = await addDoc(collection(db, 'diagrams'), {
					projectId,
					userId: $user?.uid,
					name: modalName.trim(),
					type: modalType,
					code: modalCode.trim(),
					createdAt: Date.now(),
					updatedAt: Date.now()
				});
				viewingDiagramId = newDoc.id;
			}
			closeModal();
		} catch (e) {
			console.error('Error saving diagram:', e);
			alert('Failed to save diagram.');
		} finally {
			isSaving = false;
		}
	};

	/** @param {string} id */
	const deleteDiagram = async (id) => {
		if (!confirm('Delete this diagram?')) return;
		try {
			await deleteDoc(doc(db, 'diagrams', id));
			if (viewingDiagramId === id) {
				viewingDiagramId = diagrams.find((d) => d.id !== id)?.id ?? null;
			}
		} catch (e) {
			console.error('Error deleting diagram:', e);
		}
	};

	// Mermaid rendering
	let mermaid = $state(/** @type {any} */ (null));

	/** @param {string} id @param {string} code */
	const renderDiagram = async (id, code) => {
		if (!mermaid) return;
		const el = document.getElementById(`mermaid-${id}`);
		if (!el) return;
		try {
			renderError = '';
			el.innerHTML = code;
			el.removeAttribute('data-processed');
			await mermaid.run({ nodes: [el] });
		} catch (e) {
			renderError = String(e);
			el.innerHTML = `<pre class="text-red-500 text-xs p-4 whitespace-pre-wrap">${String(e)}</pre>`;
		}
	};

	let viewingDiagram = $derived(diagrams.find((d) => d.id === viewingDiagramId) ?? null);

	$effect(() => {
		if (viewingDiagram && mermaid) {
			tick().then(() => renderDiagram(viewingDiagram.id, viewingDiagram.code));
		}
	});

	onMount(async () => {
		// Load mermaid
		const m = await import('mermaid');
		mermaid = m.default;
		mermaid.initialize({
			startOnLoad: false,
			theme: document.documentElement.classList.contains('dark') ? 'dark' : 'default',
			securityLevel: 'loose'
		});

		// Load project info
		if ($user) {
			try {
				const snap = await getDoc(doc(db, 'projects', projectId ?? ''));
				if (snap.exists()) project = { id: snap.id, ...snap.data() };
			} catch (e) {
				console.error(e);
			}

			// Load diagrams
			const q = query(
				collection(db, 'diagrams'),
				where('projectId', '==', projectId),
				where('userId', '==', $user.uid),
				orderBy('createdAt', 'asc')
			);
			unsubscribe = onSnapshot(q, (snap) => {
				diagrams = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
				if (!viewingDiagramId && diagrams.length > 0) {
					viewingDiagramId = diagrams[0].id;
				}
				loading = false;
			});
		} else {
			loading = false;
		}
	});

	onDestroy(() => {
		if (unsubscribe) unsubscribe();
	});
</script>

<svelte:head>
	<title>{project?.name ?? 'Project'} — Diagrams | DevHub</title>
</svelte:head>

<div class="min-h-screen flex flex-col bg-gray-50 dark:bg-gray-950">
	<!-- Topbar -->
	<header
		class="sticky top-0 z-20 bg-white/80 dark:bg-gray-900/80 backdrop-blur-md border-b border-gray-200/60 dark:border-gray-800/60"
	>
		<div class="max-w-screen-2xl mx-auto px-4 sm:px-6 h-14 flex items-center gap-3">
			<!-- eslint-disable svelte/no-navigation-without-resolve -->
			<button
				onclick={() => goto('/')}
				class="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors text-gray-500 dark:text-gray-400"
				aria-label="Back to Dashboard"
			>
				<svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"
					><path
						stroke-linecap="round"
						stroke-linejoin="round"
						stroke-width="2"
						d="M15 19l-7-7 7-7"
					></path></svg
				>
			</button>
			<div class="flex flex-col">
				<span class="text-xs text-gray-400 dark:text-gray-500 leading-none">Project</span>
				<span class="font-bold text-gray-900 dark:text-white text-sm leading-snug line-clamp-1">
					{project?.name ?? '…'}
				</span>
			</div>
			<div class="w-px h-6 bg-gray-200 dark:bg-gray-700 mx-1"></div>
			<span class="text-sm font-semibold text-gray-700 dark:text-gray-200">Diagrams</span>
			<div class="ml-auto">
				<button
					onclick={openNewModal}
					class="inline-flex items-center gap-2 px-4 py-2 bg-accent-600 hover:bg-accent-500 text-white font-semibold rounded-lg text-sm transition-all shadow-sm hover:shadow-md"
				>
					<svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"
						><path
							stroke-linecap="round"
							stroke-linejoin="round"
							stroke-width="2"
							d="M12 4v16m8-8H4"
						></path></svg
					>
					New Diagram
				</button>
			</div>
		</div>
	</header>

	{#if loading}
		<div class="flex-1 flex items-center justify-center">
			<div class="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-accent-600"
			></div>
		</div>
	{:else if diagrams.length === 0}
		<!-- Empty state -->
		<div class="flex-1 flex items-center justify-center p-8">
			<div class="text-center max-w-sm">
				<div
					class="w-20 h-20 bg-accent-50 dark:bg-accent-900/30 rounded-2xl flex items-center justify-center mx-auto mb-5"
				>
					<svg
						class="w-10 h-10 text-accent-500"
						fill="none"
						stroke="currentColor"
						viewBox="0 0 24 24"
					>
						<path
							stroke-linecap="round"
							stroke-linejoin="round"
							stroke-width="1.5"
							d="M7 12l3-3 3 3 4-4M8 21l4-4 4 4M3 4h18M4 4h16v12a1 1 0 01-1 1H5a1 1 0 01-1-1V4z"
						></path>
					</svg>
				</div>
				<h2 class="text-xl font-bold text-gray-900 dark:text-white mb-2">No diagrams yet</h2>
				<p class="text-gray-500 dark:text-gray-400 mb-6 text-sm">
					Create a Flowchart or ERD diagram using Mermaid syntax to visualize your project's
					architecture.
				</p>
				<button
					onclick={openNewModal}
					class="inline-flex items-center gap-2 px-5 py-2.5 bg-accent-600 hover:bg-accent-500 text-white font-semibold rounded-xl text-sm transition-all shadow-md"
				>
					<svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"
						><path
							stroke-linecap="round"
							stroke-linejoin="round"
							stroke-width="2"
							d="M12 4v16m8-8H4"
						></path></svg
					>
					Create First Diagram
				</button>
			</div>
		</div>
	{:else}
		<!-- Main split view -->
		<div class="flex-1 flex overflow-hidden" style="height: calc(100vh - 56px)">
			<!-- Sidebar -->
			<aside
				class="w-64 shrink-0 bg-white dark:bg-gray-900 border-r border-gray-200/60 dark:border-gray-800/60 flex flex-col overflow-hidden"
			>
				<div class="p-3 border-b border-gray-100 dark:border-gray-800">
					<p class="text-xs font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest px-2">
						Diagrams ({diagrams.length})
					</p>
				</div>
				<div class="flex-1 overflow-y-auto p-2 flex flex-col gap-1">
					{#each diagrams as diagram (diagram.id)}
						<button
							onclick={() => (viewingDiagramId = diagram.id)}
							class="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-left transition-colors group {viewingDiagramId ===
							diagram.id
								? 'bg-accent-50 dark:bg-accent-900/30 text-accent-700 dark:text-accent-300'
								: 'hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-700 dark:text-gray-300'}"
						>
							<!-- Type icon -->
							{#if diagram.type === 'flowchart'}
								<div
									class="w-8 h-8 shrink-0 rounded-lg flex items-center justify-center {viewingDiagramId === diagram.id ? 'bg-accent-100 dark:bg-accent-900/60' : 'bg-gray-100 dark:bg-gray-800'}"
								>
									<svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"
										><path
											stroke-linecap="round"
											stroke-linejoin="round"
											stroke-width="2"
											d="M13 10V3L4 14h7v7l9-11h-7z"
										></path></svg
									>
								</div>
							{:else}
								<div
									class="w-8 h-8 shrink-0 rounded-lg flex items-center justify-center {viewingDiagramId === diagram.id ? 'bg-accent-100 dark:bg-accent-900/60' : 'bg-gray-100 dark:bg-gray-800'}"
								>
									<svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"
										><path
											stroke-linecap="round"
											stroke-linejoin="round"
											stroke-width="2"
											d="M4 7v10c0 2.21 3.582 4 8 4s8-1.79 8-4V7M4 7c0 2.21 3.582 4 8 4s8-1.79 8-4M4 7c0-2.21 3.582-4 8-4s8 1.79 8 4"
										></path></svg
									>
								</div>
							{/if}
							<div class="flex-1 min-w-0">
								<p class="font-semibold text-sm truncate">{diagram.name}</p>
								<p class="text-xs opacity-60 uppercase tracking-wider">
									{diagram.type === 'flowchart' ? 'Flowchart' : 'ERD'}
								</p>
							</div>
						</button>
					{/each}
				</div>
			</aside>

			<!-- Content area -->
			<div class="flex-1 flex flex-col overflow-hidden bg-gray-50 dark:bg-gray-950">
				{#if viewingDiagram}
					<!-- Toolbar -->
					<div
						class="flex items-center gap-3 px-5 py-3 bg-white dark:bg-gray-900 border-b border-gray-200/60 dark:border-gray-800/60"
					>
						<div>
							<h2 class="font-bold text-gray-900 dark:text-white">{viewingDiagram.name}</h2>
							<p class="text-xs text-gray-400 capitalize">{viewingDiagram.type}</p>
						</div>
						<div class="ml-auto flex items-center gap-2">
							<button
								onclick={() => openEditModal(viewingDiagram)}
								class="inline-flex items-center gap-1.5 px-3 py-1.5 text-sm font-semibold text-accent-700 dark:text-accent-300 bg-accent-50 dark:bg-accent-900/30 hover:bg-accent-100 dark:hover:bg-accent-900/50 rounded-lg border border-accent-100 dark:border-accent-800/50 transition-colors"
							>
								<svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"
									><path
										stroke-linecap="round"
										stroke-linejoin="round"
										stroke-width="2"
										d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
									></path></svg
								>
								Edit
							</button>
							<button
								onclick={() => deleteDiagram(viewingDiagram.id)}
								class="inline-flex items-center gap-1.5 px-3 py-1.5 text-sm font-semibold text-red-700 dark:text-red-400 bg-red-50 dark:bg-red-900/20 hover:bg-red-100 dark:hover:bg-red-900/40 rounded-lg border border-red-100 dark:border-red-800/30 transition-colors"
							>
								<svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"
									><path
										stroke-linecap="round"
										stroke-linejoin="round"
										stroke-width="2"
										d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
									></path></svg
								>
								Delete
							</button>
						</div>
					</div>

					<!-- Diagram render area -->
					<div class="flex-1 overflow-auto p-6 flex items-start justify-center">
						<div
							class="bg-white dark:bg-gray-900 rounded-2xl shadow-sm border border-gray-200/60 dark:border-gray-800/60 p-8 w-full max-w-4xl min-h-64 flex items-center justify-center"
						>
							<div
								id="mermaid-{viewingDiagram.id}"
								class="mermaid w-full overflow-auto text-center"
							>
								{viewingDiagram.code}
							</div>
						</div>
					</div>
				{/if}
			</div>
		</div>
	{/if}
</div>

<!-- Modal -->
{#if isModalOpen}
	<div
		class="fixed inset-0 bg-gray-900/70 backdrop-blur-sm flex items-center justify-center p-4 z-50"
		role="dialog"
		aria-modal="true"
	>
		<div
			class="bg-white dark:bg-gray-900 rounded-2xl shadow-2xl w-full max-w-3xl flex flex-col max-h-[90vh] overflow-hidden border border-gray-200/60 dark:border-gray-800/60"
		>
			<!-- Modal header -->
			<div
				class="flex items-center justify-between px-6 py-4 border-b border-gray-200/60 dark:border-gray-800/60"
			>
				<h2 class="text-lg font-bold text-gray-900 dark:text-white">
					{editingDiagram ? 'Edit Diagram' : 'New Diagram'}
				</h2>
				<button
					onclick={closeModal}
					class="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors text-gray-400"
					aria-label="Close"
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

			<!-- Modal body -->
			<div class="flex-1 overflow-y-auto p-6 flex flex-col gap-5">
				<!-- Name -->
				<div>
					<label
						for="diag-name"
						class="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-1.5"
						>Diagram Name</label
					>
					<input
						id="diag-name"
						type="text"
						bind:value={modalName}
						placeholder="e.g. Login Flow, User Table ERD"
						class="w-full px-4 py-2.5 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-accent-500 focus:border-accent-500 dark:text-white placeholder-gray-400 outline-none transition-all"
					/>
				</div>

				<!-- Type -->
				<div>
					<p class="text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">Diagram Type</p>
					<div class="grid grid-cols-2 gap-3">
						<button
							onclick={() => (modalType = 'flowchart')}
							class="flex items-center gap-3 p-3 rounded-xl border-2 transition-all {modalType ===
							'flowchart'
								? 'border-accent-500 bg-accent-50 dark:bg-accent-900/30 text-accent-700 dark:text-accent-300'
								: 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600 text-gray-600 dark:text-gray-400'}"
						>
							<svg class="w-5 h-5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"
								><path
									stroke-linecap="round"
									stroke-linejoin="round"
									stroke-width="2"
									d="M13 10V3L4 14h7v7l9-11h-7z"
								></path></svg
							>
							<div class="text-left">
								<p class="font-bold text-sm">Flowchart</p>
								<p class="text-xs opacity-60">Workflow & process flow</p>
							</div>
						</button>
						<button
							onclick={() => (modalType = 'erd')}
							class="flex items-center gap-3 p-3 rounded-xl border-2 transition-all {modalType ===
							'erd'
								? 'border-accent-500 bg-accent-50 dark:bg-accent-900/30 text-accent-700 dark:text-accent-300'
								: 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600 text-gray-600 dark:text-gray-400'}"
						>
							<svg class="w-5 h-5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"
								><path
									stroke-linecap="round"
									stroke-linejoin="round"
									stroke-width="2"
									d="M4 7v10c0 2.21 3.582 4 8 4s8-1.79 8-4V7M4 7c0 2.21 3.582 4 8 4s8-1.79 8-4M4 7c0-2.21 3.582-4 8-4s8 1.79 8 4"
								></path></svg
							>
							<div class="text-left">
								<p class="font-bold text-sm">ERD</p>
								<p class="text-xs opacity-60">Database schema diagram</p>
							</div>
						</button>
					</div>
				</div>

				<!-- Code editor -->
				<div class="flex-1">
					<label
						for="diag-code"
						class="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-1.5"
					>
						Mermaid Code
					</label>
					<textarea
						id="diag-code"
						bind:value={modalCode}
						rows="14"
						class="w-full px-4 py-3 bg-gray-950 dark:bg-gray-950 text-green-400 font-mono text-sm border border-gray-700 rounded-xl focus:ring-2 focus:ring-accent-500 focus:border-accent-500 outline-none transition-all resize-none leading-relaxed placeholder-gray-600"
						placeholder="Write your Mermaid diagram code here..."
						spellcheck="false"
					></textarea>
					<p class="text-xs text-gray-400 mt-1.5">
						Uses <a
							href="https://mermaid.js.org/syntax/flowchart.html"
							target="_blank"
							rel="noopener noreferrer"
							class="text-accent-500 hover:underline">Mermaid.js</a
						> syntax. The diagram will be rendered after saving.
					</p>
				</div>
			</div>

			<!-- Modal footer -->
			<div
				class="flex items-center justify-end gap-3 px-6 py-4 border-t border-gray-200/60 dark:border-gray-800/60"
			>
				<button
					onclick={closeModal}
					class="px-4 py-2 text-sm font-semibold text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
				>
					Cancel
				</button>
				<button
					onclick={saveDiagram}
					disabled={isSaving || !modalName.trim() || !modalCode.trim()}
					class="inline-flex items-center gap-2 px-5 py-2 text-sm font-bold bg-accent-600 hover:bg-accent-500 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-lg transition-all shadow-sm"
				>
					{#if isSaving}
						<svg class="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
							<circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"
							></circle>
							<path
								class="opacity-75"
								fill="currentColor"
								d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
							></path>
						</svg>
						Saving…
					{:else}
						{editingDiagram ? 'Save Changes' : 'Create Diagram'}
					{/if}
				</button>
			</div>
		</div>
	</div>
{/if}
