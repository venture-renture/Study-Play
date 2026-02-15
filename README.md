# 🎧 Study Play

**Study Play** is a lightweight, frontend-only web application that allows users to stream and organise their personal MP3 files directly from a dedicated folder in Google Drive.

Designed for restricted networks and low-power devices such as Chromebooks, Study Play provides a clean, ad-free music experience while remaining fully compliant with Google Drive permissions and OAuth security standards.

---

## 🚀 Overview

Study Play integrates with Google OAuth 2.0 to authenticate users and securely access a scoped folder within their Google Drive.

On first login, the app automatically creates a `/SchoolMusic/` folder in the user’s Drive. All music playback is restricted to this folder, ensuring:

- No access to unrelated Drive files  
- No backend storage of user data  
- No third-party music hosting  
- Fully private, user-owned media  

Audio files are streamed directly from Google Drive using authorised REST API requests and the native HTML5 `<audio>` element.

---

## 🔐 Authentication & Security

Study Play uses:

- Google OAuth 2.0 via Google Identity Services  
- The `drive.file` permission scope only  
- Client-side access token handling  

Key security decisions:

- No backend server  
- No database  
- No external file storage  
- No access to the user's entire Drive  

The app can only access files it creates or manages within its own `/SchoolMusic/` folder.

---

## 🎵 Core Features

- Google account authentication  
- Automatic `/SchoolMusic/` folder creation  
- Dynamic MP3 file listing from Drive  
- Direct streaming via Drive `alt=media` endpoint  
- Play / Pause / Skip controls  
- Shuffle and repeat modes  
- In-memory playlist system  
- Optional playlist persistence via JSON stored in Drive  
- Lightweight UI optimised for low-power devices  

---

## 🏗 Technical Architecture

Study Play is entirely frontend-based and built with:

- HTML  
- CSS  
- Vanilla JavaScript  
- Google Identity Services  
- Google Drive REST API (v3)  
- HTML5 `<audio>` element  

Because there is no backend:

- Hosting is free and simple  
- Deployment is static  
- The attack surface is minimal  
- No server-side maintenance is required  

---

## ⚙ How It Works

1. User authenticates via Google OAuth.
2. The app checks for a `/SchoolMusic/` folder.
3. If missing, the folder is created automatically.
4. The app queries that folder for MP3 files.
5. Files are rendered in the interface.
6. Selected tracks are streamed directly from Drive.
7. Playlist logic is handled entirely client-side.

All API requests include a valid Bearer access token and are scoped strictly to authorised Drive content.

---

## 📦 Deployment

Study Play can be deployed as a static site using:

- GitHub Pages  
- Vercel  
- Netlify  

OAuth redirect URIs must be configured correctly in the Google Cloud Console before deployment.

---

## 🧠 Project Goals

Study Play explores and demonstrates:

- OAuth 2.0 authentication flows  
- Scoped API permissions  
- RESTful API integration  
- Client-side state management  
- Secure token handling  
- Media streaming without a backend  

It showcases how powerful web applications can be built entirely in the browser using modern web APIs.

---

## 📄 License

MIT License
