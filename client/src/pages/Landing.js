import React from "react";
import { useNavigate } from "react-router-dom";

export default function Landing() {
  const navigate = useNavigate();

  return (
    <div style={{ minHeight:"100vh", background:"linear-gradient(135deg,#0B1F3A 0%,#1a3a5c 100%)", color:"white", display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center", textAlign:"center", padding:"2rem" }}>
      <h1 style={{ fontSize:"clamp(2rem,5vw,3.5rem)", fontWeight:800, letterSpacing:"-0.03em", marginBottom:"1rem" }}>
        Campus <span style={{ color:"#02C39A" }}>Placement Portal</span>
      </h1>
      <p style={{ fontSize:"1.1rem", color:"#9FB8C7", maxWidth:"560px", lineHeight:1.7, marginBottom:"2rem" }}>
        AI-powered candidate shortlisting using custom MSCEA algorithm -
        Multi-Stage Candidate Elimination with TF-IDF, Cosine Similarity &amp; Skill Gap Graph.
        No ML library - built from scratch.
      </p>
      <div style={{ display:"flex", gap:"1rem", flexWrap:"wrap", justifyContent:"center" }}>
        <button onClick={() => navigate("/register")} style={{ padding:"13px 28px", background:"linear-gradient(135deg,#028090,#02C39A)", border:"none", borderRadius:"10px", color:"white", fontSize:"1rem", fontWeight:700, cursor:"pointer" }}>
          Get Started -&gt;
        </button>
        <button onClick={() => navigate("/login")} style={{ padding:"13px 28px", background:"rgba(255,255,255,0.08)", border:"1px solid rgba(255,255,255,0.2)", borderRadius:"10px", color:"white", fontSize:"1rem", fontWeight:600, cursor:"pointer" }}>
          Login
        </button>
      </div>
      <div style={{ display:"flex", gap:"2rem", marginTop:"3rem", flexWrap:"wrap", justifyContent:"center" }}>
        {[["🎓","Students","Apply to drives, track status"],["🏢","Recruiters","Post drives, run AI shortlisting"],["📊","TPO Admin","Analytics & full oversight"]].map(([icon,title,desc]) => (
          <div key={title} style={{ background:"rgba(255,255,255,0.05)", border:"1px solid rgba(255,255,255,0.1)", borderRadius:"12px", padding:"1.25rem 1.5rem", minWidth:"180px" }}>
            <div style={{ fontSize:"2rem" }}>{icon}</div>
            <div style={{ fontWeight:700, marginTop:"0.5rem" }}>{title}</div>
            <div style={{ fontSize:"0.8rem", color:"#9FB8C7", marginTop:"4px" }}>{desc}</div>
          </div>
        ))}
      </div>
      <p style={{ marginTop:"2rem", fontSize:"0.78rem", color:"#4A6478" }}>
        MCA Final Year Project · Nutan Kumari · G.L. Bajaj Institute · 2026
      </p>
    </div>
  );
}