<p align="center">
  <img src="static/favicon.svg" alt="DevHub Logo" width="120" />
</p>

<h1 align="center">DevHub</h1>

<p align="center">
  <strong>Monitor all your app projects in one beautiful, glassmorphic dashboard.</strong>
</p>

<p align="center">
  <img src="https://img.shields.io/badge/SvelteKit-5-FF3E00?style=flat-square&logo=svelte" alt="SvelteKit 5" />
  <img src="https://img.shields.io/badge/Tailwind-v4-06B6D4?style=flat-square&logo=tailwindcss" alt="Tailwind CSS v4" />
  <img src="https://img.shields.io/badge/Firebase-Auth_%26_Firestore-FFCA28?style=flat-square&logo=firebase" alt="Firebase" />
  <img src="https://img.shields.io/badge/GitHub-API-181717?style=flat-square&logo=github" alt="GitHub API" />
</p>

## ✨ Features

- **GitHub Auto-Detect**: Just paste your GitHub repository link! DevHub will automatically fetch the project's **README summary** and detect its **Tech Stack** (Languages, `package.json`, `composer.json` dependencies).
- **Private Repo Support**: Authenticate using your GitHub account to seamlessly fetch data even from your private repositories securely via Firebase Auth.
- **Glassmorphism UI**: Beautiful, premium, and fully responsive design using CSS Backdrop Filters.
- **Dark Mode Ready**: Fully supports system dark mode preferences out of the box.
- **Cloud Synced**: Real-time project tracking and state management powered by Firebase Firestore.
- **Smart Filtering**: Quickly search your projects or filter them by status (In Development, Completed) or toggle **"Has Bugs"** to find unresolved issues.
- **Dynamic Task Tracking**: Keep track of what needs to be done next directly inside each project card.

## 🚀 Quick Start

### 1. Clone & Install

```bash
git clone https://github.com/hendikaseptio/devhub.git
cd devhub
npm install
```

### 2. Firebase Setup

1. Create a project in [Firebase Console](https://console.firebase.google.com/).
2. Enable **Firestore Database** and add the Security Rules found in `firestore.rules`.
3. Enable **Authentication** (Sign-in providers: **GitHub**).
4. Get your Web App Config from Project Settings.

### 3. Environment Variables

Create a `.env` file in the root directory by copying the example:

```bash
cp .env.example .env
```

Fill in the variables with your Firebase credentials:

```env
PUBLIC_FIREBASE_API_KEY=your_api_key
PUBLIC_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
PUBLIC_FIREBASE_PROJECT_ID=your_project_id
PUBLIC_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
PUBLIC_FIREBASE_APP_ID=your_app_id
```

### 4. Run Development Server

```bash
npm run dev -- --open
```

## 🛡️ Security

- **API Keys**: Ensure your Firebase API key is strictly locked to your domain using Google Cloud Console (API & Services > Credentials > Application Restrictions) before deploying.
- **Content Security Policy (CSP)**: DevHub implements a strict `meta` CSP in `src/app.html` to prevent XSS attacks when deployed.

## 📦 Deployment

DevHub is powered by SvelteKit's `adapter-auto` and can be instantly deployed for free to:

- **[Vercel](https://vercel.com/)** (Highly Recommended: Zero config needed)
- **Firebase Hosting** (via `firebase init hosting`)

---

<p align="center">Crafted with ❤️ by Hendika</p>
