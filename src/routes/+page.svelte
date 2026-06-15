<script>
	import { user } from '$lib/stores';
	import { auth, googleProvider, signInWithPopup } from '$lib/firebase';
	import Dashboard from './Dashboard.svelte';

	const handleLogin = async () => {
		try {
			await signInWithPopup(auth, googleProvider);
		} catch (error) {
			console.error('Error signing in:', error);
			alert('Failed to sign in with Google');
		}
	};
</script>

<svelte:head>
	<title>DevHub - Project Monitor</title>
</svelte:head>

{#if $user}
	<Dashboard />
{:else}
	<div
		class="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 p-4"
	>
		<div
			class="max-w-md w-full bg-white/10 backdrop-blur-lg rounded-2xl shadow-2xl p-8 border border-white/20 text-center"
		>
			<div class="mb-8">
				<div
					class="w-20 h-20 bg-white rounded-2xl shadow-lg mx-auto flex items-center justify-center mb-6 transform -rotate-6"
				>
					<svg
						class="w-12 h-12 text-indigo-600"
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
				<h1 class="text-4xl font-extrabold text-white mb-2 drop-shadow-md">DevHub</h1>
				<p class="text-indigo-100 text-lg">Monitor all your app projects in one place.</p>
			</div>

			<button
				onclick={handleLogin}
				class="w-full flex items-center justify-center gap-3 bg-white text-gray-800 font-bold py-4 px-6 rounded-xl shadow-lg hover:shadow-xl hover:scale-105 transition-all duration-300"
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
		</div>
	</div>
{/if}
