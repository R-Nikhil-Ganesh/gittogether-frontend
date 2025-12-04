"use client"

import { useEffect, useState } from "react"
import { api } from "@/lib/api"

export default function LandingPage() {
  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    // set title
    document.title = "GitTogether - Connect. Collaborate. Create."

    // Load lucide icons script dynamically
    if (typeof window !== "undefined" && !(window as any).lucide) {
      const script = document.createElement("script")
      script.src = "https://unpkg.com/lucide@latest"
      script.async = true
      script.onload = () => {
        try {
          ;(window as any).lucide?.createIcons()
        } catch (e) {
          // ignore
        }
      }
      document.body.appendChild(script)
    } else {
      ;(window as any).lucide?.createIcons?.()
    }
  }, [])

  const handleGoogleAuth = async (e?: React.MouseEvent) => {
    e?.preventDefault()
    try {
      setIsLoading(true)
      const response: any = await api.getGoogleAuthUrl()
      if (response && response.authorization_url) {
        window.location.href = response.authorization_url
      } else {
        throw new Error("No authorization URL received")
      }
    } catch (error: any) {
      console.error("Authentication failed:", error)
      alert(`Authentication failed: ${error?.message || "Please try again."}`)
      setIsLoading(false)
    }
  }

  return (
    <div className="antialiased selection:bg-indigo-500/30">
      <style>{`
        :root {
            --bg-main: #111827;
            --bg-sidebar: #030712;
            --bg-card: #1f2937;
            --bg-hover: #374151;
            --primary-light: #818cf8;
            --primary: #6366f1;
            --primary-dark: #4f46e5;
            --primary-deep: #312e81;
            --text-main: #f3f4f6;
            --text-white: #ffffff;
            --text-muted: #9ca3af;
            --text-dim: #4b5563;
            --border-light: #374151;
            --border-dark: #1f2937;
            --border-brand: #6366f1;
            --accent-purple: #a855f7;
            --accent-pink: #ec4899;
            --success-icon: #10b981;
        }
        body { background-color: var(--bg-main); color: var(--text-main); scroll-behavior: smooth; }
        .text-brand { color: var(--primary-light); }
        .text-muted { color: var(--text-muted); }
        .bg-card { background-color: var(--bg-card); }
        .border-light { border-color: var(--border-light); }
        .btn { display: inline-flex; align-items: center; justify-content: center; padding: 0.75rem 1.5rem; border-radius: 0.5rem; font-weight: 600; transition: all 0.2s ease; cursor: pointer; }
        .btn-primary { background-color: var(--primary-dark); color: var(--text-white); border: 1px solid transparent; box-shadow: 0 4px 6px -1px rgba(99, 102, 241, 0.2); }
        .btn-primary:hover { background-color: var(--primary); transform: translateY(-1px); }
        .btn-outline { background-color: transparent; border: 1px solid var(--border-light); color: var(--text-main); }
        .btn-outline:hover { border-color: var(--primary); color: var(--primary-light); background-color: rgba(99, 102, 241, 0.1); }
        .gradient-text { background: linear-gradient(135deg, var(--primary-light), var(--accent-purple), var(--accent-pink)); -webkit-background-clip: text; -webkit-text-fill-color: transparent; }
        .feature-card { background-color: var(--bg-card); border: 1px solid var(--border-light); border-radius: 1rem; padding: 2rem; transition: all 0.3s ease; position: relative; overflow: hidden; }
        .feature-card:hover { border-color: var(--primary); transform: translateY(-5px); box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.3); }
        .feature-card::before { content: ''; position: absolute; top: 0; left: 0; width: 100%; height: 4px; background: linear-gradient(90deg, var(--primary), var(--accent-purple)); opacity: 0; transition: opacity 0.3s ease; }
        .feature-card:hover::before { opacity: 1; }
        .nav-link { color: var(--text-muted); font-weight: 500; transition: color 0.2s; }
        .nav-link:hover { color: var(--text-white); }
        .blob { position: absolute; border-radius: 50%; filter: blur(80px); z-index: -1; opacity: 0.4; }
        .blob-1 { top: -5%; left: 10%; width: 300px; height: 300px; background: var(--primary-deep); }
        .blob-2 { bottom: 20%; right: 10%; width: 250px; height: 250px; background: rgba(168, 85, 247, 0.2); }
      `}</style>

      {/* Background Effects */}
      <div className="blob blob-1" />
      <div className="blob blob-2" />

      {/* Navigation */}
      <nav className="border-b bg-[var(--bg-main)]/80 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-2">
              <span className="font-bold text-lg sm:text-xl tracking-tight text-[var(--text-white)]">GitTogether</span>
            </div>

            <div className="hidden md:flex items-center gap-12 flex-1 justify-center">
              <a href="#features" className="nav-link">Features</a>
              <a href="#how-it-works" className="nav-link">How it Works</a>
            </div>

            <div className="flex items-center gap-2 sm:gap-4">
              <a href="#" onClick={handleGoogleAuth} className="btn btn-primary text-xs sm:text-sm">
	                Get Started<span className="hidden sm:inline">&nbsp;(with college email)</span>
	                <i data-lucide="arrow-right" style={{ width: 16 }} className="ml-2"></i>
              </a>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative pt-20 pb-32 overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">

          <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight mb-6 leading-tight">
            Stop Coding Alone. <br />
            Start <span className="gradient-text">Building Together.</span>
          </h1>

          <p className="mt-4 max-w-2xl mx-auto text-xl text-[var(--text-muted)]">
            The ultimate platform for students to find teammates for hackathons, capstone projects, and coding clubs. Connect based on skills, not just majors.
          </p>

          <div className="mt-10 flex justify-center gap-4">
            <a href="#" onClick={handleGoogleAuth} className="btn btn-outline text-lg px-8">
              Find a Team
            </a>
            <a href="#features" className="btn btn-outline text-lg px-8">Explore Projects</a>
          </div>

          <p className="mt-4 max-w-2xl mx-auto text-xl font-extrabold tracking-tight mb-6 leading-tight">* Only use EEC email ID</p>

          {/* Hero Image Mockup */}
          <div className="mt-16 relative mx-auto max-w-5xl">
            <div className="bg-[var(--bg-card)] rounded-xl border border-[var(--border-light)] shadow-2xl p-2 md:p-4">
              <div className="flex items-center gap-2 mb-4 px-2">
                <div className="w-3 h-3 rounded-full bg-red-500/50"></div>
                <div className="w-3 h-3 rounded-full bg-yellow-500/50"></div>
                <div className="w-3 h-3 rounded-full bg-green-500/50"></div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-4 gap-4 h-64 md:h-96 overflow-hidden bg-[var(--bg-main)] rounded-lg border border-[var(--border-dark)] p-4">
                <div className="hidden md:block col-span-1 bg-[var(--bg-sidebar)] rounded-lg border border-[var(--border-light)] p-4 space-y-3">
                  <div className="h-8 w-3/4 bg-[var(--bg-hover)] rounded mb-6"></div>
                  <div className="h-4 w-full bg-[var(--bg-hover)] rounded opacity-50"></div>
                  <div className="h-4 w-5/6 bg-[var(--bg-hover)] rounded opacity-50"></div>
                  <div className="h-4 w-full bg-[var(--bg-hover)] rounded opacity-50"></div>
                </div>
                <div className="col-span-1 md:col-span-3 grid grid-cols-2 gap-4">
                  <div className="bg-[var(--bg-card)] border border-[var(--border-light)] rounded-lg p-4">
                    <div className="flex justify-between mb-2">
                      <div className="h-4 w-12 bg-[var(--accent-purple)] rounded-full opacity-20"></div>
                      <div className="h-4 w-8 bg-[var(--bg-hover)] rounded"></div>
                    </div>
                    <div className="h-6 w-3/4 bg-[var(--text-dim)] rounded mb-2"></div>
                    <div className="h-4 w-full bg-[var(--bg-hover)] rounded"></div>
                  </div>
                  <div className="bg-[var(--bg-card)] border border-[var(--border-light)] rounded-lg p-4">
                    <div className="flex justify-between mb-2">
                      <div className="h-4 w-12 bg-[var(--accent-pink)] rounded-full opacity-20"></div>
                      <div className="h-4 w-8 bg-[var(--bg-hover)] rounded"></div>
                    </div>
                    <div className="h-6 w-1/2 bg-[var(--text-dim)] rounded mb-2"></div>
                    <div className="h-4 w-full bg-[var(--bg-hover)] rounded"></div>
                  </div>
                  <div className="col-span-2 bg-[var(--bg-card)] border border-[var(--border-light)] rounded-lg p-4 opacity-50">
                    <div className="h-6 w-1/4 bg-[var(--text-dim)] rounded mb-2"></div>
                  </div>
                </div>
              </div>
            </div>
            <div className="absolute -right-10 -bottom-10 w-24 h-24 bg-[var(--primary)] rounded-full blur-2xl opacity-20"></div>
          </div>
        </div>
      </section>


      {/* Features Section */}
      <section id="features" className="py-24 bg-[var(--bg-sidebar)]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-[var(--primary-light)] font-semibold tracking-wide uppercase text-sm mb-2">Why GitTogether?</h2>
            <h3 className="text-3xl md:text-4xl font-bold text-[var(--text-white)]">Everything you need to ship.</h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="feature-card group">
              <div className="w-12 h-12 rounded-lg bg-[var(--primary-deep)] flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                <i data-lucide="code" className="text-[var(--primary-light)]"></i>
              </div>
              <h4 className="text-xl font-bold mb-3 text-[var(--text-white)]">Hackathon Ready</h4>
              <p className="text-[var(--text-muted)] leading-relaxed">Find teammates specifically for upcoming hackathons. Filter by role (Frontend, Backend, Design) to build a balanced squad.</p>
            </div>

            <div className="feature-card group">
              <div className="w-12 h-12 rounded-lg bg-[var(--bg-hover)] flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                <i data-lucide="users" className="text-[var(--accent-purple)]"></i>
              </div>
              <h4 className="text-xl font-bold mb-3 text-[var(--text-white)]">Skill-Based Matching</h4>
              <p className="text-[var(--text-muted)] leading-relaxed">Don't just join a team, join the <em>right</em> team. Our algorithm highlights users with complementary skills (e.g., React + Node.js).</p>
            </div>

            <div className="feature-card group">
              <div className="w-12 h-12 rounded-lg bg-[var(--bg-hover)] flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                <i data-lucide="zap" className="text-[var(--accent-pink)]"></i>
              </div>
              <h4 className="text-xl font-bold mb-3 text-[var(--text-white)]">Instant Collaboration</h4>
              <p className="text-[var(--text-muted)] leading-relaxed">Create a project, approve requests, and get a dedicated workspace to share Github repos, Discord links, and tasks instantly.</p>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section id="how-it-works" className="py-24 bg-[var(--bg-main)] relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
          <div className="absolute top-1/4 -left-64 w-96 h-96 bg-[var(--primary-deep)] rounded-full blur-[100px] opacity-20"></div>
          <div className="absolute bottom-1/4 -right-64 w-96 h-96 bg-[var(--accent-purple)] rounded-full blur-[100px] opacity-20"></div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="text-center mb-16">
            <h2 className="text-[var(--primary-light)] font-semibold tracking-wide uppercase text-sm mb-2">Workflow</h2>
            <h3 className="text-3xl md:text-4xl font-bold text-[var(--text-white)]">From Idea to Deployment in 3 Steps</h3>
          </div>

          <div className="relative grid grid-cols-1 md:grid-cols-3 gap-12">
            <div className="hidden md:block absolute top-12 left-[16%] right-[16%] h-0.5 bg-gradient-to-r from-[var(--border-light)] via-[var(--primary)] to-[var(--border-light)] z-0"></div>

            <div className="relative z-10 flex flex-col items-center text-center group">
              <div className="w-24 h-24 rounded-2xl bg-[var(--bg-card)] border border-[var(--border-light)] flex items-center justify-center mb-6 shadow-lg group-hover:border-[var(--primary)] group-hover:shadow-[var(--primary)]/20 transition-all duration-300">
                <i data-lucide="user-plus" className="w-10 h-10 text-[var(--primary-light)]"></i>
              </div>
              <div className="absolute -top-3 right-1/2 translate-x-1/2 md:right-auto md:left-[60%] bg-[var(--bg-main)] px-2 text-sm font-bold text-[var(--text-muted)]">01</div>
              <h4 className="text-xl font-bold text-[var(--text-white)] mb-2">Create Profile</h4>
              <p className="text-[var(--text-muted)] text-sm leading-relaxed max-w-xs">Sync your Github, highlight your tech stack (e.g., MERN, Rust), and showcase your portfolio.</p>
            </div>

            <div className="relative z-10 flex flex-col items-center text-center group">
              <div className="w-24 h-24 rounded-2xl bg-[var(--bg-card)] border border-[var(--border-light)] flex items-center justify-center mb-6 shadow-lg group-hover:border-[var(--accent-purple)] group-hover:shadow-[var(--accent-purple)]/20 transition-all duration-300">
                <i data-lucide="search" className="w-10 h-10 text-[var(--accent-purple)]"></i>
              </div>
              <div className="absolute -top-3 right-1/2 translate-x-1/2 md:right-auto md:left-[60%] bg-[var(--bg-main)] px-2 text-sm font-bold text-[var(--text-muted)]">02</div>
              <h4 className="text-xl font-bold text-[var(--text-white)] mb-2">Find Your Squad</h4>
              <p className="text-[var(--text-muted)] text-sm leading-relaxed max-w-xs">Browse projects by tech stack or event (e.g., "HackMIT"). Send a request with one click.</p>
            </div>

            <div className="relative z-10 flex flex-col items-center text-center group">
              <div className="w-24 h-24 rounded-2xl bg-[var(--bg-card)] border border-[var(--border-light)] flex items-center justify-center mb-6 shadow-lg group-hover:border-[var(--accent-pink)] group-hover:shadow-[var(--accent-pink)]/20 transition-all duration-300">
                <i data-lucide="rocket" className="w-10 h-10 text-[var(--accent-pink)]"></i>
              </div>
              <div className="absolute -top-3 right-1/2 translate-x-1/2 md:right-auto md:left-[60%] bg-[var(--bg-main)] px-2 text-sm font-bold text-[var(--text-muted)]">03</div>
              <h4 className="text-xl font-bold text-[var(--text-white)] mb-2">Ship It</h4>
              <p className="text-[var(--text-muted)] text-sm leading-relaxed max-w-xs">Get a dedicated workspace, manage tasks, and deploy your project together.</p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-[var(--bg-main)] to-[var(--primary-deep)] opacity-50"></div>
        <div className="max-w-4xl mx-auto px-4 text-center relative z-10">
          <h2 className="text-4xl md:text-5xl font-extrabold text-[var(--text-white)] mb-6">Ready to build something amazing?</h2>
          <p className="text-xl text-[var(--text-muted)] mb-10 max-w-2xl mx-auto"> Join the Student communtiy. It's free and designed for you to connect with peoples with same mind and share your views.</p>
        </div>
      </section>
      
      {/* Footer */}
      <footer className="bg-[var(--bg-sidebar)] pt-16 pb-8 border-t border-[var(--border-dark)]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="flex items-center gap-2 mb-4 md:mb-0">
              <span className="font-bold text-xl text-[var(--text-white)]">GitTogether</span>
            </div>
            <div className="text-[var(--text-dim)] text-sm">2024 GitTogether. Built for builders.</div>
          </div>
        </div>
      </footer>
      
    </div>
  )
}
