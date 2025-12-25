import React, { useEffect, useState, useMemo } from "react";
import {
  ClipboardCheck, LayoutDashboard, LogIn, LogOut, Loader2, Trash2,
  Eye, CircleDot, Download, Camera, User as UserIcon, Clock, 
  CheckCircle2, ShieldCheck, BarChart3, QrCode, X, PlusCircle, Settings, 
  Trash, Layers, TrendingUp, AlertTriangle, ChevronRight, FileText
} from "lucide-react";

import { initializeApp } from "firebase/app";
import {
  getAuth, signInWithEmailAndPassword, signOut, onAuthStateChanged,
  createUserWithEmailAndPassword,
} from "firebase/auth";
import {
  getFirestore, collection, addDoc, deleteDoc, doc, onSnapshot,
  serverTimestamp, getDoc, setDoc, query, orderBy, where, updateDoc
} from "firebase/firestore";

import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

/* ================= FIREBASE CONFIG ================= */
const firebaseConfig = {
  apiKey: "AIzaSyDKPGiRE-5kMDR6sCPxGpcfUJVpn7a4lC0",
  authDomain: "ecosure.firebaseapp.com",
  projectId: "ecosure",
  storageBucket: "ecosure.firebasestorage.app",
  messagingSenderId: "847577390936",
  appId: "1:847577390936:web:d8a00ef67ef21ce98a8f2d",
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

/* ================= STYLES ================= */
const CustomStyles = () => (
  <style>{`
    @import url("https://fonts.googleapis.com/css2?family=Josefin+Sans:wght@300;400;600;700&display=swap");
    :root {
      --bg: #0b0e14; --card: #151921; --accent: #4cc9f0; --orange: #ff9f1c;
      --text: #e0e1dd; --muted: #778da9; --success: #00ff9c; --danger: #ff4d4f; --warning: #ffbe0b;
      --border: rgba(255,255,255,0.08);
    }
    * { box-sizing: border-box; transition: 0.25s ease; }
    body { margin: 0; font-family: "Josefin Sans", sans-serif; background: var(--bg); color: var(--text); overflow-x: hidden; }
    .container { max-width: 1250px; margin: 0 auto; padding: 20px; min-height: 100vh; }
    
    .header { display: flex; justify-content: space-between; align-items: center; background: var(--card); padding: 15px 30px; border-radius: 20px; margin-bottom: 30px; border: 1px solid var(--border); position: sticky; top: 15px; z-index: 1000; box-shadow: 0 10px 30px rgba(0,0,0,0.5); }
    
    .btn { padding: 12px 22px; border-radius: 12px; border: none; cursor: pointer; display: flex; align-items: center; gap: 8px; font-weight: 700; font-family: inherit; font-size: 0.85rem; }
    .btn-primary { background: var(--accent); color: #000; }
    .btn-ghost { background: rgba(255,255,255,0.04); color: white; border: 1px solid transparent; }
    .btn-ghost:hover { background: rgba(255,255,255,0.08); border-color: var(--accent); }
    .btn-active { background: var(--accent); color: #000; }
    .btn-danger { background: rgba(255, 77, 79, 0.1); color: var(--danger); border: 1px solid var(--danger); }
    
    .card { background: var(--card); padding: 25px; border-radius: 24px; border: 1px solid var(--border); margin-bottom: 25px; position: relative; overflow: hidden; }
    .input { width: 100%; padding: 15px; border-radius: 12px; border: 1px solid var(--border); background: #000; color: white; margin-bottom: 15px; outline: none; font-family: inherit; }
    .input:focus { border-color: var(--accent); box-shadow: 0 0 10px rgba(76, 201, 240, 0.2); }
    
    .status-yes { background: var(--success) !important; color: #000 !important; font-weight: 800; }
    .status-no { background: var(--danger) !important; color: #fff !important; font-weight: 800; }
    .status-na { background: var(--warning) !important; color: #000 !important; font-weight: 800; }
    
    .tab-bar { display: flex; gap: 15px; border-bottom: 1px solid var(--border); margin-bottom: 30px; overflow-x: auto; padding-bottom: 5px; }
    .tab-item { padding: 12px 20px; cursor: pointer; color: var(--muted); font-weight: 700; white-space: nowrap; border-radius: 10px 10px 0 0; }
    .tab-item.active { color: var(--accent); background: rgba(76, 201, 240, 0.05); border-bottom: 3px solid var(--accent); }

    .modal { position: fixed; inset: 0; background: rgba(0,0,0,0.9); backdrop-filter: blur(10px); z-index: 2000; display: flex; align-items: center; justify-content: center; padding: 20px; }
    .modal-content { background: var(--card); width: 100%; max-width: 800px; border-radius: 28px; padding: 35px; max-height: 85vh; overflow-y: auto; border: 1px solid var(--border); box-shadow: 0 20px 60px rgba(0,0,0,0.6); }
    
    .stat-card { text-align: center; padding: 25px; border-radius: 20px; background: rgba(255,255,255,0.02); border: 1px solid var(--border); }
    .stat-val { font-size: 2.2rem; font-weight: 800; margin: 10px 0; color: var(--accent); }
    
    table { width: 100%; border-collapse: collapse; }
    th { text-align: left; padding: 15px; color: var(--muted); font-size: 0.75rem; text-transform: uppercase; border-bottom: 1px solid var(--border); }
    td { padding: 15px; border-bottom: 1px solid rgba(255,255,255,0.03); }

    .qr-container { background: #fff; padding: 20px; border-radius: 20px; display: inline-block; box-shadow: 0 10px 30px rgba(0,0,0,0.2); }
    .progress-dots { display: flex; gap: 8px; justify-content: center; margin-bottom: 20px; }
    .dot { width: 10px; height: 10px; border-radius: 50%; background: var(--border); }
    .dot.active { background: var(--accent); box-shadow: 0 0 10px var(--accent); }

    .inline-msg { padding: 12px; border-radius: 12px; margin-bottom: 15px; font-weight: 600; font-size: 0.9rem; text-align: center; border: 1px solid transparent; }
    .msg-success { background: rgba(0, 255, 156, 0.1); color: var(--success); border-color: rgba(0, 255, 156, 0.2); }
    .msg-error { background: rgba(255, 77, 79, 0.1); color: var(--danger); border-color: rgba(255, 77, 79, 0.2); }
  `}</style>
);

export default function EcoSurePro() {
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [view, setView] = useState("form");
  const [activeTab, setActiveTab] = useState("reports");
  const [loading, setLoading] = useState(true);
  
  // Inline Message State
  const [status, setStatus] = useState({ msg: "", type: "" });

  // Data States
  const [questions, setQuestions] = useState([]);
  const [reports, setReports] = useState([]);
  const [usersList, setUsersList] = useState([]);
  
  // Form States
  const [audit, setAudit] = useState({ name: "", store: "", answers: {}, photos: {} });
  const [step, setStep] = useState(0);
  const [selectedReport, setSelectedReport] = useState(null);
  const [loginForm, setLoginForm] = useState({ email: "", pass: "" });

  // Admin Tool States
  const [newQ, setNewQ] = useState({ text: "", section: "", type: "Yes/No/NA", options: "" });
  const [newUser, setNewUser] = useState({ email: "", pass: "", store: "" });
  const [qrId, setQrId] = useState("");

  /* --- AUTO-CLEAR MESSAGES --- */
  useEffect(() => {
    if (status.msg) {
      const timer = setTimeout(() => setStatus({ msg: "", type: "" }), 5000);
      return () => clearTimeout(timer);
    }
  }, [status]);

  /* --- INLINE MESSAGE COMPONENT --- */
  const StatusBox = () => {
    if (!status.msg) return null;
    return (
      <div className={`inline-msg ${status.type === 'error' ? 'msg-error' : 'msg-success'}`}>
        {status.msg}
      </div>
    );
  };

  /* --- AUTH & INITIALIZATION --- */
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const storeFromUrl = params.get('store');
    if (storeFromUrl) setAudit(prev => ({ ...prev, store: storeFromUrl }));

    return onAuthStateChanged(auth, async (u) => {
      if (u) {
        setUser(u);
        const snap = await getDoc(doc(db, "admins", u.uid));
        if (snap.exists()) setProfile(snap.data());
      } else {
        setUser(null); setProfile(null); setView("form");
      }
      setLoading(false);
    });
  }, []);

  /* --- REAL-TIME DATA SYNC --- */
  useEffect(() => {
    onSnapshot(query(collection(db, "checklist_questions"), orderBy("section", "asc")), s => 
      setQuestions(s.docs.map(d => ({ id: d.id, ...d.data() }))));
    onSnapshot(collection(db, "admins"), s => 
      setUsersList(s.docs.map(d => ({ id: d.id, ...d.data() }))));
  }, []);

  useEffect(() => {
    if (!user || !profile) return;
    let qR;
    const isSuper = profile.role === "super" || profile.assignedStore === "All";
    if (isSuper) {
      qR = query(collection(db, "store_checklists"), orderBy("createdAt", "desc"));
    } else {
      qR = query(collection(db, "store_checklists"), where("store", "==", profile.assignedStore), orderBy("createdAt", "desc"));
    }
    const unsubscribe = onSnapshot(qR, (snapshot) => {
      setReports(snapshot.docs.map(d => ({ id: d.id, ...d.data() })));
    }, (err) => {
      setStatus({ msg: "Fetch Error: Check Indexing", type: "error" });
    });
    return () => unsubscribe();
  }, [user, profile]);

  /* --- ANALYTICS CALCULATIONS --- */
  const stats = useMemo(() => {
    if (reports.length === 0) return { total: 0, compliance: 0, violations: 0 };
    const total = reports.length;
    let totalNo = 0;
    reports.forEach(r => {
      totalNo += Object.values(r.answers).filter(v => v === "No").length;
    });
    const passing = reports.filter(r => !Object.values(r.answers).includes("No")).length;
    return { total, compliance: Math.round((passing / total) * 100), violations: totalNo };
  }, [reports]);

  /* --- SECTION MAPPING --- */
  const sections = useMemo(() => {
    const groups = questions.reduce((acc, q) => {
      const s = q.section || "General Ops";
      if (!acc[s]) acc[s] = [];
      acc[s].push(q);
      return acc;
    }, {});
    return Object.entries(groups);
  }, [questions]);

  /* --- PDF GENERATOR --- */
  const generatePDF = async (r) => {
    try {
      const docP = new jsPDF();
      docP.setFillColor(21, 25, 33); 
      docP.rect(0, 0, 210, 50, 'F');
      docP.setTextColor(76, 201, 240); 
      docP.setFontSize(24); 
      docP.text("CKSURE AUDIT", 15, 25);
      docP.setTextColor(255, 255, 255); 
      docP.setFontSize(10);
      docP.text(`STORE NUMBER: ${r.store}`, 15, 35);
      docP.text(`INSPECTOR NAME: ${r.name}`, 15, 41);
      const timestamp = r.createdAt?.toDate ? r.createdAt.toDate().toLocaleString() : new Date().toLocaleString();
      docP.text(`DATE & TIME: ${timestamp}`, 15, 47);
      const tableData = Object.entries(r.answers).map(([q, a]) => [q, a]);
      autoTable(docP, {
        startY: 60,
        head: [['Question Detail', 'Status']],
        body: tableData,
        theme: 'striped',
        headStyles: { fillColor: [76, 201, 240], textColor: 0 },
        styles: { font: "helvetica", fontSize: 9, cellPadding: 3 },
      });
      if (r.photos && Object.keys(r.photos).length > 0) {
        docP.addPage();
        docP.setTextColor(0, 0, 0);
        docP.setFontSize(14);
        docP.text("EVIDENCE & VIOLATION PHOTOS", 15, 20);
        let yPos = 30;
        Object.entries(r.photos).forEach(([q, imgData]) => {
          if (yPos > 240) { docP.addPage(); yPos = 20; }
          docP.setFontSize(8);
          docP.text(`Section: ${q}`, 15, yPos);
          docP.addImage(imgData, 'JPEG', 15, yPos + 5, 50, 40);
          yPos += 55;
        });
      }
      docP.save(`CKSure_Store_${r.store}.pdf`);
    } catch (err) {
      setStatus({ msg: "PDF Error: Check Console", type: "error" });
    }
  };

  if (loading) return <div style={{height:'100vh', display:'flex', alignItems:'center', justifyContent:'center', background:'#000'}}><Loader2 className="animate-spin" color="#4cc9f0" size={50}/></div>;

  return (
    <div className="container">
      <CustomStyles />
      
      {/* NAVIGATION HEADER */}
      <header className="header">
        <div style={{display:'flex', alignItems:'center', gap:'12px', fontSize:'1.6rem', fontWeight:800}}>
          <CircleDot color="var(--accent)" size={32}/> CKSURE <span style={{color:'var(--orange)'}}>OS</span>
        </div>
        <div style={{display:'flex', gap:'10px'}}>
          <button className={`btn btn-ghost ${view === "form" ? "btn-active" : ""}`} onClick={() => setView("form")}><ClipboardCheck size={18}/> Audit Form</button>
          {!user ? (
            <button className={`btn btn-ghost ${view === "login" ? "btn-active" : ""}`} onClick={() => setView("login")}><LogIn size={18}/> Admin Login</button>
          ) : (
            <>
              <button className={`btn btn-ghost ${view === "admin" ? "btn-active" : ""}`} onClick={() => setView("admin")}><LayoutDashboard size={18}/> Dashboard</button>
              <button className="btn btn-danger" onClick={() => signOut(auth)}><LogOut size={18}/></button>
            </>
          )}
        </div>
      </header>

      {/* VIEW: AUDIT FORM */}
      {view === "form" && (
        <div style={{maxWidth:700, margin:'0 auto'}}>
          {step === 0 ? (
            <div className="card">
              <h2 style={{textAlign:'center', marginBottom:30}}>Start New Inspection</h2>
              <StatusBox />
              <label style={{fontSize:'0.8rem', color:'var(--muted)'}}>INSPECTOR FULL NAME</label>
              <input className="input" placeholder="e.g. John Doe" value={audit.name} onChange={e => setAudit({...audit, name: e.target.value})} />
              <label style={{fontSize:'0.8rem', color:'var(--muted)'}}>7-DIGIT STORE NUMBER</label>
              <input className="input" placeholder="0000000" maxLength={7} value={audit.store} onChange={e => setAudit({...audit, store: e.target.value})} />
              <button className="btn btn-primary" style={{width:'100%', padding:18, marginTop:10}} disabled={!audit.name || audit.store.length < 5} onClick={() => setStep(1)}>Initialize & Start</button>
            </div>
          ) : step <= sections.length ? (
            <div className="card">
              <div className="progress-dots">
                {sections.map((_, i) => <div key={i} className={`dot ${i + 1 === step ? 'active' : ''}`} />)}
              </div>
              <div style={{display:'flex', justifyContent:'space-between', marginBottom:25}}>
                <h2 style={{margin:0, color:'var(--accent)'}}>{sections[step-1][0]}</h2>
                <span style={{color:'var(--muted)', fontSize:'0.8rem'}}>SECTION {step} OF {sections.length}</span>
              </div>

              {sections[step-1][1].map(q => (
                <div key={q.id} style={{marginBottom:35, borderBottom:'1px solid var(--border)', paddingBottom:25}}>
                  <p style={{fontWeight:600, fontSize:'1.1rem', marginBottom:18}}>{q.text} <span style={{color:'var(--danger)'}}>*</span></p>
                  
                  {q.type === "Yes/No/NA" && (
                    <div style={{display:'flex', gap:10}}>
                      {['Yes', 'No', 'N/A'].map(o => (
                        <button key={o} style={{flex:1, padding:15}} 
                        className={`btn btn-ghost ${audit.answers[q.text] === o ? `status-${o.toLowerCase().replace('/','')}` : ''}`} 
                        onClick={() => setAudit({...audit, answers: {...audit.answers, [q.text]: o}})}>{o}</button>
                      ))}
                    </div>
                  )}

                  {q.type === "Radio MCQ" && (
                    <div style={{display:'grid', gap:10}}>
                      {q.options?.split(',').map(opt => (
                        <button key={opt} className={`btn btn-ghost ${audit.answers[q.text] === opt.trim() ? 'btn-active' : ''}`}
                        onClick={() => setAudit({...audit, answers: {...audit.answers, [q.text]: opt.trim()}})}>{opt.trim()}</button>
                      ))}
                    </div>
                  )}

                  {q.type === "Text Input" && (
                    <input className="input" placeholder="Type observation..." value={audit.answers[q.text] || ""} onChange={e => setAudit({...audit, answers: {...audit.answers, [q.text]: e.target.value}})} />
                  )}

                  {audit.answers[q.text] === "No" && (
                    <div style={{marginTop:15, padding:20, border:'2px dashed var(--danger)', borderRadius:15, textAlign:'center'}}>
                      <Camera color="var(--danger)" style={{marginBottom:10}}/>
                      <p style={{fontSize:'0.8rem', color:'var(--danger)', fontWeight:700}}>VIOLATION PHOTO REQUIRED</p>
                      <input type="file" accept="image/*" capture="environment" onChange={e => {
                        const reader = new FileReader();
                        reader.onload = () => setAudit({...audit, photos: {...audit.photos, [q.text]: reader.result}});
                        if(e.target.files[0]) reader.readAsDataURL(e.target.files[0]);
                      }} />
                      {audit.photos[q.text] && <p style={{color:'var(--success)', marginTop:10}}>✓ Image Attached</p>}
                    </div>
                  )}
                </div>
              ))}

              <div style={{display:'flex', gap:15}}>
                <button className="btn btn-ghost" onClick={() => setStep(step - 1)}>Previous</button>
                <button className="btn btn-primary" style={{flex:1}} 
                  disabled={!audit.name || !audit.store}
                  onClick={() => setStep(step + 1)}>Save & Continue</button>
              </div>
            </div>
          ) : (
            <div className="card" style={{textAlign:'center', padding:'50px 20px'}}>
              <CheckCircle2 size={80} color="var(--success)" style={{marginBottom:20}}/>
              <h1>Audit Complete</h1>
              <StatusBox />
              <p style={{color:'var(--muted)', marginBottom:30}}>All sections verified and mandatory photos uploaded.</p>
              <button className="btn btn-primary" style={{width:'100%', padding:20, fontSize:'1.1rem'}} onClick={async () => {
                try {
                  setStatus({ msg: "Transmitting report...", type: "success" });
                  await addDoc(collection(db, "store_checklists"), { ...audit, createdAt: serverTimestamp() });
                  setStatus({ msg: "Report Transmitted Successfully!", type: "success" });
                  setTimeout(() => window.location.reload(), 2000);
                } catch (e) {
                  setStatus({ msg: "Failed to send report.", type: "error" });
                }
              }}>Certify & Submit Report</button>
            </div>
          )}
        </div>
      )}

      {/* VIEW: ADMIN LOGIN */}
      {view === "login" && !user && (
        <div className="card" style={{maxWidth:400, margin:'100px auto'}}>
          <h2 style={{textAlign:'center'}}>Secure Access</h2>
          <StatusBox />
          <input className="input" placeholder="Admin Email" onChange={e => setLoginForm({...loginForm, email: e.target.value})} />
          <input className="input" type="password" placeholder="Password" onChange={e => setLoginForm({...loginForm, pass: e.target.value})} />
          <button className="btn btn-primary" style={{width:'100%', padding:15}} onClick={() => {
            signInWithEmailAndPassword(auth, loginForm.email, loginForm.pass)
            .then(() => setView("admin"))
            .catch(() => setStatus({ msg: "Invalid Credentials", type: "error" }));
          }}>Sign In</button>
        </div>
      )}

      {/* VIEW: ADMIN DASHBOARD */}
      {view === "admin" && user && (
        <>
          <div style={{display:'grid', gridTemplateColumns:'repeat(auto-fit, minmax(250px, 1fr))', gap:20, marginBottom:30}}>
            <div className="stat-card"><TrendingUp color="var(--accent)"/> <div className="stat-val">{stats.total}</div> <div style={{color:'var(--muted)'}}>Total Audits</div></div>
            <div className="stat-card"><ShieldCheck color="var(--success)"/> <div className="stat-val">{stats.compliance}%</div> <div style={{color:'var(--muted)'}}>Compliance Score</div></div>
            <div className="stat-card"><AlertTriangle color="var(--danger)"/> <div className="stat-val">{stats.violations}</div> <div style={{color:'var(--muted)'}}>Critical Violations</div></div>
          </div>

          <div className="tab-bar">
            <div className={`tab-item ${activeTab === "reports" ? "active" : ""}`} onClick={() => setActiveTab("reports")}>Report Viewer</div>
            {profile?.role === "super" && (
              <>
                <div className={`tab-item ${activeTab === "staff" ? "active" : ""}`} onClick={() => setActiveTab("staff")}>Team Management</div>
                <div className={`tab-item ${activeTab === "setup" ? "active" : ""}`} onClick={() => setActiveTab("setup")}>Checklist Builder</div>
                <div className={`tab-item ${activeTab === "qr" ? "active" : ""}`} onClick={() => setActiveTab("qr")}>QR Engine</div>
              </>
            )}
          </div>
          
          <StatusBox />

          {activeTab === "reports" && (
            <div style={{display:'grid', gridTemplateColumns:'repeat(auto-fill, minmax(360px, 1fr))', gap:25}}>
              {reports.length === 0 ? (
                <div className="card" style={{gridColumn:'1/-1', textAlign:'center', color:'var(--muted)'}}>No reports found.</div>
              ) : (
                reports.map(r => (
                  <div key={r.id} className="card" style={{padding:20, borderLeft:'4px solid var(--accent)'}}>
                    <div style={{display:'flex', justifyContent:'space-between', alignItems:'flex-start', marginBottom:15}}>
                      <div>
                        <div style={{fontSize:'0.7rem', color:'var(--accent)', fontWeight:800, letterSpacing:1}}>OFFICIAL RECORD</div>
                        <div style={{fontSize:'1.4rem', fontWeight:800}}>STORE #{r.store}</div>
                      </div>
                      <div style={{textAlign:'right'}}>
                        <div style={{fontSize:'0.8rem', fontWeight:600}}>{r.createdAt?.toDate().toLocaleDateString()}</div>
                        <div style={{fontSize:'0.7rem', color:'var(--muted)'}}>{r.createdAt?.toDate().toLocaleTimeString()}</div>
                      </div>
                    </div>
                    <div style={{background:'rgba(255,255,255,0.03)', padding:12, borderRadius:12, marginBottom:20}}>
                      <div style={{display:'flex', alignItems:'center', gap:10, fontSize:'0.9rem'}}>
                        <UserIcon size={16} color="var(--accent)"/><span style={{fontWeight:600}}>{r.name || "Unknown"}</span>
                      </div>
                    </div>
                    <div style={{display:'flex', gap:10}}>
                      <button className="btn btn-primary" style={{flex:2}} onClick={() => setSelectedReport(r)}><Eye size={16}/> View</button>
                      <button className="btn btn-ghost" style={{flex:1}} onClick={() => generatePDF(r)}><Download size={16}/></button>
                      {profile?.role === "super" && (
                        <button className="btn btn-danger" onClick={async () => {
                          if(window.confirm("Delete record?")) {
                            await deleteDoc(doc(db, "store_checklists", r.id));
                            setStatus({ msg: "Report Deleted", type: "success" });
                          }
                        }}><Trash2 size={16}/></button>
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>
          )}

          {activeTab === "staff" && (
            <div style={{display:'grid', gridTemplateColumns:'1fr 1.5fr', gap:30}}>
              <div className="card">
                <h3>Add New Member</h3>
                <input className="input" placeholder="User Email" onChange={e => setNewUser({...newUser, email: e.target.value})} />
                <input className="input" placeholder="Store # (or 'All')" onChange={e => setNewUser({...newUser, store: e.target.value})} />
                <input className="input" type="password" placeholder="Password" onChange={e => setNewUser({...newUser, pass: e.target.value})} />
                <button className="btn btn-primary" style={{width:'100%'}} onClick={async () => {
                   try {
                     const res = await createUserWithEmailAndPassword(auth, newUser.email, newUser.pass);
                     await setDoc(doc(db, "admins", res.user.uid), { email: newUser.email, assignedStore: newUser.store, role: newUser.store === "All" ? "super" : "viewer" });
                     setStatus({ msg: "Member Deployed", type: "success" });
                   } catch (e) { setStatus({ msg: e.message, type: "error" }); }
                }}>Deploy Member</button>
              </div>
              <div className="card">
                <h3>System Users</h3>
                <table>
                  <thead><tr><th>Email</th><th>Store</th><th>Action</th></tr></thead>
                  <tbody>{usersList.map(u => (
                    <tr key={u.id}><td>{u.email}</td><td>{u.assignedStore}</td><td><Trash color="var(--danger)" size={16} onClick={async () => { await deleteDoc(doc(db, "admins", u.id)); setStatus({msg:"User Removed", type:"success"}); }}/></td></tr>
                  ))}</tbody>
                </table>
              </div>
            </div>
          )}

          {activeTab === "setup" && (
            <div style={{display:'grid', gridTemplateColumns:'1fr 1.5fr', gap:30}}>
              <div className="card">
                <h3>Question Architect</h3>
                <input className="input" placeholder="Section Name" value={newQ.section} onChange={e => setNewQ({...newQ, section: e.target.value})} />
                <textarea className="input" placeholder="Question Text" value={newQ.text} onChange={e => setNewQ({...newQ, text: e.target.value})} />
                <select className="input" value={newQ.type} onChange={e => setNewQ({...newQ, type: e.target.value})}>
                  <option>Yes/No/NA</option><option>Radio MCQ</option><option>Text Input</option>
                </select>
                {newQ.type === "Radio MCQ" && <input className="input" placeholder="Options (comma separated)" onChange={e => setNewQ({...newQ, options: e.target.value})} />}
                <button className="btn btn-primary" style={{width:'100%'}} onClick={async () => { 
                   await addDoc(collection(db, "checklist_questions"), newQ); 
                   setNewQ({text:"", section:"", type:"Yes/No/NA"}); 
                   setStatus({msg:"Question Published", type:"success"});
                }}>Publish Question</button>
              </div>
              <div className="card">
                {sections.map(([sec, qs]) => (
                  <div key={sec} style={{marginBottom:20}}>
                    <h4 style={{color:'var(--accent)', borderBottom:'1px solid var(--border)', paddingBottom:5}}>{sec}</h4>
                    {qs.map(q => (
                      <div key={q.id} style={{display:'flex', justifyContent:'space-between', padding:10, background:'rgba(0,0,0,0.2)', marginBottom:5, borderRadius:10}}>
                        <span style={{fontSize:'0.85rem'}}>{q.text}</span>
                        <Trash size={14} color="var(--danger)" onClick={async () => { await deleteDoc(doc(db, "checklist_questions", q.id)); setStatus({msg:"Question Removed", type:"success"}); }}/>
                      </div>
                    ))}
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === "qr" && (
            <div className="card" style={{textAlign:'center'}}>
              <h2>Store QR Portal</h2>
              <input className="input" style={{maxWidth:300, textAlign:'center'}} placeholder="Enter Store Number" onChange={e => setQrId(e.target.value)} />
              {qrId.length > 3 && (
                <div style={{marginTop:20}}>
                  <div className="qr-container">
                    <img src={`https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(window.location.origin + "?store=" + qrId)}`} alt="QR" />
                  </div>
                  <h3 style={{color:'var(--accent)'}}>STORE {qrId}</h3>
                  <button className="btn btn-ghost" style={{margin:'10px auto'}} onClick={() => window.print()}>Print Code</button>
                </div>
              )}
            </div>
          )}
        </>
      )}

      {/* REPORT MODAL */}
      {selectedReport && (
        <div className="modal" onClick={() => setSelectedReport(null)}>
          <div className="modal-content" onClick={e => e.stopPropagation()}>
            <div style={{display:'flex', justifyContent:'space-between', borderBottom:'1px solid var(--border)', paddingBottom:20, marginBottom:20}}>
              <div>
                <h2 style={{margin:0}}>Store Audit Report</h2>
                <p style={{color:'var(--muted)', margin:0}}>Inspector: {selectedReport.name} | Store #{selectedReport.store}</p>
                <p style={{color:'var(--muted)', fontSize:'0.8rem'}}>{selectedReport.createdAt?.toDate().toLocaleString()}</p>
              </div>
              <X onClick={() => setSelectedReport(null)} style={{cursor:'pointer'}}/>
            </div>
            <div style={{display:'grid', gap:15}}>
              {Object.entries(selectedReport.answers).map(([q, a]) => (
                <div key={q} style={{padding:15, background:'rgba(255,255,255,0.02)', borderRadius:15, border:'1px solid var(--border)'}}>
                  <div style={{fontSize:'0.75rem', color:'var(--muted)', textTransform:'uppercase'}}>{q}</div>
                  <div style={{fontSize:'1.1rem', fontWeight:700, marginTop:5, color: a === "No" ? 'var(--danger)' : a === "Yes" ? 'var(--success)' : 'white'}}>{a}</div>
                  {selectedReport.photos?.[q] && (
                    <img src={selectedReport.photos[q]} style={{width:'100%', borderRadius:15, marginTop:15, border:'2px solid var(--danger)'}} />
                  )}
                </div>
              ))}
            </div>
            <button className="btn btn-primary" style={{width:'100%', marginTop:30, padding:20}} onClick={() => generatePDF(selectedReport)}>
              <FileText size={20}/> Download Official PDF
            </button>
          </div>
        </div>
      )}
    </div>
  );
}