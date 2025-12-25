/* ================= PROGRESSIVE UPDATE: App.js ================= */
import React, { useEffect, useState, useMemo, useRef } from "react";
import {
  ClipboardCheck,
  LayoutDashboard,
  LogIn,
  LogOut,
  Loader2,
  Trash2,
  Clock,
  ListChecks,
  Eye,
  X,
  Plus,
  Users,
  QrCode,
  CircleDot,
  Type,
  Filter,
  CheckCircle2,
  Download,
  TrendingUp,
  AlertTriangle,
  Award,
  Search,
  Mail,
  ChevronDown,
  Lock,
  ChevronUp,
  GripVertical,
  Copy,
  Store,
  Calendar,
  User as UserIcon,
  FileBarChart
} from "lucide-react";

import { initializeApp } from "firebase/app";
import {
  getAuth,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  createUserWithEmailAndPassword,
} from "firebase/auth";
import {
  getFirestore,
  collection,
  addDoc,
  deleteDoc,
  doc,
  onSnapshot,
  serverTimestamp,
  setDoc,
  getDoc,
  updateDoc,
  query,
  orderBy,
  where
} from "firebase/firestore";

/* ================= FIREBASE CONFIG ================= */
const firebaseConfig = {
  apiKey: "AIzaSyDKPGiRE-5kMDR6sCPxGpcfUJVpn7a4lC0",
  authDomain: "ecosure.firebaseapp.com",
  projectId: "ecosure",
  storageBucket: "ecosure.firebasestorage.app",
  messagingSenderId: "847577390936",
  appId: "1:847577390936:web:d8a00ef67ef21ce98a8f2d",
  measurementId: "G-M82TFF67PJ"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

/* ================= STYLES ================= */
const CustomStyles = () => (
  <style>{`
    @import url("https://fonts.googleapis.com/css2?family=Josefin+Sans:wght@300;400;600;700&display=swap");

    :root {
      --bg: #0d1b2a;
      --card: #1b263b;
      --accent-cyan: #4cc9f0;
      --accent-orange: #ff9f1c;
      --text-primary: #e0e1dd;
      --text-secondary: #778da9;
      --success: #00ff9c;
      --danger: #ff4d4f;
      --warning: #ffd166;
    }

    * { box-sizing: border-box; }

    body {
      margin: 0;
      font-family: "Josefin Sans", sans-serif;
      background-color: var(--bg);
      color: var(--text-primary);
      display: flex;
      flex-direction: column;
      min-height: 100vh;
    }

    .app-container {
      max-width: 1400px;
      margin: 0 auto;
      padding: 16px;
      flex: 1;
      width: 100%;
    }

    .header {
      display: flex;
      flex-direction: column;
      gap: 14px;
      margin-bottom: 24px;
      background: rgba(27, 38, 59, 0.85);
      backdrop-filter: blur(12px);
      padding: 18px 22px;
      border-radius: 24px;
      border: 1px solid rgba(255, 255, 255, 0.1);
      position: sticky;
      top: 16px;
      z-index: 100;
    }

    .brand {
      font-size: 1.75rem;
      font-weight: 700;
      display: flex;
      align-items: center;
      gap: 12px;
    }

    .brand .store { color: var(--accent-orange); }
    .brand .checklist { color: var(--accent-cyan); }

    .nav-group { display: flex; gap: 8px; flex-wrap: wrap; }

    .nav-btn {
      padding: 10px 16px;
      border-radius: 14px;
      border: 1px solid rgba(255,255,255,0.1);
      background: rgba(65, 90, 119, 0.35);
      color: white;
      cursor: pointer;
      font-weight: 600;
      display: inline-flex;
      align-items: center;
      gap: 8px;
      transition: all 0.2s;
      font-family: inherit;
    }

    .nav-btn.active { background: var(--accent-cyan); color: var(--bg); }
    .nav-btn.primary { background: var(--accent-cyan); color: var(--bg); }
    .nav-btn.success { background: var(--success); color: var(--bg); }
    .nav-btn.danger { background: var(--danger); color: white; }
    .nav-btn:disabled { opacity: 0.6; cursor: not-allowed; }

    .card {
      background: var(--card);
      padding: 24px;
      border-radius: 24px;
      border: 1px solid rgba(255,255,255,0.05);
      margin-bottom: 24px;
    }

    .stat-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
      gap: 16px;
      margin-bottom: 24px;
    }

    .stat-card {
      background: rgba(13, 27, 42, 0.4);
      padding: 20px;
      border-radius: 20px;
      border: 1px solid rgba(255,255,255,0.05);
      display: flex;
      flex-direction: column;
      gap: 8px;
    }

    .stat-value { font-size: 2rem; font-weight: 700; color: var(--accent-cyan); }
    .stat-label { font-size: 0.8rem; color: var(--text-secondary); text-transform: uppercase; letter-spacing: 1px; }

    .input-label { font-size: 0.85rem; color: var(--accent-cyan); margin-bottom: 8px; font-weight: 600; display: block; }

    .input-field {
      width: 100%;
      padding: 12px 16px;
      border-radius: 12px;
      border: 2px solid rgba(255,255,255,0.1);
      background: rgba(13, 27, 42, 0.55);
      color: white;
      outline: none;
      font-family: inherit;
    }
    
    .input-field:focus { border-color: var(--accent-cyan); }
    .input-field:disabled { background: rgba(0,0,0,0.3); opacity: 0.7; cursor: not-allowed; }

    .opt-btn {
      flex: 1;
      padding: 10px;
      border-radius: 12px;
      background: var(--bg);
      border: 2px solid transparent;
      color: white;
      cursor: pointer;
      font-weight: 600;
      transition: all 0.2s;
      font-family: inherit;
    }

    .opt-btn.active-yes { background: var(--success); color: var(--bg); }
    .opt-btn.active-selected { background: var(--success); color: var(--bg); }
    .opt-btn.active-no { background: var(--danger); color: white; }
    .opt-btn.active-na { background: var(--accent-cyan); color: var(--bg); }

    .tab-bar {
      display: flex;
      gap: 20px;
      border-bottom: 1px solid rgba(255,255,255,0.1);
      margin-bottom: 24px;
    }

    .tab-item {
      padding: 12px 4px;
      color: var(--text-secondary);
      cursor: pointer;
      font-weight: 600;
      position: relative;
    }

    .tab-item.active { color: var(--accent-cyan); }
    .tab-item.active::after {
      content: '';
      position: absolute;
      bottom: -1px;
      left: 0;
      right: 0;
      height: 2px;
      background: var(--accent-cyan);
    }

    .modal-overlay {
      position: fixed;
      inset: 0;
      background: rgba(0,0,0,0.85);
      backdrop-filter: blur(10px);
      z-index: 1000;
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 20px;
    }

    .modal-content {
      background: var(--card);
      width: 100%;
      max-width: 800px;
      max-height: 90vh;
      border-radius: 32px;
      padding: 32px;
      overflow-y: auto;
      border: 1px solid rgba(255,255,255,0.1);
      position: relative;
    }

    .toast-container {
      position: fixed;
      bottom: 24px;
      right: 24px;
      z-index: 2000;
      display: flex;
      flex-direction: column;
      gap: 12px;
    }

    .toast {
      background: var(--success);
      color: var(--bg);
      padding: 16px 24px;
      border-radius: 16px;
      box-shadow: 0 10px 30px rgba(0,0,0,0.3);
      display: flex;
      align-items: center;
      gap: 12px;
      font-weight: 700;
      animation: slideIn 0.3s ease-out;
    }

    .toast.error { background: var(--danger); color: white; }

    @keyframes slideIn {
      from { transform: translateX(100%); opacity: 0; }
      to { transform: translateX(0); opacity: 1; }
    }

    .report-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
      gap: 16px;
    }

    .report-card {
      background: rgba(255,255,255,0.03);
      border: 1px solid rgba(255,255,255,0.1);
      border-radius: 20px;
      padding: 20px;
      transition: all 0.2s;
    }

    .report-card:hover { transform: translateY(-4px); border-color: var(--accent-cyan); background: rgba(255,255,255,0.05); }

    .qr-box {
      background: white;
      padding: 12px;
      border-radius: 12px;
      width: 152px;
      height: 152px;
      display: flex;
      align-items: center;
      justify-content: center;
    }

    .w-full { width: 100%; }
    .cursor-pointer { cursor: pointer; }
    
    .validation-error {
      color: var(--danger);
      font-size: 0.75rem;
      margin-top: 4px;
      font-weight: 600;
    }

    .question-editor-item {
        background: rgba(0,0,0,0.2);
        margin-bottom: 12px;
        border-radius: 16px;
        padding: 16px;
        border: 1px solid rgba(255,255,255,0.05);
    }
  `}</style>
);

export default function App() {
  const [user, setUser] = useState(null);
  const [adminData, setAdminData] = useState(null);
  const [view, setView] = useState("form");
  const [activeTab, setActiveTab] = useState("analytics");
  const [loading, setLoading] = useState(true);

  // Notifications
  const [toast, setToast] = useState(null);

  // Data
  const [questions, setQuestions] = useState([]);
  const [reports, setReports] = useState([]);
  const [admins, setAdmins] = useState([]);
  
  // Pagination State
  const [itemsToShow, setItemsToShow] = useState(12);
  const PAGE_SIZE = 12;
  
  // UI Logic
  const [selectedReport, setSelectedReport] = useState(null);
  const [searchStore, setSearchStore] = useState("");
  const [isStoreLocked, setIsStoreLocked] = useState(false);
  
  // Forms
  const [auditForm, setAuditForm] = useState({ name: "", store: "", notes: "", answers: {} });
  const [newQ, setNewQ] = useState({ text: "", type: "yesno", options: "" });
  const [newAdmin, setNewAdmin] = useState({ email: "", pass: "", role: "viewer", store: "" });
  const [qrStore, setQrStore] = useState("");
  const qrRef = useRef(null);

  // Auth Inputs
  const [loginForm, setLoginForm] = useState({ email: "", pass: "" });

  /* ================= UTILS ================= */
  const showMessage = (msg, type = "success") => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 4000);
  };

  const loadScript = (src) => new Promise(res => {
    if (document.querySelector(`script[src="${src}"]`)) return res();
    const s = document.createElement("script"); s.src = src; s.onload = res; document.body.appendChild(s);
  });

  const formatDateTime = (ts) => {
    if (!ts) return "Processing...";
    return ts.toDate().toLocaleString('en-US', { 
        month: 'short', day: 'numeric', year: 'numeric', 
        hour: '2-digit', minute: '2-digit' 
    });
  };

  /* ================= INIT & AUTH ================= */
  useEffect(() => {
    const init = async () => {
      await loadScript("https://cdnjs.cloudflare.com/ajax/libs/qrcodejs/1.0.0/qrcode.min.js");
      await loadScript("https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js");
      await loadScript("https://cdnjs.cloudflare.com/ajax/libs/jspdf-autotable/3.5.23/jspdf.plugin.autotable.min.js");
      
      const params = new URLSearchParams(window.location.search);
      const storeParam = params.get('store');
      if (storeParam) {
        setAuditForm(prev => ({ ...prev, store: storeParam }));
        setIsStoreLocked(true);
        showMessage(`Direct Audit for Store #${storeParam}`);
      }
    };
    init();

    return onAuthStateChanged(auth, async u => {
      if (u) {
        setUser(u);
        const snap = await getDoc(doc(db, "admins", u.uid));
        if (snap.exists()) {
            setAdminData(snap.data());
        }
      } else {
        setUser(null);
        setAdminData(null);
      }
      setLoading(false);
    });
  }, []);

  // Fetch Questions (Always Load)
  useEffect(() => {
    const qUnsub = onSnapshot(query(collection(db, "checklist_questions"), orderBy("order", "asc")), snap => {
      setQuestions(snap.docs.map(d => ({ id: d.id, ...d.data() })));
    });
    return () => qUnsub();
  }, []);

  // Fetch Reports and Admins (Only after user & admin profile are ready)
  useEffect(() => {
    if (!user || !adminData) return;
    
    // PROGRESS: Listens to all reports but the view is filtered in useMemo
    const rUnsub = onSnapshot(query(collection(db, "store_checklists"), orderBy("createdAt", "desc")), snap => {
      setReports(snap.docs.map(d => ({ id: d.id, ...d.data() })));
    });

    const aUnsub = onSnapshot(collection(db, "admins"), snap => {
      setAdmins(snap.docs.map(d => ({ id: d.id, ...d.data() })));
    });
    
    return () => { rUnsub(); aUnsub(); };
  }, [user, adminData]);

  /* ================= ANALYTICS & VISIBILITY ================= */
  const analytics = useMemo(() => {
    // If not logged in or profile not loaded, show nothing
    if (!user || !adminData) return { total: 0, compliance: 0, issues: 0, list: [], hasMore: false };

    const filtered = reports.filter(r => {
        // Convert to strings and trim to ensure "1234" matches 1234
        const reportStore = String(r.store || "").trim();
        const searchStr = searchStore.toLowerCase();
        
        const matchesSearch = reportStore.includes(searchStr) || (r.name || "").toLowerCase().includes(searchStr);
        
        // PROGRESSIVE FIX: Ensure Managers see their reports even after refresh
        if (adminData.role === 'manager') {
            const managerAssignedStore = String(adminData.assignedStore || "").trim();
            return matchesSearch && reportStore === managerAssignedStore;
        }

        // Viewers and Superadmins see all reports
        return matchesSearch;
    });

    let totalScore = 0;
    let totalQuestions = 0;
    let issuesFound = 0;

    filtered.forEach(r => {
      Object.values(r.answers || {}).forEach(a => {
        if (a === "Yes") { totalScore++; totalQuestions++; }
        else if (a === "No") { totalQuestions++; issuesFound++; }
      });
    });

    const compliance = totalQuestions > 0 ? Math.round((totalScore / totalQuestions) * 100) : 0;
    const paginatedList = filtered.slice(0, itemsToShow);
    const hasMore = itemsToShow < filtered.length;

    return { total: filtered.length, compliance, issues: issuesFound, list: paginatedList, hasMore };
  }, [reports, searchStore, itemsToShow, adminData, user]);

  /* ================= HANDLERS ================= */
  const validateStore = (s) => /^\d+$/.test(s) && s.length >= 4;

  const handleAuditSubmit = async () => {
    if (!auditForm.name) return showMessage("Inspector Name is required", "error");
    if (!validateStore(auditForm.store)) return showMessage("Valid Store number required", "error");
    
    const unansweredCount = questions.length - Object.keys(auditForm.answers).length;
    if (unansweredCount > 0) return showMessage(`Please answer all ${questions.length} questions.`, "error");

    try {
      await addDoc(collection(db, "store_checklists"), {
        ...auditForm,
        yesCount: Object.values(auditForm.answers).filter(v => v === 'Yes').length,
        totalQuestions: questions.length,
        createdAt: serverTimestamp()
      });
      showMessage("Audit logged successfully!");
      setAuditForm(prev => ({ name: "", store: isStoreLocked ? prev.store : "", notes: "", answers: {} }));
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } catch (e) { showMessage(e.message, "error"); }
  };

  const handleLogin = async () => {
    try {
      const res = await signInWithEmailAndPassword(auth, loginForm.email, loginForm.pass);
      const snap = await getDoc(doc(db, "admins", res.user.uid));
      if(snap.exists()) setAdminData(snap.data());
      setView("admin");
      showMessage("Access granted");
    } catch (e) { showMessage(e.message, "error"); }
  };

  const createAdmin = async () => {
    if (!newAdmin.email || !newAdmin.pass) return showMessage("Email and Password required", "error");
    try {
      const res = await createUserWithEmailAndPassword(auth, newAdmin.email, newAdmin.pass);
      await setDoc(doc(db, "admins", res.user.uid), {
        email: newAdmin.email, 
        role: newAdmin.role, 
        uid: res.user.uid,
        assignedStore: newAdmin.store || ""
      });
      setNewAdmin({ email: "", pass: "", role: "viewer", store: "" });
      showMessage("New admin account created");
    } catch (e) { showMessage(e.message, "error"); }
  };

  const generateQR = () => {
    if (!validateStore(qrStore)) return showMessage("Enter a valid Store # for QR", "error");
    const link = `${window.location.origin}${window.location.pathname}?store=${qrStore}`;
    if (qrRef.current) {
      qrRef.current.innerHTML = "";
      new window.QRCode(qrRef.current, { text: link, width: 128, height: 128 });
    }
  };

  const exportPDF = async (rep) => {
    if (!window.jspdf) return;
    const { jsPDF } = window.jspdf;
    const docP = new jsPDF();
    
    docP.setFillColor(27, 38, 59);
    docP.rect(0, 0, 210, 40, 'F');
    docP.setTextColor(255, 159, 28);
    docP.setFontSize(22);
    docP.text("CKSURE AUDIT", 15, 25);
    
    docP.setTextColor(0, 0, 0);
    docP.setFontSize(10);
    docP.text(`Store: #${rep.store}`, 15, 50);
    docP.text(`Inspector: ${rep.name}`, 15, 56);
    docP.text(`Date: ${rep.createdAt?.toDate().toLocaleString() || 'N/A'}`, 15, 62);
    
    const score = Math.round((Object.values(rep.answers).filter(v => v === 'Yes').length / Object.keys(rep.answers).length) * 100);
    docP.setFontSize(14);
    docP.text(`COMPLIANCE SCORE: ${score}%`, 140, 50);

    docP.autoTable({
      startY: 70,
      head: [['Requirement', 'Response']],
      body: Object.entries(rep.answers),
      headStyles: { fillColor: [27, 38, 59] },
      alternateRowStyles: { fillColor: [245, 245, 245] }
    });
    
    if (rep.notes) {
        const finalY = docP.lastAutoTable.finalY + 10;
        docP.setFontSize(11);
        docP.text("Auditor Notes:", 15, finalY);
        docP.setFontSize(9);
        docP.text(rep.notes, 15, finalY + 6, { maxWidth: 180 });
    }

    docP.save(`CK_Audit_${rep.store}_${rep.name.replace(/\s/g, '_')}.pdf`);
  };

  if (loading) return <div style={{height:'100vh', display:'flex', alignItems:'center', justifyContent:'center', background:'var(--bg)'}}><Loader2 className="animate-spin" size={40} color="var(--accent-cyan)"/></div>;

  return (
    <div className="app-container">
      <CustomStyles />
      
      {toast && (
        <div className="toast-container">
          <div className={`toast ${toast.type === 'error' ? 'error' : ''}`}>
            {toast.type === 'error' ? <AlertTriangle size={20}/> : <CheckCircle2 size={20}/>}
            {toast.msg}
          </div>
        </div>
      )}

      <header className="header">
        <div className="brand">
          <CircleDot size={28} color="var(--accent-orange)"/>
          <div><span className="store">CKSURE</span> <span className="checklist">FOOD</span></div>
        </div>
        <div className="nav-group">
          <button className={`nav-btn ${view === "form" ? "active" : ""}`} onClick={() => setView("form")}><ClipboardCheck size={18}/> New Audit</button>
          {user ? (
            <>
              <button className={`nav-btn ${view === "admin" ? "active" : ""}`} onClick={() => setView("admin")}><LayoutDashboard size={18}/> Dashboard</button>
              <button className="nav-btn danger" onClick={() => signOut(auth)}><LogOut size={18}/></button>
            </>
          ) : (
            <button className={`nav-btn ${view === "login" ? "active" : ""}`} onClick={() => setView("login")}><LogIn size={18}/> Admin Login</button>
          )}
        </div>
      </header>

      {view === "login" && (
        <div className="card" style={{ maxWidth: '400px', margin: '60px auto' }}>
          <h2 style={{textAlign:'center', marginBottom:'25px'}}>Secure Access</h2>
          <div style={{display:'flex', flexDirection:'column', gap:'15px'}}>
            <div><label className="input-label">Email Address</label><input className="input-field" placeholder="email@circlek.com" value={loginForm.email} onChange={e => setLoginForm({...loginForm, email: e.target.value})} /></div>
            <div><label className="input-label">Password</label><input className="input-field" type="password" value={loginForm.pass} onChange={e => setLoginForm({...loginForm, pass: e.target.value})} /></div>
            <button className="nav-btn primary w-full" style={{justifyContent:'center', marginTop:'10px', padding:'15px'}} onClick={handleLogin}>Log In</button>
          </div>
        </div>
      )}

      {view === "form" && (
        <div className="card" style={{ maxWidth: '800px', margin: '0 auto' }}>
          <div style={{display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:'20px'}}>
            <h2 style={{margin:0}}>Store Compliance</h2>
            {isStoreLocked && <div style={{display:'flex', alignItems:'center', gap:'8px', color:'var(--success)', fontSize:'0.8rem', fontWeight:800}}><Lock size={14}/> STORE LOCKED</div>}
          </div>
          
          <div style={{display:'grid', gridTemplateColumns:'1fr 1fr', gap:'20px', marginBottom:'24px'}}>
            <div>
              <label className="input-label">Inspector Name</label>
              <input className="input-field" placeholder="Enter your full name" value={auditForm.name} onChange={e => setAuditForm({...auditForm, name: e.target.value})} />
            </div>
            <div>
              <label className="input-label">Store Number</label>
              <input className="input-field" placeholder="Ex: 1234567" disabled={isStoreLocked} value={auditForm.store} onChange={e => setAuditForm({...auditForm, store: e.target.value.replace(/\D/g, '')})} />
            </div>
          </div>
          
          <div style={{display:'flex', flexDirection:'column', gap:'16px'}}>
            {questions.map((q, idx) => (
                <div key={q.id} style={{padding:'20px', background:'rgba(255,255,255,0.03)', borderRadius:'20px', border:'1px solid rgba(255,255,255,0.05)'}}>
                    <div style={{display:'flex', gap:'15px'}}>
                        <div style={{background:'var(--accent-orange)', color:'var(--bg)', width:'28px', height:'28px', borderRadius:'8px', display:'flex', alignItems:'center', justifyContent:'center', fontWeight:800, fontSize:'0.8rem', flexShrink:0}}>{idx + 1}</div>
                        <div style={{flex:1}}>
                            <p style={{margin:'0 0 15px', fontWeight:600, fontSize:'1.05rem'}}>{q.text}</p>
                            {q.type === 'text' ? (
                                <input className="input-field" placeholder="Enter observation..." onChange={e => setAuditForm({...auditForm, answers: {...auditForm.answers, [q.text]: e.target.value}})} />
                            ) : (
                                <div style={{display:'flex', gap:'10px'}}>
                                    {(q.type === 'radio' ? q.options?.split(',').map(s => s.trim()) : ['Yes', 'No', 'N/A']).map(opt => {
                                        let activeClass = "";
                                        if (auditForm.answers[q.text] === opt) {
                                            if (q.type === 'radio') activeClass = "active-selected";
                                            else {
                                                if (opt === 'Yes') activeClass = "active-yes";
                                                if (opt === 'No') activeClass = "active-no";
                                                if (opt === 'N/A') activeClass = "active-na";
                                            }
                                        }
                                        return (
                                            <button key={opt} className={`opt-btn ${activeClass}`} onClick={() => setAuditForm({...auditForm, answers: {...auditForm.answers, [q.text]: opt}})}>{opt}</button>
                                        );
                                    })}
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            ))}
          </div>

          <div style={{marginTop:'25px'}}>
            <label className="input-label">Additional Comments / Observations</label>
            <textarea className="input-field" style={{minHeight:'120px'}} placeholder="Detail any critical failures or corrective actions taken..." value={auditForm.notes} onChange={e => setAuditForm({...auditForm, notes: e.target.value})} />
          </div>
          <button className="nav-btn primary w-full" style={{justifyContent:'center', marginTop:'30px', padding:'20px', fontSize:'1.1rem'}} onClick={handleAuditSubmit}>Submit Answers</button>
        </div>
      )}

      {view === "admin" && (
        <div style={{animation: 'fadeIn 0.4s ease-out'}}>
          <div className="stat-grid">
            <div className="stat-card">
              <div style={{display:'flex', justifyContent:'space-between', alignItems:'center'}}>
                <span className="stat-label">System Audits</span>
                <FileBarChart size={18} color="var(--accent-cyan)"/>
              </div>
              <span className="stat-value">{analytics.total}</span>
            </div>
            <div className="stat-card">
              <div style={{display:'flex', justifyContent:'space-between', alignItems:'center'}}>
                <span className="stat-label">Compliance</span>
                <TrendingUp size={18} color="var(--success)"/>
              </div>
              <span className="stat-value" style={{color: analytics.compliance > 85 ? 'var(--success)' : 'var(--warning)'}}>{analytics.compliance}%</span>
            </div>
            <div className="stat-card">
              <div style={{display:'flex', justifyContent:'space-between', alignItems:'center'}}>
                <span className="stat-label">Failures</span>
                <AlertTriangle size={18} color="var(--danger)"/>
              </div>
              <span className="stat-value" style={{color:'var(--danger)'}}>{analytics.issues}</span>
            </div>
            <div className="stat-card" style={{justifyContent:'center'}}>
              <div style={{display:'flex', alignItems:'center', gap:'12px', background:'rgba(0,0,0,0.2)', padding:'10px', borderRadius:'14px'}}>
                <Search size={18} color="var(--text-secondary)"/>
                <input className="input-field" style={{border:'none', background:'none', padding:0, fontSize:'0.85rem'}} placeholder="Filter by store/name..." value={searchStore} onChange={e => { setSearchStore(e.target.value); setItemsToShow(PAGE_SIZE); }} />
              </div>
            </div>
          </div>

          <div className="tab-bar">
            <div className={`tab-item ${activeTab === "analytics" ? "active" : ""}`} onClick={() => setActiveTab("analytics")}>Audit Records</div>
            {adminData?.role === "super" && (
              <>
                <div className={`tab-item ${activeTab === "questions" ? "active" : ""}`} onClick={() => setActiveTab("questions")}>Form Builder</div>
                <div className={`tab-item ${activeTab === "admins" ? "active" : ""}`} onClick={() => setActiveTab("admins")}>Users & QR</div>
              </>
            )}
          </div>

          {activeTab === "analytics" && (
            <>
              <div className="report-grid">
                {analytics.list.map(r => (
                  <div key={r.id} className="report-card">
                    <div style={{display:'flex', justifyContent:'space-between', alignItems:'start', marginBottom:'15px'}}>
                      <div>
                        <div style={{color:'var(--accent-orange)', fontWeight:800, fontSize:'1.1rem'}}>Store #{r.store}</div>
                        <div style={{fontSize:'0.85rem', fontWeight:600, marginTop:'4px'}}>{r.name}</div>
                      </div>
                      <div style={{textAlign:'right'}}>
                        <div style={{fontSize:'1.2rem', fontWeight:800, color: (r.yesCount/r.totalQuestions) > 0.8 ? 'var(--success)' : 'var(--danger)'}}>
                            {Math.round((r.yesCount/r.totalQuestions)*100)}%
                        </div>
                      </div>
                    </div>
                    
                    <div style={{fontSize:'0.75rem', color:'var(--text-secondary)', display:'flex', gap:'5px', alignItems:'center', marginBottom:'20px'}}>
                      <Clock size={12}/> {formatDateTime(r.createdAt)}
                    </div>

                    <div style={{display:'flex', gap:'8px'}}>
                        <button className="nav-btn primary" style={{flex:1, padding:'8px'}} onClick={() => setSelectedReport(r)}><Eye size={16}/> View</button>
                        <button className="nav-btn" style={{padding:'8px'}} onClick={() => exportPDF(r)}><Download size={16}/></button>
                        {adminData?.role === 'super' && <button className="nav-btn danger" style={{padding:'8px'}} onClick={() => window.confirm("Delete record?") && deleteDoc(doc(db, "store_checklists", r.id))}><Trash2 size={16}/></button>}
                    </div>
                  </div>
                ))}
              </div>
              {analytics.hasMore && (
                <div style={{textAlign:'center', marginTop:'30px'}}><button className="nav-btn" onClick={() => setItemsToShow(prev => prev + PAGE_SIZE)}><ChevronDown size={18}/> Show More Records</button></div>
              )}
            </>
          )}

          {activeTab === "admins" && (
            <div style={{display:'grid', gridTemplateColumns:'repeat(auto-fit, minmax(350px, 1fr))', gap:'24px'}}>
              <div className="card">
                <h3>QR Code Generator</h3>
                <p style={{fontSize:'0.85rem', opacity:0.6, marginBottom:'20px'}}>Generate a store-specific audit link.</p>
                <div style={{display:'flex', gap:'10px', marginBottom:'20px'}}>
                  <input className="input-field" placeholder="Store #" value={qrStore} onChange={e => setQrStore(e.target.value.replace(/\D/g, ''))} />
                  <button className="nav-btn primary" onClick={generateQR}><QrCode size={18}/> Generate</button>
                </div>
                <div style={{display:'flex', flexDirection:'column', alignItems:'center', gap:'15px', padding:'20px', background:'rgba(255,255,255,0.02)', borderRadius:'20px'}}>
                    <div className="qr-box" ref={qrRef}><QrCode size={40} style={{opacity:0.2}}/></div>
                    {qrStore && <button className="nav-btn" style={{fontSize:'0.8rem'}} onClick={() => { navigator.clipboard.writeText(`${window.location.origin}${window.location.pathname}?store=${qrStore}`); showMessage("Link Copied!"); }}><Copy size={14}/> Copy Audit URL</button>}
                </div>
              </div>
              
              <div className="card">
                <h3>System Users</h3>
                <div style={{display:'flex', flexDirection:'column', gap:'12px', marginBottom:'25px'}}>
                    <input className="input-field" placeholder="User Email" value={newAdmin.email} onChange={e => setNewAdmin({...newAdmin, email: e.target.value})} />
                    <input className="input-field" type="password" placeholder="Password" value={newAdmin.pass} onChange={e => setNewAdmin({...newAdmin, pass: e.target.value})} />
                    <div style={{display:'flex', gap:'10px'}}>
                        <select className="input-field" style={{flex:1}} value={newAdmin.role} onChange={e => setNewAdmin({...newAdmin, role: e.target.value})}>
                            <option value="viewer">Viewer</option>
                            <option value="manager">Store Manager</option>
                            <option value="super">Super Admin</option>
                        </select>
                        {newAdmin.role === 'manager' && <input className="input-field" style={{flex:1}} placeholder="Assigned Store" value={newAdmin.store} onChange={e => setNewAdmin({...newAdmin, store: e.target.value})} />}
                    </div>
                    <button className="nav-btn primary w-full" style={{justifyContent:'center'}} onClick={createAdmin}>Create Account</button>
                </div>
                <div style={{display:'flex', flexDirection:'column', gap:'10px'}}>
                    {admins.map(a => (
                        <div key={a.id} style={{display:'flex', justifyContent:'space-between', padding:'12px 15px', background:'rgba(0,0,0,0.2)', borderRadius:'14px', border:'1px solid rgba(255,255,255,0.05)'}}>
                            <div>
                                <div style={{fontSize:'0.9rem', fontWeight:600}}>{a.email}</div>
                                <div style={{fontSize:'0.7rem', color:'var(--accent-cyan)', textTransform:'uppercase'}}>{a.role} {a.assignedStore && `| Store #${a.assignedStore}`}</div>
                            </div>
                           {user && a.email !== user.email && <Trash2 size={16} color="var(--danger)" className="cursor-pointer" onClick={() => window.confirm("Delete user?") && deleteDoc(doc(db, "admins", a.id))} />}
                        </div>
                    ))}
                </div>
              </div>
            </div>
          )}
          
          {activeTab === "questions" && (
            <div style={{display:'grid', gridTemplateColumns:'1fr 1.5fr', gap:'24px'}}>
              <div className="card" style={{height:'fit-content'}}>
                <h3>New Form Section</h3>
                <div style={{display:'flex', flexDirection:'column', gap:'16px'}}>
                    <div>
                        <label className="input-label">Requirement Description</label>
                        <textarea className="input-field" style={{minHeight:'80px'}} value={newQ.text} onChange={e => setNewQ({...newQ, text: e.target.value})} placeholder="Ex: Are beverage fountain nozzles clean and sanitized?" />
                    </div>
                    <div>
                        <label className="input-label">Answer Type</label>
                        <select className="input-field" value={newQ.type} onChange={e => setNewQ({...newQ, type: e.target.value})}>
                            <option value="yesno">Yes / No / N.A (Compliance)</option>
                            <option value="text">Text Entry (Open Observation)</option>
                            <option value="radio">Custom Multiple Choice</option>
                        </select>
                    </div>
                    {newQ.type === 'radio' && (
                        <div>
                            <label className="input-label">Choices (Comma Separated)</label>
                            <input className="input-field" placeholder="Good, Average, Poor" value={newQ.options} onChange={e => setNewQ({...newQ, options: e.target.value})} />
                        </div>
                    )}
                    <button className="nav-btn primary w-full" style={{justifyContent:'center'}} onClick={async () => {
                       if(!newQ.text) return;
                       await addDoc(collection(db, "checklist_questions"), { 
                           ...newQ, 
                           order: questions.length,
                           createdAt: serverTimestamp() 
                        });
                       setNewQ({text:"", type:"yesno", options:""});
                       showMessage("Question added to audit form");
                    }}>Append to Form</button>
                </div>
              </div>

              <div className="card shadow-inner">
                <div style={{display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:'20px'}}>
                    <h3>Live Form Order</h3>
                    <span className="stat-label" style={{fontSize:'0.7rem'}}>{questions.length} Active Items</span>
                </div>
                {questions.map((q, idx) => (
                  <div key={q.id} className="question-editor-item">
                    <div style={{display:'flex', gap:'15px', alignItems:'center'}}>
                        <div style={{display:'flex', flexDirection:'column', gap:'4px', color:'var(--text-secondary)'}}>
                           <button className="cursor-pointer hover:text-white" onClick={() => idx > 0 && updateDoc(doc(db, "checklist_questions", q.id), {order: idx-1}) && updateDoc(doc(db, "checklist_questions", questions[idx-1].id), {order: idx})}><ChevronUp size={18}/></button>
                           <button className="cursor-pointer hover:text-white" onClick={() => idx < questions.length - 1 && updateDoc(doc(db, "checklist_questions", q.id), {order: idx+1}) && updateDoc(doc(db, "checklist_questions", questions[idx+1].id), {order: idx})}><ChevronDown size={18}/></button>
                        </div>
                        <div style={{flex:1}}>
                           <div style={{display:'flex', justifyContent:'space-between'}}>
                                <span style={{fontSize:'0.95rem', fontWeight:600}}>{q.text}</span>
                                <button className="nav-btn danger" style={{padding:'6px', background:'none', border:'none'}} onClick={() => window.confirm("Remove question?") && deleteDoc(doc(db, "checklist_questions", q.id))}><Trash2 size={16}/></button>
                           </div>
                           <div style={{fontSize:'0.7rem', color:'var(--accent-cyan)', marginTop:'6px', textTransform:'uppercase', fontWeight:700}}>
                               {q.type} {q.options && `[${q.options}]`}
                           </div>
                        </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {selectedReport && (
        <div className="modal-overlay" onClick={() => setSelectedReport(null)}>
          <div className="modal-content" onClick={e => e.stopPropagation()}>
            <button style={{position:'absolute', top:'20px', right:'20px', background:'none', border:'none', color:'white', cursor:'pointer'}} onClick={() => setSelectedReport(null)}><X size={24}/></button>
            <div style={{display:'flex', justifyContent:'space-between', alignItems:'start', marginBottom:'30px'}}>
              <div>
                <h2 style={{margin:0, color:'var(--accent-orange)'}}>Store #{selectedReport.store}</h2>
                <div style={{marginTop:'8px', display:'flex', gap:'15px', opacity:0.7, fontSize:'0.9rem'}}>
                    <span style={{display:'flex', gap:'6px', alignItems:'center'}}><UserIcon size={14}/> {selectedReport.name}</span>
                    <span style={{display:'flex', gap:'6px', alignItems:'center'}}><Calendar size={14}/> {formatDateTime(selectedReport.createdAt)}</span>
                </div>
              </div>
              <div style={{textAlign:'right'}}>
                <div style={{fontSize:'2.5rem', fontWeight:900, color:'var(--accent-cyan)'}}>{Math.round((selectedReport.yesCount/selectedReport.totalQuestions)*100)}%</div>
              </div>
            </div>
            <div style={{display:'grid', gap:'12px'}}>
              {Object.entries(selectedReport.answers).map(([q, a], idx) => (
                <div key={idx} style={{padding:'16px', background:'rgba(255,255,255,0.03)', borderRadius:'16px', display:'flex', justifyContent:'space-between', alignItems:'center', border:'1px solid rgba(255,255,255,0.05)'}}>
                  <span style={{opacity:0.9, fontSize:'0.95rem', flex:1}}>{q}</span>
                  <span style={{
                      fontWeight:900, 
                      padding:'6px 14px', 
                      borderRadius:'10px', 
                      fontSize:'0.8rem',
                      background: a === 'No' ? 'var(--danger)' : a === 'Yes' ? 'var(--success)' : 'rgba(255,255,255,0.1)',
                      color: a === 'Yes' ? 'var(--bg)' : 'white'
                  }}>{a}</span>
                </div>
              ))}
              {selectedReport.notes && (
                  <div style={{marginTop:'20px', padding:'25px', background:'rgba(255,159,28,0.1)', borderRadius:'20px', border:'1px dashed var(--accent-orange)'}}>
                      <div style={{display:'flex', gap:'10px', alignItems:'center', color:'var(--accent-orange)', marginBottom:'10px'}}>
                          <AlertTriangle size={18}/>
                          <span style={{fontWeight:800, fontSize:'0.9rem'}}>AUDITOR REMARKS</span>
                      </div>
                      <p style={{margin:0, fontSize:'1rem', lineHeight:'1.5'}}>{selectedReport.notes}</p>
                  </div>
              )}
            </div>
            <div style={{marginTop:'40px', display:'flex', gap:'15px'}}>
                <button className="nav-btn primary w-full" style={{padding:'18px', justifyContent:'center'}} onClick={() => exportPDF(selectedReport)}>Download Official PDF</button>
                <button className="nav-btn w-full" style={{padding:'18px', justifyContent:'center'}} onClick={() => setSelectedReport(null)}>Close</button>
            </div>
          </div>
        </div>
      )}

      <footer style={{marginTop:'50px', padding:'40px', textAlign:'center', borderTop:'1px solid rgba(255,255,255,0.05)', opacity:0.5, fontSize:'0.85rem'}}>
        &copy; Muhammad Azeem | muhammad.azeem@circlek.com
      </footer>
    </div>
  );
}