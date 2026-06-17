import { initializeApp, getApps, getApp } from 'firebase/app';
import { getAuth, GithubAuthProvider, signInWithPopup, signOut } from 'firebase/auth';
import { getStorage, ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import {
	getFirestore,
	collection,
	addDoc,
	getDocs,
	updateDoc,
	doc,
	deleteDoc,
	query,
	where,
	onSnapshot,
	orderBy
} from 'firebase/firestore';

import {
	PUBLIC_FIREBASE_API_KEY,
	PUBLIC_FIREBASE_AUTH_DOMAIN,
	PUBLIC_FIREBASE_PROJECT_ID,
	PUBLIC_FIREBASE_STORAGE_BUCKET,
	PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
	PUBLIC_FIREBASE_APP_ID
} from '$env/static/public';

// Your web app's Firebase configuration
const firebaseConfig = {
	apiKey: PUBLIC_FIREBASE_API_KEY,
	authDomain: PUBLIC_FIREBASE_AUTH_DOMAIN,
	projectId: PUBLIC_FIREBASE_PROJECT_ID,
	storageBucket: PUBLIC_FIREBASE_STORAGE_BUCKET,
	messagingSenderId: PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
	appId: PUBLIC_FIREBASE_APP_ID
};

// Initialize Firebase
const app = getApps().length ? getApp() : initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);
const storage = getStorage(app);

const githubProvider = new GithubAuthProvider();
// Request access to private repos
githubProvider.addScope('repo');
// Force consent prompt to ensure GitHub asks for the repo scope
githubProvider.setCustomParameters({
	prompt: 'consent'
});

export {
	app,
	auth,
	db,
	storage,
	githubProvider,
	GithubAuthProvider,
	signInWithPopup,
	signOut,
	collection,
	addDoc,
	getDocs,
	updateDoc,
	doc,
	deleteDoc,
	query,
	where,
	onSnapshot,
	orderBy,
	ref,
	uploadBytes,
	getDownloadURL
};
