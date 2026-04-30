"use client";

import { ShieldCheck, Lock, UserCircle, Eye } from "lucide-react";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";

export default function TrustIndicator() {
    return (
        <Dialog>
            <DialogTrigger asChild>
                <button
                    className="fixed bottom-4 right-4 z-50 w-8 h-8 rounded-full bg-card border border-border flex items-center justify-center text-muted-foreground hover:text-primary hover:border-primary/40 transition-colors shadow-sm cursor-pointer"
                    title="Your data is protected"
                >
                    <ShieldCheck size={16} strokeWidth={2.5} />
                </button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-sm">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2 text-sm font-semibold">
                        <ShieldCheck size={18} strokeWidth={2.5} className="text-primary" />
                        Your data is protected
                    </DialogTitle>
                </DialogHeader>
                <div className="flex flex-col gap-3 text-xs text-muted-foreground">
                    <div className="flex items-start gap-2.5">
                        <Lock size={15} strokeWidth={2.5} className="text-foreground shrink-0 mt-0.5" />
                        <div>
                            <p className="text-foreground font-medium">Encrypted at rest</p>
                            <p>All data is stored securely with encryption via Convex's infrastructure.</p>
                        </div>
                    </div>
                    <div className="flex items-start gap-2.5">
                        <UserCircle size={15} strokeWidth={2.5} className="text-foreground shrink-0 mt-0.5" />
                        <div>
                            <p className="text-foreground font-medium">Authenticated sessions</p>
                            <p>Your identity is verified with secure, HTTP-only session tokens.</p>
                        </div>
                    </div>
                    <div className="flex items-start gap-2.5">
                        <Eye size={15} strokeWidth={2.5} className="text-foreground shrink-0 mt-0.5" />
                        <div>
                            <p className="text-foreground font-medium">Private by default</p>
                            <p>Only you can access your pages. No data is shared unless you choose to.</p>
                        </div>
                    </div>
                </div>
                <div className="pt-1 border-t border-border">
                    <p className="text-[10px] text-muted-foreground">
                        Powered by Convex + Better Auth. End-to-end encryption coming with shared pages.
                    </p>
                </div>
            </DialogContent>
        </Dialog>
    );
}
