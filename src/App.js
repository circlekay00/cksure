import React, { useEffect, useState, useMemo } from "react";
import {
  ClipboardCheck, LayoutDashboard, LogIn, LogOut, Loader2, Trash2,
  Eye, X, CircleDot, Download, Lock, Calendar, PlusCircle,
  ChevronUp, ChevronDown, CheckCircle2, AlertCircle, ArrowRightLeft, User, ChevronRight, ChevronLeft, BarChart3, ListChecks
} from "lucide-react";

import { initializeApp } from "firebase/app";
import {
  getAuth, signInWithEmailAndPassword, signOut, onAuthStateChanged
} from "firebase/auth";
import {
  getFirestore, collection, addDoc, deleteDoc, doc, onSnapshot,
  serverTimestamp, getDoc, query, orderBy, updateDoc
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
      --bg: #0d1b2a; --card: #1b263b; --accent-cyan: #4cc9f0; --text-primary: #e0e1dd;
      --success: #00ff9c; --danger: #ff4d4f; --warning: #ffd166; --accent-blue: #415a77;
    }
    * { box-sizing: border-box; transition: all 0.2s ease; }
    body { margin: 0; font-family: "Josefin Sans", sans-serif; background-color: var(--bg); color: var(--text-primary); }
    .app-container { width: 100%; max-width: 1200px; margin: 0 auto; padding: 12px; min-height: 100vh; }
    
    .header {
      display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px;
      background: rgba(27, 38, 59, 0.9); backdrop-filter: blur(10px); padding: 15px;
      border-radius: 16px; border: 1px solid rgba(255, 255, 255, 0.1); position: sticky; top: 10px; z-index: 1000;
    }

    .step-bar { display: flex; gap: 6px; margin-bottom: 20px; }
    .step-dot { flex: 1; height: 4px; border-radius: 2px; background: rgba(255,255,255,0.1); }
    .step-dot.active { background: var(--warning); box-shadow: 0 0 10px var(--warning); }
    .step-dot.completed { background: var(--success); }

    .category-box {
      background: rgba(65, 90, 119, 0.15); border: 2px solid rgba(255, 209, 102, 0.1);
      border-radius: 24px; padding: 30px 15px 15px; margin-bottom: 20px; position: relative;
    }
    .category-label {
      background: var(--warning); color: #0d1b2a; padding: 4px 14px; 
      border-radius: 50px; font-weight: 800; font-size: 10px; text-transform: uppercase;
      position: absolute; top: -10px; left: 20px; letter-spacing: 1px;
    }

    .bubble {
      background: var(--card); border-radius: 18px; padding: 14px; margin-bottom: 10px;
      display: flex; align-items: center; gap: 12px; border: 1px solid rgba(255,255,255,0.05);
    }

    .stats-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(140px, 1fr)); gap: 12px; margin-bottom: 20px; }
    .stat-card { background: var(--card); padding: 15px; border-radius: 18px; border-left: 4px solid var(--success); }
    .stat-card.warn { border-left-color: var(--warning); }

    .nav-btn {
      padding: 10px 14px; border-radius: 12px; border: 1px solid rgba(255,255,255,0.1);
      background: var(--accent-blue); color: white; cursor: pointer; font-weight: 600;
      display: flex; align-items: center; gap: 8px; font-size: 14px;
    }
    .nav-btn.active { background: var(--success); color: #0d1b2a; }
    .nav-btn.warning { background: var(--warning); color: #0d1b2a; }
    .nav-btn.primary { background: var(--success); color: #0d1b2a; border: none; font-weight: 800; }

    .modal-overlay { position: fixed; inset: 0; background: rgba(0,0,0,0.85); backdrop-filter: blur(4px); z-index: 2000; display: flex; align-items: center; justify-content: center; padding: 15px; }
    .modal-content { background: var(--bg); width: 100%; max-width: 700px; max-height: 85vh; border-radius: 28px; padding: 25px; overflow-y: auto; border: 1px solid rgba(255,255,255,0.1); }
    
    .detail-pill { background: rgba(255,255,255,0.05); padding: 8px 12px; border-radius: 12px; display: flex; flex-direction: column; align-items: center; min-width: 80px; }
    .detail-pill b { font-size: 16px; color: var(--success); }
    .detail-pill small { font-size: 9px; text-transform: uppercase; opacity: 0.6; }
  `}</style>
);

export default function App() {
  const [user, setUser] = useState(null);
  const [view, setView] = useState("form");
  const [activeTab, setActiveTab] = useState("analytics");
  const [loading, setLoading] = useState(true);
  const [questions, setQuestions] = useState([]);
  const [reports, setReports] = useState([]);
  const [selectedReport, setSelectedReport] = useState(null);
  const [auditForm, setAuditForm] = useState({ name: "", store: "", answers: {} });
  const [newQ, setNewQ] = useState({ text: "", category: "General" });
  const [currentStep, setCurrentStep] = useState(0);

  useEffect(() => {
    const loadScript = (src) => new Promise((res) => {
      const s = document.createElement("script"); s.src = src; s.onload = () => res(); document.body.appendChild(s);
    });
    const init = async () => {
      await loadScript("https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js");
      await loadScript("https://cdnjs.cloudflare.com/ajax/libs/jspdf-autotable/3.5.25/jspdf.plugin.autotable.min.js");
    };
    init();
    onAuthStateChanged(auth, u => { setUser(u); setLoading(false); });
    onSnapshot(query(collection(db, "checklist_questions"), orderBy("order", "asc")), s => setQuestions(s.docs.map(d => ({ id: d.id, ...d.data() }))));
  }, []);

  useEffect(() => {
    if (user) onSnapshot(query(collection(db, "store_checklists"), orderBy("createdAt", "desc")), s => setReports(s.docs.map(d => ({ id: d.id, ...d.data() }))));
  }, [user]);

  const groupedQs = useMemo(() => {
    const groups = questions.reduce((acc, q) => {
      const cat = q.category || "General";
      if (!acc[cat]) acc[cat] = [];
      acc[cat].push(q);
      return acc;
    }, {});
    return Object.entries(groups);
  }, [questions]);

  const calcSingleScore = (answers) => {
    const vals = Object.values(answers);
    const yes = vals.filter(v => v === "Yes").length;
    const scorable = vals.filter(v => v !== "N/A").length;
    return { 
      pct: scorable > 0 ? Math.round((yes / scorable) * 100) : 0,
      yes, scorable, no: vals.filter(v => v === "No").length
    };
  };

  const analytics = useMemo(() => {
    let gYes = 0, gScorable = 0; const storeMap = {}; const issueMap = {};
    reports.forEach(r => {
      const { yes, scorable } = calcSingleScore(r.answers || {});
      gYes += yes; gScorable += scorable;
      Object.entries(r.answers || {}).forEach(([q, v]) => { if (v === "No") issueMap[q] = (issueMap[q] || 0) + 1; });
      if (!storeMap[r.store]) storeMap[r.store] = { t: 0, c: 0 };
      storeMap[r.store].t += (scorable > 0 ? (yes / scorable) * 100 : 0);
      storeMap[r.store].c += 1;
    });
    const ranked = Object.entries(storeMap).map(([id, d]) => ({ id, avg: Math.round(d.t / d.c) })).sort((a,b) => b.avg - a.avg);
    return { score: gScorable > 0 ? Math.round((gYes / gScorable) * 100) : 0, top: ranked[0] || {id:'N/A'}, low: ranked[ranked.length-1] || {id:'N/A'}, issues: Object.entries(issueMap).sort((a,b)=>b[1]-a[1]).slice(0, 5) };
  }, [reports]);

  const exportPDF = (rep) => {
    try {
      const { jsPDF } = window.jspdf;
      const docP = new jsPDF();
      const stats = calcSingleScore(rep.answers);
      
      docP.setFillColor(13, 27, 42); docP.rect(0, 0, 210, 50, 'F');
      docP.setTextColor(0, 255, 156); docP.setFontSize(24); docP.text(`AUDIT REPORT: ${stats.pct}%`, 15, 25);
      docP.setTextColor(255, 255, 255); docP.setFontSize(10);
      docP.text(`Store #${rep.store} | Inspector: ${rep.name}`, 15, 35);
      docP.text(`Date: ${rep.createdAt?.toDate()?.toLocaleString()}`, 15, 42);

      const tableData = Object.entries(rep.answers).map(([q, a]) => [q, a]);
      docP.autoTable({
        startY: 60,
        head: [['Compliance Item', 'Status']],
        body: tableData,
        headStyles: { fillColor: [65, 90, 119], textColor: [255, 255, 255] },
        didParseCell: (data) => {
          if (data.section === 'body' && data.column.index === 1) {
            if (data.cell.raw === 'No') data.cell.styles.textColor = [255, 77, 79];
            if (data.cell.raw === 'Yes') data.cell.styles.textColor = [0, 255, 156];
          }
        }
      });
      docP.save(`Audit_Store_${rep.store}.pdf`);
    } catch (e) { alert("PDF Error. Try again."); }
  };

  if (loading) return <div style={{height:'100vh', display:'flex', alignItems:'center', justifyContent:'center', background:'var(--bg)'}}><Loader2 className="animate-spin" color="#ffd166"/></div>;

  return (
    <div className="app-container">
      <CustomStyles />
      <header className="header">
        <div style={{display:'flex', alignItems:'center', gap:8}}><CircleDot color="#ffd166"/> <b style={{fontSize:18}}>CKSURE</b></div>
        <div style={{display:'flex', gap:8}}>
          <button className={`nav-btn ${view==='form'?'active':''}`} onClick={()=>setView('form')}><ClipboardCheck size={18}/></button>
          {user && <button className={`nav-btn ${view==='admin'?'active':''}`} onClick={()=>setView('admin')}><LayoutDashboard size={18}/></button>}
          {!user ? <button className="nav-btn" onClick={()=>setView('login')}><LogIn size={18}/></button> : <button className="nav-btn" onClick={()=>signOut(auth)}><LogOut size={18}/></button>}
        </div>
      </header>

      {view === 'form' && (
        <div style={{maxWidth:600, margin:'0 auto'}}>
          <div className="step-bar">
            <div className={`step-dot ${currentStep === 0 ? 'active' : 'completed'}`}></div>
            {groupedQs.map((_, i) => <div key={i} className={`step-dot ${currentStep === i + 1 ? 'active' : currentStep > i + 1 ? 'completed' : ''}`}></div>)}
          </div>

          {currentStep === 0 ? (
            <div className="category-box"><div className="category-label">Initial Entry</div>
              <input className="nav-btn" style={{width:'100%', marginBottom:10, background:'rgba(0,0,0,0.3)', textAlign:'left'}} placeholder="Inspector Name" onChange={e=>setAuditForm({...auditForm, name: e.target.value})}/>
              <input className="nav-btn" style={{width:'100%', background:'rgba(0,0,0,0.3)', textAlign:'left'}} placeholder="Store Number" onChange={e=>setAuditForm({...auditForm, store: e.target.value})}/>
              <button className="nav-btn warning" style={{width:'100%', marginTop:20, justifyContent:'center'}} onClick={()=>setCurrentStep(1)}>BEGIN INSPECTION <ChevronRight size={18}/></button>
            </div>
          ) : (
            <div>
              {groupedQs[currentStep - 1] && (
                <div className="category-box"><div className="category-label">{groupedQs[currentStep - 1][0]}</div>
                  {groupedQs[currentStep - 1][1].map(q => (
                    <div key={q.id} className="bubble"><div style={{flex:1, fontSize:14}}>{q.text}</div>
                      <div style={{display:'flex', gap:4}}>
                        {['Yes', 'No', 'N/A'].map(o => (
                          <button key={o} className="nav-btn" style={{padding:'6px 10px', fontSize:11, background: auditForm.answers[q.text]===o ? (o==='Yes'?'#00ff9c':o==='No'?'#ff4d4f':'#ffd166') : 'rgba(255,255,255,0.05)', color: auditForm.answers[q.text]===o ? '#0b132b' : 'white'}} onClick={()=>setAuditForm({...auditForm, answers: {...auditForm.answers, [q.text]: o}})}>{o}</button>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              )}
              <div style={{display:'flex', gap:10}}>
                <button className="nav-btn" style={{flex:1, justifyContent:'center'}} onClick={()=>setCurrentStep(currentStep - 1)}><ChevronLeft size={18}/> PREVIOUS</button>
                {currentStep < groupedQs.length ? (
                  <button className="nav-btn warning" style={{flex:1, justifyContent:'center'}} onClick={()=>setCurrentStep(currentStep + 1)}>NEXT <ChevronRight size={18}/></button>
                ) : (
                  <button className="nav-btn active" style={{flex:1, justifyContent:'center'}} onClick={()=>{addDoc(collection(db,"store_checklists"), {...auditForm, createdAt: serverTimestamp()}); alert("Audit Complete!"); setCurrentStep(0); setView('admin');}}>SUBMIT ALL</button>
                )}
              </div>
            </div>
          )}
        </div>
      )}

      {view === 'admin' && (
        <div>
          <div className="stats-grid">
            <div className="stat-card"><small>SYSTEM AVG</small><div style={{fontSize:24, fontWeight:800, color:'var(--success)'}}>{analytics.score}%</div></div>
            <div className="stat-card warn"><small>TOP STORE</small><div style={{fontSize:20, fontWeight:800, color:'var(--warning)'}}>#{analytics.top.id}</div></div>
            <div className="stat-card"><small>LOW STORE</small><div style={{fontSize:20, fontWeight:800, color:'var(--danger)'}}>#{analytics.low.id}</div></div>
            <div className="stat-card warn"><small>DATABASE</small><div style={{fontSize:24, fontWeight:800, color:'var(--warning)'}}>{reports.length}</div></div>
          </div>

          <div style={{display:'flex', gap:10, marginBottom:20}}>
            <button className={`nav-btn ${activeTab==='analytics'?'active':''}`} onClick={()=>setActiveTab('analytics')}>Inspection Logs</button>
            <button className={`nav-btn ${activeTab==='builder'?'active':''}`} onClick={()=>setActiveTab('builder')}>Box Builder</button>
          </div>

          {activeTab === 'analytics' && (
            <div style={{display:'grid', gridTemplateColumns: window.innerWidth > 900 ? '1fr 300px' : '1fr', gap:20}}>
              <div>
                {reports.map(r => (
                  <div key={r.id} className="bubble" style={{justifyContent:'space-between'}}>
                    <div><b>Store #{r.store}</b><br/><small style={{opacity:0.5}}>{r.createdAt?.toDate()?.toLocaleDateString()} - {calcSingleScore(r.answers).pct}%</small></div>
                    <div style={{display:'flex', gap:8}}>
                      <button className="nav-btn warning" onClick={()=>setSelectedReport(r)}><Eye size={16}/></button>
                      <button className="nav-btn" style={{background:'var(--danger)'}} onClick={()=>deleteDoc(doc(db,"store_checklists",r.id))}><Trash2 size={16}/></button>
                    </div>
                  </div>
                ))}
              </div>
              <div className="category-box"><div className="category-label" style={{background:'var(--danger)', color:'white'}}>High Risk Items</div>
                {analytics.issues.map(([q, c]) => (
                  <div key={q} style={{padding:10, background:'rgba(255,77,79,0.1)', borderRadius:12, marginBottom:8, fontSize:12, borderLeft:'4px solid var(--danger)'}}>{q}<br/><b style={{color:'var(--danger)'}}>{c} CRITICAL FAILS</b></div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'builder' && (
            <div>
              <div className="category-box"><div className="category-label">Bubble Creation</div>
                <input className="nav-btn" style={{width:'100%', marginBottom:8, background:'var(--bg)', textAlign:'left'}} placeholder="Question Text" value={newQ.text} onChange={e=>setNewQ({...newQ, text:e.target.value})}/>
                <input className="nav-btn" style={{width:'100%', marginBottom:10, background:'var(--bg)', textAlign:'left'}} placeholder="Category Box Name" value={newQ.category} onChange={e=>setNewQ({...newQ, category:e.target.value})}/>
                <button className="nav-btn warning" style={{width:'100%', justifyContent:'center'}} onClick={()=>{addDoc(collection(db,"checklist_questions"),{...newQ, order: questions.length}); setNewQ({text:"", category:"General"});}}>ADD TO SYSTEM</button>
              </div>
              {groupedQs.map(([cat, qs]) => (
                <div key={cat} className="category-box"><div className="category-label">{cat}</div>
                  {qs.map((q) => (
                    <div key={q.id} className="bubble">
                      <div style={{flex:1}}><div style={{fontSize:14}}>{q.text}</div>
                        <select className="nav-btn" style={{fontSize:10, padding:4, marginTop:5, color:'var(--warning)', background:'var(--bg)'}} value={q.category} onChange={(e)=>updateDoc(doc(db,"checklist_questions",q.id),{category:e.target.value})}>
                          {[...new Set(questions.map(x=>x.category))].map(c => <option key={c} value={c}>{c}</option>)}
                        </select>
                      </div>
                      <Trash2 size={16} color="var(--danger)" onClick={()=>deleteDoc(doc(db,"checklist_questions",q.id))}/>
                    </div>
                  ))}
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {selectedReport && (
        <div className="modal-overlay" onClick={()=>setSelectedReport(null)}>
          <div className="modal-content" onClick={e=>e.stopPropagation()}>
            <div style={{display:'flex', justifyContent:'space-between', alignItems:'flex-start', marginBottom:20}}>
              <div>
                <h2 style={{margin:0, color:'var(--warning)'}}>Audit Details #{selectedReport.store}</h2>
                <div style={{display:'flex', gap:10, fontSize:12, marginTop:5, opacity:0.8}}>
                    <span style={{display:'flex', alignItems:'center', gap:4}}><User size={12}/> {selectedReport.name}</span>
                    <span style={{display:'flex', alignItems:'center', gap:4}}><Calendar size={12}/> {selectedReport.createdAt?.toDate()?.toLocaleDateString()}</span>
                </div>
              </div>
              <X onClick={()=>setSelectedReport(null)} style={{cursor:'pointer'}}/>
            </div>

            <div style={{display:'flex', gap:10, marginBottom:20, justifyContent:'center'}}>
              <div className="detail-pill"><b>{calcSingleScore(selectedReport.answers).pct}%</b><small>Score</small></div>
              <div className="detail-pill"><b>{calcSingleScore(selectedReport.answers).yes}</b><small>Passed</small></div>
              <div className="detail-pill" style={{borderColor:'var(--danger)'}}><b style={{color:'var(--danger)'}}>{calcSingleScore(selectedReport.answers).no}</b><small>Failed</small></div>
              <div className="detail-pill"><b style={{color:'var(--accent-cyan)'}}>{calcSingleScore(selectedReport.answers).scorable}</b><small>Total</small></div>
            </div>

            <div style={{display:'grid', gap:8}}>
              {Object.entries(selectedReport.answers).map(([q, a]) => (
                <div key={q} className="bubble" style={{justifyContent:'space-between', background:'rgba(255,255,255,0.02)', padding:'10px 14px'}}>
                  <span style={{fontSize:13, flex:1, paddingRight:10}}>{q}</span>
                  <span style={{padding:'4px 10px', borderRadius:6, fontSize:10, fontWeight:800, background: a==='Yes'?'var(--success)':a==='No'?'var(--danger)':'var(--warning)', color:'#0d1b2a'}}>{a}</span>
                </div>
              ))}
            </div>
            
            <button className="nav-btn primary" style={{width:'100%', marginTop:25, height:50}} onClick={()=>exportPDF(selectedReport)}><Download size={18}/> EXPORT DETAILED PDF</button>
          </div>
        </div>
      )}
    </div>
  );
}