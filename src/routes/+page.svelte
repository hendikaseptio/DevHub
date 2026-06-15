<script>
	import { user } from '$lib/stores';
	import {
		auth,
		googleProvider,
		githubProvider,
		GithubAuthProvider,
		signInWithPopup
	} from '$lib/firebase';
	import Dashboard from './Dashboard.svelte';

	const handleGoogleLogin = async () => {
		try {
			await signInWithPopup(auth, googleProvider);
		} catch (error) {
			console.error('Error signing in with Google:', error);
			alert('Failed to sign in with Google');
		}
	};

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
					onclick={handleGoogleLogin}
					class="w-full flex items-center justify-center gap-3 bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-100 font-bold py-3.5 px-6 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 hover:shadow-md hover:-translate-y-0.5 hover:bg-gray-50 dark:hover:bg-gray-700 transition-all duration-300"
				>
					<svg class="w-6 h-6" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
						<path
							d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
							fill="#4285F4"
						/>
						<path
							d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
							fill="#34A853"
						/>
						<path
							d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
							fill="#FBBC05"
						/>
						<path
							d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
							fill="#EA4335"
						/>
					</svg>
					Sign in with Google
				</button>

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
