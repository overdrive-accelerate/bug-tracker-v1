import Link from "next/link";
import ThemeToggle from "@/components/ThemeToggle";

export default function LandingPage() {
    return (
        <div className="min-h-screen bg-background text-foreground">
            {/* Nav */}
            <header className="fixed top-0 w-full z-50 bg-background/70 backdrop-blur-xl border-b border-border/40">
                <div className="max-w-6xl mx-auto px-6 h-14 flex items-center justify-between">
                    <div className="flex items-center gap-2.5">
                        <div className="w-7 h-7 bg-gradient-to-br from-indigo-400 to-indigo-600 rounded-lg flex items-center justify-center text-white text-sm font-extrabold shadow-[0_2px_8px_rgba(99,102,241,0.3)]">
                            T
                        </div>
                        <span className="font-bold text-[15px] tracking-[-0.01em]">Taxstar</span>
                    </div>
                    <div className="flex items-center gap-2">
                        {/* Theme toggle */}
                        <ThemeToggle />
                        <Link
                            href="/login"
                            className="text-sm text-muted-foreground hover:text-foreground transition-colors px-3 py-1.5"
                        >
                            Log in
                        </Link>
                        <Link
                            href="/signup"
                            className="text-sm font-medium bg-primary text-primary-foreground px-4 py-2 rounded-lg hover:opacity-90 transition-opacity shadow-[0_1px_4px_rgba(99,102,241,0.2)]"
                        >
                            Sign up
                        </Link>
                    </div>
                </div>
            </header>

            {/* Hero */}
            <section className="pt-36 pb-24 px-6">
                <div className="max-w-3xl mx-auto text-center">
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-border/60 bg-accent/50 text-xs font-medium text-muted-foreground mb-8">
                        <span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" />
                        Now with real-time sync
                    </div>
                    <h1 className="text-5xl sm:text-6xl font-bold tracking-[-0.03em] leading-[1.08] mb-6">
                        Your workspace.
                        <br />
                        <span className="bg-gradient-to-r from-indigo-400 via-indigo-500 to-purple-400 bg-clip-text text-transparent">
                            Your way.
                        </span>
                    </h1>
                    <p className="text-lg text-muted-foreground max-w-lg mx-auto mb-10 leading-relaxed">
                        Write, plan, and organize — all in one place. A powerful document editor
                        with databases, nested pages, and real-time sync.
                    </p>
                    <div className="flex items-center justify-center gap-3">
                        <Link
                            href="/signup"
                            className="font-semibold bg-primary text-primary-foreground px-8 py-3 rounded-lg text-[15px] hover:opacity-90 transition-all shadow-[0_2px_12px_rgba(99,102,241,0.25)] hover:shadow-[0_4px_20px_rgba(99,102,241,0.35)]"
                        >
                            Get started free
                        </Link>
                        <Link
                            href="/login"
                            className="font-medium text-foreground border border-border px-8 py-3 rounded-lg text-[15px] hover:bg-accent transition-colors"
                        >
                            Log in
                        </Link>
                    </div>
                </div>
            </section>

            {/* Feature cards */}
            <section className="pb-28 px-6">
                <div className="max-w-5xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="group p-6 rounded-xl border border-border/60 bg-card hover:border-primary/20 hover:shadow-[0_4px_24px_rgba(99,102,241,0.06)] transition-all duration-300">
                        <div className="w-10 h-10 rounded-lg bg-indigo-500/10 flex items-center justify-center mb-4 group-hover:bg-indigo-500/15 transition-colors">
                            <svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="text-indigo-400">
                                <rect x="3" y="2" width="14" height="16" rx="2" />
                                <line x1="7" y1="7" x2="13" y2="7" />
                                <line x1="7" y1="11" x2="11" y2="11" />
                            </svg>
                        </div>
                        <h3 className="font-semibold text-foreground mb-1.5 tracking-[-0.01em]">Rich Documents</h3>
                        <p className="text-sm text-muted-foreground leading-relaxed">
                            A powerful block editor with headings, lists, code blocks, images,
                            tables, and more. Slash commands make it fast.
                        </p>
                    </div>

                    <div className="group p-6 rounded-xl border border-border/60 bg-card hover:border-primary/20 hover:shadow-[0_4px_24px_rgba(99,102,241,0.06)] transition-all duration-300">
                        <div className="w-10 h-10 rounded-lg bg-violet-500/10 flex items-center justify-center mb-4 group-hover:bg-violet-500/15 transition-colors">
                            <svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="text-violet-400">
                                <rect x="2" y="3" width="16" height="14" rx="2" />
                                <line x1="2" y1="7" x2="18" y2="7" />
                                <line x1="2" y1="11" x2="18" y2="11" />
                                <line x1="8" y1="3" x2="8" y2="17" />
                            </svg>
                        </div>
                        <h3 className="font-semibold text-foreground mb-1.5 tracking-[-0.01em]">Databases</h3>
                        <p className="text-sm text-muted-foreground leading-relaxed">
                            Inline databases with table, board, and list views.
                            Custom properties, filters, and kanban boards.
                        </p>
                    </div>

                    <div className="group p-6 rounded-xl border border-border/60 bg-card hover:border-primary/20 hover:shadow-[0_4px_24px_rgba(99,102,241,0.06)] transition-all duration-300">
                        <div className="w-10 h-10 rounded-lg bg-emerald-500/10 flex items-center justify-center mb-4 group-hover:bg-emerald-500/15 transition-colors">
                            <svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="text-emerald-400">
                                <path d="M4 4h4v4H4zM12 4h4v4h-4zM4 12h4v4H4z" />
                                <line x1="14" y1="12" x2="14" y2="18" />
                                <line x1="11" y1="15" x2="17" y2="15" />
                            </svg>
                        </div>
                        <h3 className="font-semibold text-foreground mb-1.5 tracking-[-0.01em]">Nested Pages</h3>
                        <p className="text-sm text-muted-foreground leading-relaxed">
                            Organize your work with infinite nesting. Create subpages,
                            collapse trees, and navigate with breadcrumbs.
                        </p>
                    </div>
                </div>
            </section>

            {/* Bottom CTA */}
            <section className="border-t border-border/50 py-20 px-6">
                <div className="max-w-xl mx-auto text-center">
                    <h2 className="text-2xl font-bold mb-3 tracking-[-0.02em]">Start building today</h2>
                    <p className="text-muted-foreground mb-8">
                        Free to use. No credit card required.
                    </p>
                    <Link
                        href="/signup"
                        className="inline-block font-semibold bg-primary text-primary-foreground px-8 py-3 rounded-lg text-[15px] hover:opacity-90 transition-all shadow-[0_2px_12px_rgba(99,102,241,0.25)]"
                    >
                        Sign up
                    </Link>
                </div>
            </section>

            {/* Footer */}
            <footer className="border-t border-border/40 py-8 px-6 bg-accent/30">
                <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3 text-sm text-muted-foreground">
                    <span>&copy; {new Date().getFullYear()} Taxstar</span>
                    <span className="flex items-center gap-1.5 text-muted-foreground/60 text-xs">
                        Made with
                        <span className="font-medium text-muted-foreground">Next.js</span>
                        +
                        <span className="font-medium text-muted-foreground">Convex</span>
                    </span>
                </div>
            </footer>
        </div>
    );
}
