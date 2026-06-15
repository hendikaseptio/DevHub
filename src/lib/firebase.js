import { initializeApp, getApps, getApp } from 'firebase/app';
import {
	getAuth,
	GoogleAuthProvider,
	GithubAuthProvider,
	signInWithPopup,
	signOut
} from 'firebase/auth';
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

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
	apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
	authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
	projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
	storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
	messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
	appId: import.meta.env.VITE_FIREBASE_APP_ID
};

// Initialize Firebase
const app = getApps().length ? getApp() : initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

const googleProvider = new GoogleAuthProvider();
const githubProvider = new GithubAuthProvider();
// Request access to private repos
githubProvider.addScope('repo');

export {
	app,
	auth,
	db,
	googleProvider,
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
	orderBy
};
