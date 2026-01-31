// --- FIREBASE SETUP ---
import { initializeApp } from "https://www.gstatic.com/firebasejs/11.6.1/firebase-app.js";
import {
  getAuth,
  signInAnonymously,
  onAuthStateChanged,
  signOut,
  signInWithCustomToken,
} from "https://www.gstatic.com/firebasejs/11.6.1/firebase-auth.js";
import {
  getFirestore,
  collection,
  addDoc,
  serverTimestamp,
} from "https://www.gstatic.com/firebasejs/11.6.1/firebase-firestore.js";

// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = window.CONFIG.firebase;
const appId = window.CONFIG.appId;
let firebaseApp, auth, db;

try {
  firebaseApp = initializeApp(firebaseConfig);
  auth = getAuth(firebaseApp);
  db = getFirestore(firebaseApp);
} catch (e) {
  console.error("Firebase Init:", e);
}

// --- APP LOGIC ---
const app = {
  user: null,
  files: [],
  processedFiles: [], // Stores { name, blob } for ZIP
  signatureBytes: null,
  mode: "watermark", // watermark, protect, rotate

  init() {
    lucide.createIcons();
    this.auth.init();
    this.ui.init();
  },

  auth: {
    init() {
      if (!auth) return;
      const initAuth = async () => {
        if (
          typeof __initial_auth_token !== "undefined" &&
          __initial_auth_token
        ) {
          await signInWithCustomToken(auth, __initial_auth_token);
        } else {
          await signInAnonymously(auth);
        }
      };
      initAuth();
      onAuthStateChanged(auth, (user) => {
        app.user = user;
        app.ui.updateAuthUI(user);
        app.router.navigate(user ? "home" : "auth");
      });
    },
    signIn: async () => auth && signInAnonymously(auth),
    signOut: () => auth && signOut(auth),
  },

  router: {
    navigate(viewName) {
      if (viewName === "home" && !app.user) viewName = "auth";
      document
        .querySelectorAll('[id^="view-"]')
        .forEach((el) => el.classList.add("hidden"));
      document
        .getElementById(`view-${viewName === "home" ? "dashboard" : viewName}`)
        .classList.remove("hidden");
      window.scrollTo(0, 0);
    },
  },

  ui: {
    init() {
      document
        .getElementById("file-input")
        .addEventListener("change", (e) => this.handleFiles(e.target.files));
      document.getElementById("sig-input").addEventListener("change", (e) => {
        const file = e.target.files[0];
        if (file) {
          const reader = new FileReader();
          reader.onload = (evt) => (app.signatureBytes = evt.target.result);
          reader.readAsArrayBuffer(file);
        }
      });
    },

    setMode(mode) {
      app.mode = mode;
      // Visual Tabs
      document.querySelectorAll('[id^="mode-"]').forEach((btn) => {
        btn.classList.remove("bg-indigo-600", "text-white");
        btn.classList.add("hover:bg-glass-200");
      });
      const activeBtn = document.getElementById(`mode-${mode}`);
      activeBtn.classList.add("bg-indigo-600", "text-white");
      activeBtn.classList.remove("hover:bg-glass-200");

      // Panel Visibility
      const wmPanel = document.getElementById("panel-watermark");
      const rotControl = document.getElementById("rotator-control");
      const passControl = document.getElementById("password-control");
      const secTitle = document.getElementById("sec-title");

      if (mode === "watermark") {
        wmPanel.classList.remove("hidden");
        rotControl.classList.add("hidden");
        passControl.classList.remove("hidden");
        secTitle.innerText = "Security";
      } else if (mode === "protect") {
        wmPanel.classList.add("hidden");
        rotControl.classList.add("hidden");
        passControl.classList.remove("hidden");
        secTitle.innerText = "Password Protection";
      } else if (mode === "rotate") {
        wmPanel.classList.add("hidden");
        rotControl.classList.remove("hidden");
        passControl.classList.add("hidden");
        secTitle.innerText = "Utilities";
      }
    },

    handleFiles(fileList) {
      app.files = Array.from(fileList);
      app.processedFiles = []; // Reset processed
      document.getElementById("zip-btn").classList.add("hidden");

      const listContainer = document.getElementById("file-list");
      listContainer.innerHTML = "";
      document.getElementById("file-count").textContent =
        `${app.files.length} files`;

      app.files.forEach((file, index) => {
        const sizeMB = (file.size / (1024 * 1024)).toFixed(1);
        const row = document.createElement("div");
        row.className =
          "grid grid-cols-12 gap-2 items-center bg-glass-100 p-2 rounded-lg border border-glass-border text-xs";
        row.id = `file-row-${index}`;
        row.innerHTML = `
                            <div class="col-span-7 truncate font-medium flex items-center gap-2">
                                <i data-lucide="file-text" class="w-3 h-3 text-indigo-400 flex-shrink-0"></i> 
                                <span class="truncate">${file.name}</span>
                            </div>
                            <div class="col-span-5 text-right status-text font-mono text-yellow-400">PENDING</div>
                        `;
        listContainer.appendChild(row);
      });
      lucide.createIcons();
    },

    clearFiles() {
      app.files = [];
      app.processedFiles = [];
      document.getElementById("file-input").value = "";
      document.getElementById("file-list").innerHTML = `
                        <div class="h-40 flex flex-col items-center justify-center text-glass-muted opacity-50">
                            <i data-lucide="inbox" class="w-10 h-10 mb-2"></i>
                            <p class="text-sm">Ready for files</p>
                        </div>`;
      document.getElementById("file-count").textContent = "0 files selected";
      document.getElementById("zip-btn").classList.add("hidden");
      lucide.createIcons();
    },

    updateFileStatus(index, status, url = null) {
      const row = document.getElementById(`file-row-${index}`);
      if (!row) return;
      const statusEl = row.querySelector(".status-text");

      if (status === "processing") {
        statusEl.textContent = "...";
        statusEl.className =
          "col-span-5 text-right status-text font-mono text-blue-400 animate-pulse";
      } else if (status === "done") {
        statusEl.innerHTML = "";
        statusEl.className =
          "col-span-5 text-right status-text font-mono text-emerald-400";
        if (url) {
          const dlBtn = document.createElement("a");
          dlBtn.href = url;
          dlBtn.download = `protected_${app.files[index].name}`;
          dlBtn.className =
            "inline-flex items-center justify-center w-6 h-6 bg-emerald-500/20 text-emerald-400 rounded hover:bg-emerald-500/40";
          dlBtn.innerHTML = '<i data-lucide="download" class="w-3 h-3"></i>';
          statusEl.appendChild(dlBtn);
          lucide.createIcons();
        }
      } else if (status === "error") {
        statusEl.textContent = "ERR";
        statusEl.className =
          "col-span-5 text-right status-text font-mono text-red-400";
      }
    },

    updateAuthUI(user) {
      const container = document.getElementById("auth-buttons");
      if (!container) return;
      if (user) {
        container.innerHTML = `
                            <div class="flex items-center gap-3">
                                <div class="text-right hidden sm:block">
                                    <div class="text-xs text-glass-muted">Signed in as</div>
                                    <div class="text-sm font-bold">${user.isAnonymous ? "Guest User" : user.displayName || "User"}</div>
                                </div>
                                <button onclick="app.auth.signOut()" class="bg-red-500/20 hover:bg-red-500/30 text-red-400 p-2 rounded-lg transition-colors" title="Sign Out">
                                    <i data-lucide="log-out" class="w-4 h-4"></i>
                                </button>
                            </div>
                        `;
      } else {
        container.innerHTML = ``;
      }
      if (window.lucide) lucide.createIcons();
    },
  },

  processor: {
    async processQueue() {
      const files = app.files;
      if (files.length === 0) return alert("No files selected");

      if (app.mode === "protect") {
        if (!document.getElementById("doc-password").value)
          return alert("Please enter a password for Protection Mode");
      }

      const btns = [
        document.getElementById("process-btn-desktop"),
        document.getElementById("process-btn-mobile"),
      ];
      btns.forEach((b) => {
        b.disabled = true;
        b.innerHTML = '<span class="animate-spin">⟳</span>';
      });

      const settings = {
        text: document.getElementById("wm-text").value || "CONFIDENTIAL",
        size: parseInt(document.getElementById("wm-size").value),
        opacity: parseFloat(document.getElementById("wm-opacity").value),
        position: document.getElementById("wm-position").value,
        password: document.getElementById("doc-password").value,
        rotation: parseInt(document.getElementById("page-rotation").value),
      };

      app.processedFiles = [];

      for (let i = 0; i < files.length; i++) {
        app.ui.updateFileStatus(i, "processing");
        try {
          const processedBlob = await this.modifyPdf(files[i], settings);
          const url = URL.createObjectURL(processedBlob);

          app.processedFiles.push({
            name: `processed_${files[i].name}`,
            blob: processedBlob,
          });

          if (db && app.user) {
            addDoc(
              collection(
                db,
                "artifacts",
                appId,
                "users",
                app.user.uid,
                "history",
              ),
              {
                filename: files[i].name,
                mode: app.mode,
                timestamp: serverTimestamp(),
              },
            ).catch((e) => console.log("Log fail", e));
          }

          app.ui.updateFileStatus(i, "done", url);
        } catch (error) {
          console.error(error);
          app.ui.updateFileStatus(i, "error");
        }
      }

      if (app.processedFiles.length > 0) {
        document.getElementById("zip-btn").classList.remove("hidden");
      }

      btns.forEach((b) => {
        b.disabled = false;
        b.innerHTML =
          app.mode === "protect"
            ? '<i data-lucide="lock" class="w-5 h-5"></i>'
            : '<i data-lucide="play" class="w-6 h-6 ml-1"></i>';
      });
      document.getElementById("process-btn-desktop").innerHTML =
        '<span>Process Complete</span> <i data-lucide="check" class="w-4 h-4"></i>';
      lucide.createIcons();
    },

    async modifyPdf(file, s) {
      const arrayBuffer = await file.arrayBuffer();
      const pdfDoc = await PDFLib.PDFDocument.load(arrayBuffer);
      const pages = pdfDoc.getPages();

      if (app.mode === "watermark") {
        const font = await pdfDoc.embedFont(PDFLib.StandardFonts.HelveticaBold);
        let signatureImage;
        if (app.signatureBytes) {
          try {
            signatureImage = await pdfDoc.embedPng(app.signatureBytes);
          } catch (e) {}
        }

        pages.forEach((page) => {
          const { width, height } = page.getSize();

          const textWidth = font.widthOfTextAtSize(s.text, s.size);
          const textHeight = s.size;
          let x, y, rotate;
          const margin = 30;

          if (s.position === "center-diag") {
            const angleRad = 45 * (Math.PI / 180);
            const cx = width / 2;
            const cy = height / 2;
            x = cx - (textWidth / 2) * Math.cos(angleRad);
            y = cy - (textWidth / 2) * Math.sin(angleRad);
            rotate = PDFLib.degrees(45);
          } else if (s.position === "center-flat") {
            x = (width - textWidth) / 2;
            y = height / 2;
            rotate = PDFLib.degrees(0);
          } else if (s.position === "top-left") {
            x = margin;
            y = height - margin - textHeight;
            rotate = PDFLib.degrees(0);
          } else if (s.position === "top-right") {
            x = width - margin - textWidth;
            y = height - margin - textHeight;
            rotate = PDFLib.degrees(0);
          } else if (s.position === "bottom-left") {
            x = margin;
            y = margin;
            rotate = PDFLib.degrees(0);
          } else {
            x = width - margin - textWidth;
            y = margin;
            rotate = PDFLib.degrees(0);
          }

          page.drawText(s.text, {
            x,
            y,
            size: s.size,
            font: font,
            opacity: s.opacity,
            rotate: rotate,
            color: PDFLib.rgb(0.5, 0.5, 0.5),
          });

          if (signatureImage) {
            const sigDims = signatureImage.scale(0.25);
            page.drawImage(signatureImage, {
              x: width - sigDims.width - 20,
              y: 20,
              width: sigDims.width,
              height: sigDims.height,
            });
          }
        });
      }

      if (app.mode === "rotate" && s.rotation !== 0) {
        pages.forEach((page) => {
          page.setRotation(
            PDFLib.degrees(page.getRotation().angle + s.rotation),
          );
        });
      }

      if ((app.mode === "protect" || app.mode === "watermark") && s.password) {
        pdfDoc.encrypt({
          userPassword: s.password,
          ownerPassword: s.password,
          permissions: {
            printing: "highResolution",
            modifying: false,
            copying: false,
          },
        });
      }

      const pdfBytes = await pdfDoc.save();
      return new Blob([pdfBytes], { type: "application/pdf" });
    },

    async downloadZip() {
      const zip = new JSZip();
      app.processedFiles.forEach((file) => {
        zip.file(file.name, file.blob);
      });

      const btn = document.getElementById("zip-btn");
      btn.textContent = "Zipping...";

      const content = await zip.generateAsync({ type: "blob" });
      const url = URL.createObjectURL(content);
      const a = document.createElement("a");
      a.href = url;
      a.download = `secure_documents_${Date.now()}.zip`;
      a.click();

      btn.innerHTML = '<i data-lucide="check" class="w-3 h-3"></i> Downloaded';
      setTimeout(() => {
        btn.innerHTML =
          '<i data-lucide="archive" class="w-3 h-3"></i> Download All (ZIP)';
      }, 2000);
      lucide.createIcons();
    },
  },
};

window.app = app;
window.addEventListener("DOMContentLoaded", () => app.init());
