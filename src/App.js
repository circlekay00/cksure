import React, { useEffect, useState, useMemo } from "react";
import {
  ClipboardCheck,
  LayoutDashboard,
  LogIn,
  LogOut,
  Loader2,
  Trash2,
  Eye,
  X,
  CircleDot,
  Download,
  Lock,
  Calendar,
  PlusCircle,
  TrendingUp,
  AlertCircle,
  Trophy,
  AlertTriangle,
  BarChart3
} from "lucide-react";

import { initializeApp } from "firebase/app";
import {
  getAuth,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
} from "firebase/auth";
import {
  getFirestore,
  collection,
  addDoc,
  deleteDoc,
  doc,
  onSnapshot,
  serverTimestamp,
  getDoc,
  query,
  orderBy
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
    * { box-sizing: border-box; transition: all 0.2s ease; }
    body { margin: 0; font-family: "Josefin Sans", sans-serif; background-color: var(--bg); color: var(--text-primary); }
    .app-container { max-width: 1400px; margin: 0 auto; padding: 16px; min-height: 100vh; }
    .header {
      display: flex; justify-content: space-between; align-items: center; margin-bottom: 24px;
      background: rgba(27, 38, 59, 0.9); backdrop-filter: blur(10px); padding: 15px 25px;
      border-radius: 20px; border: 1px solid rgba(255, 255, 255, 0.1); position: sticky; top: 10px; z-index: 1000;
    }
    .nav-btn {
      padding: 10px 18px; border-radius: 12px; border: 1px solid rgba(255,255,255,0.1);
      background: rgba(65, 90, 119, 0.3); color: white; cursor: pointer; font-weight: 600;
      display: flex; align-items: center; gap: 8px; font-family: inherit;
    }
    .nav-btn.active { background: var(--accent-cyan); color: var(--bg); border-color: var(--accent-cyan); }
    .nav-btn.tab-active { color: var(--success); border-bottom: 3px solid var(--success); border-radius: 0; background: transparent; border-top:none; border-left:none; border-right:none; }
    .nav-btn.primary { background: var(--success); color: var(--bg); border: none; }
    .nav-btn.danger-outline { background: rgba(255, 77, 79, 0.1); color: var(--danger); border: 1px solid var(--danger); }

    .card { background: var(--card); padding: 24px; border-radius: 24px; border: 1px solid rgba(255,255,255,0.05); margin-bottom: 24px; }
    .stat-card { background: rgba(13, 27, 42, 0.5); padding: 20px; border-radius: 20px; border-left: 4px solid var(--accent-cyan); }
    
    .input-field {
      width: 100%; padding: 14px; border-radius: 12px; border: 2px solid rgba(255,255,255,0.1);
      background: rgba(13, 27, 42, 0.6); color: white; outline: none; font-family: inherit;
    }
    .opt-btn { flex: 1; padding: 12px; border-radius: 10px; border: none; cursor: pointer; font-weight: 700; background: #0d1b2a; color: white; }
    .active-yes { background: var(--success) !important; color: #0d1b2a !important; }
    .active-no { background: var(--danger) !important; color: white !important; }
    .active-selected { background: var(--accent-cyan) !important; color: #0d1b2a !important; }
    
    .modal-overlay { position: fixed; inset: 0; background: rgba(0,0,0,0.9); display: flex; align-items: center; justify-content: center; z-index: 2000; padding: 20px; }
    .modal-content { background: var(--card); width: 100%; max-width: 850px; max-height: 90vh; border-radius: 30px; padding: 40px; overflow-y: auto; position: relative; }
    .toast { position: fixed; bottom: 20px; right: 20px; padding: 16px 25px; border-radius: 12px; background: var(--success); color: var(--bg); font-weight: 700; z-index: 3000; }
  `}</style>
);

export default function App() {
  const [user, setUser] = useState(null);
  const [adminData, setAdminData] = useState(null);
  const [view, setView] = useState("form");
  const [activeTab, setActiveTab] = useState("analytics");
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState(null);

  const [questions, setQuestions] = useState([]);
  const [reports, setReports] = useState([]);
  const [selectedReport, setSelectedReport] = useState(null);
  const [searchStore, setSearchStore] = useState("");
  
  const [auditForm, setAuditForm] = useState({ name: "", store: "", notes: "", answers: {} });
  const [newQ, setNewQ] = useState({ text: "", type: "yesno", options: "" });
  const [loginForm, setLoginForm] = useState({ email: "", pass: "" });

  const showMsg = (m) => { setToast(m); setTimeout(() => setToast(null), 3000); };

  // Library Injector
  useEffect(() => {
    if (!window.jspdf) {
      const s1 = document.createElement("script");
      s1.src = "https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js";
      document.body.appendChild(s1);
      const s2 = document.createElement("script");
      s2.src = "https://cdnjs.cloudflare.com/ajax/libs/jspdf-autotable/3.5.25/jspdf.plugin.autotable.min.js";
      document.body.appendChild(s2);
    }
  }, []);

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (u) => {
      if (u) {
        const snap = await getDoc(doc(db, "admins", u.uid));
        setAdminData(snap.exists() ? snap.data() : { role: 'viewer' });
        setUser(u);
      } else {
        setUser(null); setAdminData(null); setView("form");
      }
      setLoading(false);
    });
    return () => unsub();
  }, []);

  useEffect(() => {
    onSnapshot(query(collection(db, "checklist_questions"), orderBy("order", "asc")), s => setQuestions(s.docs.map(d => ({ id: d.id, ...d.data() }))));
  }, []);

  useEffect(() => {
    if (!user) return;
    onSnapshot(query(collection(db, "store_checklists"), orderBy("createdAt", "desc")), s => setReports(s.docs.map(d => ({ id: d.id, ...d.data() }))));
  }, [user]);

  const analytics = useMemo(() => {
    const filtered = reports.filter(r => r.store.includes(searchStore) || r.name.toLowerCase().includes(searchStore.toLowerCase()));
    
    let globalYes = 0, globalScorable = 0;
    const storeStats = {};
    const issueMap = {};

    filtered.forEach(r => {
      let rYes = 0, rScorable = 0;
      Object.entries(r.answers).forEach(([q, v]) => {
        if (v === "Yes") { rYes++; globalYes++; rScorable++; globalScorable++; } 
        else if (v === "No") { 
          rScorable++; globalScorable++;
          issueMap[q] = (issueMap[q] || 0) + 1;
        }
      });

      const rScore = rScorable > 0 ? (rYes / rScorable) * 100 : 0;
      if (!storeStats[r.store]) storeStats[r.store] = { totalScore: 0, count: 0 };
      storeStats[r.store].totalScore += rScore;
      storeStats[r.store].count += 1;
    });

    // Calculate Store Performance
    const storeRanking = Object.entries(storeStats).map(([id, data]) => ({
      id,
      avg: Math.round(data.totalScore / data.count)
    })).sort((a, b) => b.avg - a.avg);

    const topIssues = Object.entries(issueMap)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5);

    const score = globalScorable > 0 ? Math.round((globalYes / globalScorable) * 100) : 0;
    
    return { 
      total: filtered.length, 
      score, 
      topStore: storeRanking[0] || {id: 'N/A', avg: 0},
      worstStore: storeRanking[storeRanking.length - 1] || {id: 'N/A', avg: 0},
      topIssues,
      list: filtered, 
      color: score > 85 ? 'var(--success)' : score > 70 ? 'var(--warning)' : 'var(--danger)' 
    };
  }, [reports, searchStore]);

  const exportPDF = (rep) => {
    const { jsPDF } = window.jspdf;
    if (!jsPDF) return alert("PDF Engine starting. Please try again.");
    const docP = new jsPDF();
    docP.setFontSize(22); docP.setTextColor(0, 255, 156);
    docP.text(`CKSURE REPORT: STORE #${rep.store}`, 15, 20);
    docP.setFontSize(12); docP.setTextColor(100);
    docP.text(`Inspector: ${rep.name} | Date: ${rep.createdAt?.toDate().toLocaleString() || 'N/A'}`, 15, 30);
    const tableData = Object.entries(rep.answers);
    docP.autoTable({ startY: 40, head: [['Audit Item', 'Status']], body: tableData, theme: 'grid', headStyles: {fillColor: [27, 38, 59]} });
    docP.save(`Store_${rep.store}_Audit.pdf`);
  };

  if (loading) return <div style={{height:'100vh', display:'flex', alignItems:'center', justifyContent:'center', background:'var(--bg)'}}><Loader2 className="animate-spin" color="var(--accent-cyan)"/></div>;

  return (
    <div className="app-container">
      <CustomStyles />
      {toast && <div className="toast">{toast}</div>}

      <header className="header">
        <div style={{display:'flex', alignItems:'center', gap:10}}><CircleDot color="var(--accent-orange)" size={28}/> <h2 style={{margin:0}}>CKSURE</h2></div>
        <div style={{display:'flex', gap:10}}>
          <button className={`nav-btn ${view === "form" ? "active" : ""}`} onClick={() => setView("form")}><ClipboardCheck size={18}/> Audit</button>
          {user ? (
            <>
              <button className={`nav-btn ${view === "admin" ? "active" : ""}`} onClick={() => setView("admin")}><LayoutDashboard size={18}/> Dashboard</button>
              <button className="nav-btn danger-outline" onClick={() => signOut(auth)}><LogOut size={18}/></button>
            </>
          ) : <button className="nav-btn" onClick={() => setView("login")}><LogIn size={18}/> Login</button>}
        </div>
      </header>

      {view === "login" && (
        <div className="card" style={{maxWidth:400, margin:'80px auto', textAlign:'center'}}>
          <Lock size={40} color="var(--accent-cyan)" style={{marginBottom:15}}/>
          <h3>Admin Portal</h3>
          <input className="input-field" style={{marginBottom:10}} placeholder="Email" onChange={e => setLoginForm({...loginForm, email: e.target.value})} />
          <input className="input-field" type="password" style={{marginBottom:20}} placeholder="Password" onChange={e => setLoginForm({...loginForm, pass: e.target.value})} />
          <button className="nav-btn primary" style={{width:'100%', justifyContent:'center', color:'#000'}} onClick={() => signInWithEmailAndPassword(auth, loginForm.email, loginForm.pass).then(()=>setView("admin"))}>Sign In</button>
        </div>
      )}

      {view === "form" && (
        <div className="card" style={{maxWidth:800, margin:'0 auto'}}>
          <h2>New Inspection</h2>
          <div style={{display:'grid', gridTemplateColumns:'1fr 1fr', gap:20, marginBottom:20}}>
            <input className="input-field" placeholder="Inspector" value={auditForm.name} onChange={e => setAuditForm({...auditForm, name: e.target.value})} />
            <input className="input-field" placeholder="Store #" value={auditForm.store} onChange={e => setAuditForm({...auditForm, store: e.target.value})} />
          </div>
          {questions.map((q, i) => (
            <div key={q.id} style={{padding:18, background:'rgba(255,255,255,0.03)', borderRadius:15, marginBottom:12}}>
              <p style={{margin:'0 0 12px', fontWeight:600}}>{i+1}. {q.text}</p>
              {q.type === 'text' ? (
                <input className="input-field" placeholder="..." onChange={e => setAuditForm({...auditForm, answers: {...auditForm.answers, [q.text]: e.target.value}})} />
              ) : (
                <div style={{display:'flex', gap:8}}>
                  {(q.type === 'radio' ? q.options.split(',') : ['Yes', 'No', 'N/A']).map(opt => {
                    const c = opt.trim();
                    const active = auditForm.answers[q.text] === c;
                    return <button key={opt} className={`opt-btn ${active ? (c === 'Yes' ? 'active-yes' : c === 'No' ? 'active-no' : 'active-selected') : ''}`} onClick={() => setAuditForm({...auditForm, answers: {...auditForm.answers, [q.text]: c}})}>{c}</button>
                  })}
                </div>
              )}
            </div>
          ))}
          <button className="nav-btn primary" style={{width:'100%', padding:18, marginTop:20, justifyContent:'center', color:'#000'}} onClick={() => { addDoc(collection(db, "store_checklists"), { ...auditForm, createdAt: serverTimestamp() }); showMsg("Audit Saved!"); setAuditForm({name:"", store:"", notes:"", answers:{}}); }}>Submit Report</button>
        </div>
      )}

      {view === "admin" && (
        <div>
          <div style={{display:'grid', gridTemplateColumns:'repeat(auto-fit, minmax(220px, 1fr))', gap:20, marginBottom:30}}>
            <div className="stat-card" style={{borderLeftColor: 'var(--success)'}}><div style={{fontSize:11, opacity:0.6}}>AVG COMPLIANCE</div><div style={{fontSize:28, fontWeight:800, color:'var(--success)'}}>{analytics.score}%</div></div>
            <div className="stat-card" style={{borderLeftColor: 'var(--accent-cyan)'}}><div style={{fontSize:11, opacity:0.6}}>TOP STORE</div><div style={{fontSize:28, fontWeight:800}}>{analytics.topStore.id} <small style={{fontSize:14, opacity:0.5}}>({analytics.topStore.avg}%)</small></div></div>
            <div className="stat-card" style={{borderLeftColor: 'var(--danger)'}}><div style={{fontSize:11, opacity:0.6}}>LOWEST STORE</div><div style={{fontSize:28, fontWeight:800, color:'var(--danger)'}}>{analytics.worstStore.id} <small style={{fontSize:14, opacity:0.5}}>({analytics.worstStore.avg}%)</small></div></div>
            <div className="stat-card" style={{borderLeftColor: 'var(--accent-orange)'}}><div style={{fontSize:11, opacity:0.6}}>TOP FAILING ITEM</div><div style={{fontSize:14, fontWeight:700, marginTop:5, color:'var(--accent-orange)'}}>{analytics.topIssues[0]?.[0].substring(0,30) || 'None'}...</div></div>
          </div>

          <div style={{display:'flex', gap:25, marginBottom:30, borderBottom:'1px solid rgba(255,255,255,0.1)'}}>
            <button className={`nav-btn ${activeTab === "analytics" ? "tab-active" : ""}`} onClick={()=>setActiveTab("analytics")}>Reports & Analytics</button>
            {adminData?.role === 'super' && <button className={`nav-btn ${activeTab === "builder" ? "tab-active" : ""}`} onClick={()=>setActiveTab("builder")}>Form Builder</button>}
          </div>

          {activeTab === "analytics" && (
            <div style={{display:'grid', gridTemplateColumns:'1fr 350px', gap:30}}>
              <div>
                <div style={{display:'flex', gap:10, marginBottom:20}}>
                   <input className="input-field" placeholder="Search stores..." style={{maxWidth:300}} onChange={e => setSearchStore(e.target.value)} />
                   <div style={{marginLeft:'auto', opacity:0.5}}><BarChart3/> {analytics.total} Total Reports</div>
                </div>
                <div style={{display:'grid', gridTemplateColumns:'repeat(auto-fill, minmax(280px, 1fr))', gap:20}}>
                  {analytics.list.map(r => (
                    <div key={r.id} className="card" style={{marginBottom:0}}>
                      <div style={{display:'flex', justifyContent:'space-between', marginBottom:15}}>
                        <div><h3 style={{margin:0}}>Store #{r.store}</h3><small style={{opacity:0.6}}>{r.name}</small></div>
                        <TrendingUp size={18} color="var(--accent-cyan)"/>
                      </div>
                      <div style={{display:'flex', gap:10}}>
                        <button className="nav-btn primary" style={{flex:1, color:'#000'}} onClick={() => setSelectedReport(r)}><Eye size={14}/> View</button>
                        <button className="nav-btn" onClick={() => exportPDF(r)}><Download size={14}/></button>
                        <button className="nav-btn danger-outline" onClick={() => deleteDoc(doc(db, "store_checklists", r.id))}><Trash2 size={14}/></button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div style={{display:'grid', gap:20, alignContent:'start'}}>
                <div className="card">
                  <h3 style={{display:'flex', alignItems:'center', gap:10, color:'var(--danger)', margin:'0 0 20px'}}><AlertCircle size={20}/> Top Failing Items</h3>
                  <div style={{display:'grid', gap:12}}>
                    {analytics.topIssues.map(([q, count]) => (
                      <div key={q} style={{padding:'12px', background:'rgba(255,77,79,0.05)', borderRadius:12, borderLeft:'3px solid var(--danger)'}}>
                        <div style={{fontSize:13, fontWeight:600}}>{q}</div>
                        <div style={{fontSize:11, color:'var(--danger)', marginTop:4}}>{count} failures</div>
                      </div>
                    ))}
                  </div>
                </div>
                
                <div className="card">
                  <h3 style={{display:'flex', alignItems:'center', gap:10, color:'var(--success)', margin:'0 0 20px'}}><Trophy size={20}/> Leaderboard</h3>
                  <div style={{fontSize:13, opacity:0.8}}>
                     Top Store: <strong style={{color:'var(--success)'}}>{analytics.topStore.id}</strong> ({analytics.topStore.avg}%)
                  </div>
                  <hr style={{opacity:0.1, margin:'15px 0'}}/>
                  <div style={{fontSize:13, opacity:0.8}}>
                     Lowest Store: <strong style={{color:'var(--danger)'}}>{analytics.worstStore.id}</strong> ({analytics.worstStore.avg}%)
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === "builder" && (
            <div style={{display:'grid', gridTemplateColumns:'1fr 1fr', gap:30}}>
              <div className="card">
                <h3>Form Builder</h3>
                <input className="input-field" style={{marginBottom:10}} placeholder="Label..." value={newQ.text} onChange={e => setNewQ({...newQ, text: e.target.value})} />
                <select className="input-field" style={{marginBottom:10}} value={newQ.type} onChange={e => setNewQ({...newQ, type: e.target.value})}>
                  <option value="yesno">Compliance (Yes/No/NA)</option>
                  <option value="radio">Radio Group</option>
                  <option value="text">Input Field</option>
                </select>
                {newQ.type === 'radio' && <input className="input-field" style={{marginBottom:10}} placeholder="Option1, Option2..." value={newQ.options} onChange={e => setNewQ({...newQ, options: e.target.value})} />}
                <button className="nav-btn primary" style={{width:'100%', color:'#000'}} onClick={() => { addDoc(collection(db, "checklist_questions"), {...newQ, order: questions.length}); setNewQ({text:"", type:"yesno", options:""}); showMsg("Field Added"); }}><PlusCircle size={18}/> Save Field</button>
              </div>
              <div className="card">
                <h3>Current Form</h3>
                {questions.map((q, i) => (
                  <div key={q.id} style={{padding:12, background:'rgba(0,0,0,0.2)', marginBottom:8, borderRadius:10, display:'flex', justifyContent:'space-between', alignItems:'center'}}>
                    <span>{i+1}. {q.text}</span>
                    <Trash2 size={16} color="var(--danger)" style={{cursor:'pointer'}} onClick={() => deleteDoc(doc(db, "checklist_questions", q.id))} />
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
            <div style={{display:'flex', justifyContent:'space-between', alignItems:'flex-start', marginBottom:30}}>
              <div>
                <h1 style={{margin:0, color:'var(--success)'}}>Audit: Store #{selectedReport.store}</h1>
                <p style={{opacity:0.6}}><Calendar size={14}/> {selectedReport.createdAt?.toDate().toLocaleString()}</p>
              </div>
              <button className="nav-btn danger-outline" onClick={() => setSelectedReport(null)}><X/></button>
            </div>
            <div style={{display:'grid', gridTemplateColumns:'1fr 1.5fr', gap:40}}>
               <div>
                  <div style={{padding:20, background:'rgba(255,255,255,0.02)', borderRadius:20, textAlign:'center', marginBottom:20}}>
                     <div style={{fontSize:48, fontWeight:800, color:'var(--success)'}}>
                        {Math.round((Object.values(selectedReport.answers).filter(v => v === 'Yes').length / Object.values(selectedReport.answers).filter(v => v === 'Yes' || v === 'No').length) * 100) || 0}%
                     </div>
                     <small>COMPLIANCE SCORE</small>
                  </div>
                  <button className="nav-btn primary" style={{width:'100%', padding:15, color:'#000'}} onClick={() => exportPDF(selectedReport)}><Download/> Download PDF</button>
               </div>
               <div style={{display:'grid', gap:10}}>
                 {Object.entries(selectedReport.answers).map(([q, a]) => (
                    <div key={q} style={{padding:15, background:'rgba(255,255,255,0.03)', borderRadius:12, display:'flex', justifyContent:'space-between', alignItems:'center'}}>
                       <span style={{fontSize:13, opacity:0.8, flex:1}}>{q}</span>
                       <span style={{fontWeight:800, padding:'4px 12px', borderRadius:8, background: a === 'Yes' ? 'var(--success)' : a === 'No' ? 'var(--danger)' : 'var(--accent-cyan)', color:'#0d1b2a'}}>{a}</span>
                    </div>
                 ))}
               </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}