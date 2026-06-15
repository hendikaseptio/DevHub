<script>
	import { user } from '$lib/stores';
	import { auth, githubProvider, GithubAuthProvider, signInWithPopup } from '$lib/firebase';
	import Dashboard from './Dashboard.svelte';

	const handleGithubLogin = async () => {
		try {
			const result = await signInWithPopup(auth, githubProvider);
			const credential = GithubAuthProvider.credentialFromResult(result);
			const token = credential?.accessToken;
			if (token) {
				// Save GitHub token for private repo fetching later
				localStorage.setItem('githubToken', token);
			}
		} catch (error) {
			console.error('Error signing in with GitHub:', error);
			alert(
				'Failed to sign in with GitHub. Please make sure GitHub Auth is enabled in Firebase Console.'
			);
		}
	};
</script>

<svelte:head>
	<title>DevHub - Project Monitor</title>
</svelte:head>

{#if $user}
	<Dashboard />
{:else}
	<div class="min-h-screen flex items-center justify-center p-4">
		<div
			class="max-w-md w-full glass p-8 rounded-3xl text-center border-t-2 border-t-white/50 dark:border-t-white/10"
		>
			<div class="mb-8 relative">
				<div
					class="absolute -inset-4 bg-accent-500/20 dark:bg-accent-500/10 blur-xl rounded-full z-0"
				></div>
				<div
					class="w-24 h-24 bg-white dark:bg-gray-800 rounded-3xl shadow-xl mx-auto flex items-center justify-center mb-6 transform -rotate-6 relative z-10 border border-gray-100 dark:border-gray-700"
				>
					<svg
						class="w-12 h-12 text-accent-600 dark:text-accent-400"
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
				<h1
					class="text-5xl font-extrabold text-gray-900 dark:text-white mb-3 tracking-tight relative z-10"
				>
					DevHub
				</h1>
				<p class="text-gray-600 dark:text-gray-300 text-lg relative z-10">
					Monitor all your app projects in one beautiful place.
				</p>
			</div>

			<div class="flex flex-col gap-3">
				<button
					onclick={handleGithubLogin}
					class="w-full flex items-center justify-center gap-3 bg-gray-900 dark:bg-black text-white font-bold py-3.5 px-6 rounded-2xl shadow-sm border border-gray-800 hover:shadow-md hover:-translate-y-0.5 hover:bg-gray-800 dark:hover:bg-gray-900 transition-all duration-300"
				>
					<svg
						class="w-6 h-6"
						fill="currentColor"
						viewBox="0 0 24 24"
						xmlns="http://www.w3.org/2000/svg"
						><path
							fill-rule="evenodd"
							clip-rule="evenodd"
							d="M12 2C6.477 2 2 6.477 2 12c0 4.42 2.865 8.166 6.839 9.489.5.092.682-.217.682-.482 0-.237-.008-.866-.013-1.7-2.782.603-3.369-1.34-3.369-1.34-.454-1.156-1.11-1.462-1.11-1.462-.908-.62.069-.608.069-.608 1.003.07 1.531 1.03 1.531 1.03.892 1.529 2.341 1.087 2.91.831.092-.646.35-1.086.636-1.336-2.22-.253-4.555-1.11-4.555-4.943 0-1.091.39-1.984 1.029-2.683-.103-.253-.446-1.27.098-2.647 0 0 .84-.269 2.75 1.025A9.578 9.578 0 0112 6.836c.85.004 1.705.114 2.504.336 1.909-1.294 2.747-1.025 2.747-1.025.546 1.379.203 2.394.1 2.647.64.699 1.028 1.592 1.028 2.683 0 3.842-2.339 4.687-4.566 4.935.359.309.678.919.678 1.852 0 1.336-.012 2.415-.012 2.743 0 .267.18.578.688.48C19.138 20.161 22 16.416 22 12c0-5.523-4.477-10-10-10z"
						></path></svg
					>
					Sign in with GitHub
				</button>
			</div>
		</div>
	</div>
{/if}
