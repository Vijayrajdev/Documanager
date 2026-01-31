# Secure DocuManager 🛡️

A production-ready, enterprise-grade **Single Page Application (SPA)** for secure bulk document processing. Built with a strong privacy-first mindset, this application processes PDFs entirely on the **client-side** using WebAssembly-powered libraries. Sensitive documents **never leave the user’s browser** during manipulation.

---

## ✨ Features

### 🔒 Client-Side Processing
All PDF operations (watermarking, signing, rotating) run locally in the browser using **pdf-lib**. No files are uploaded to a processing server.

### 💧 Advanced Watermarking
- Diagonal, Horizontal, and Corner positioning  
- Smart auto-centering calculations  
- Customizable text size, opacity, and rotation  

### ✍️ Signature Injection
- Embed PNG signatures into PDFs  
- Auto-positioned at the bottom-right of pages  

### 🔐 Enterprise Security
- AES-256 PDF encryption with custom passwords  
- Restrict printing and copying permissions  

### 🔄 Utilities
- Bulk page rotation (90°, 180°)  

### 📦 Bulk Operations
- Process 100+ files at once  
- Download all processed documents as a single ZIP  

### ☁️ Firebase Integration
- **Authentication**: Google Sign-In and Anonymous Guest access  
- **Audit Logging**: Processing history stored in Firestore (metadata only, no files)  

### 🎨 Glassmorphism UI
- Modern, responsive interface built with Tailwind CSS  

---

## 🛠️ Tech Stack

- **Frontend**: HTML5, Vanilla JavaScript (ES Modules)  
- **Styling**: Tailwind CSS (CDN)  
- **PDF Engine**: pdf-lib  
- **Compression**: JSZip  
- **Icons**: Lucide  
- **Backend/Auth**: Firebase (Auth, Firestore, Storage)  

---

## 🚀 Getting Started

Since this application uses ES Modules (`<script type="module">`), it **cannot** be run via the `file://` protocol. You must serve it over **HTTP/HTTPS**.

---

## ✅ Prerequisites

- A Firebase Project  
- A local web server (VS Code Live Server, Python, or Node.js)

---

## 📥 Installation

### 1. Clone the Repository
```bash
git clone https://github.com/yourusername/secure-documanager.git
cd secure-documanager
```
## 🔧 Configure Firebase

Open `index.html` and locate the Firebase configuration section (around line 340).

### Replace the placeholder configuration

**Remove this:**
```js
// const firebaseConfig = typeof __firebase_config !== 'undefined' ? JSON.parse(__firebase_config) : {};
```
---

## 🔐 Enable Firebase Features

After adding your Firebase credentials, configure the following services in the **Firebase Console**.

---

### 🔑 Authentication

1. Go to **Build → Authentication → Sign-in method**
2. Enable the following providers:
   - **Google**
   - **Anonymous**
3. Save the changes

This allows both authenticated users and guest users to access the application securely.

---

### 🗄️ Firestore Database

1. Navigate to **Build → Firestore Database**
2. Click **Create Database**
3. Choose one of the following:
   - **Test Mode** (for development)
   - **Production Mode** with custom security rules
4. Select a preferred region and complete setup

Firestore is used **only for audit logging and metadata**.  
No documents or files are stored.

---

### 📄 Firestore Data Usage

The application logs:
- User ID (anonymous or authenticated)
- Timestamp of operation
- Type of operation (watermark, sign, rotate, encrypt)
- Number of files processed

> 🔒 **Privacy Note:** PDF content is never uploaded or stored in Firebase.

---

## ▶️ Running the Application Locally

Because the app uses ES Modules, it must be served over HTTP or HTTPS.

---

### Option A: VS Code Live Server (Recommended)

1. Install the **Live Server** extension in VS Code
2. Right-click `index.html`
3. Select **Open with Live Server**

---

### Option B: Python (Simple HTTP Server)

```bash
# Python 3
python -m http.server 8000
```

## 📱 Mobile Support

The application is fully responsive and optimized for both desktop and mobile devices.

### Mobile Enhancements
- Floating Action Button (FAB) for quick execution on small screens  
- Simplified toolbars for improved usability  
- Touch-friendly drag-and-drop and file selection areas  

---

## 🤝 Contributing

1. Fork the project  
2. Create your feature branch  
   ```bash
   git checkout -b feature/AmazingFeature
   ```
3. Commit your changes  
    ```bash
    git commit -m "Add some AmazingFeature"
    ```
4. Push to the branch  
    ```bash
    git push origin feature/AmazingFeature
    ```
5. Open a Pull Request

## 📝 License

This project is distributed under the **MIT License**.  
See the `LICENSE` file for more information.

---

## ❤️ Credits

Developed by **Vijay**  
UI inspired by modern **Glassmorphism** design trends

