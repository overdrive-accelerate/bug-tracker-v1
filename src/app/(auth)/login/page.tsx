"use client";

import { authClient } from "@/lib/auth-client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { toast } from "sonner";

const loginSchema = z.object({
    email: z.email("Invalid email address"),
    password: z.string().min(8, "Password must be at least 8 characters"),
});

export default function LoginPage() {
    const router = useRouter();
    const { data: session, isPending } = authClient.useSession();

    const { control, handleSubmit, formState } = useForm({
        resolver: zodResolver(loginSchema),
        defaultValues: { email: "", password: "" },
    });

    // Client-side fallback: if session appears (e.g., logged in on another tab), redirect
    useEffect(() => {
        if (session) {
            router.replace("/home");
        }
    }, [session, router]);

    const onSubmit = async (data: z.infer<typeof loginSchema>) => {
        const result = await authClient.signIn.email({
            email: data.email,
            password: data.password,
        });
        if (result.error) {
            toast.error(result.error.message || "Invalid email or password");
        } else {
            toast.success("Welcome back!");
            router.push("/home");
            router.refresh();
        }
    };

    // Show loading while session state is resolving
    if (isPending || session) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-background">
                <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
            </div>
        );
    }

    return (
        <div className="min-h-screen flex flex-col items-center justify-center bg-background p-4">
            <div className="w-full max-w-[400px]">
                {/* Logo */}
                <div className="flex flex-col items-center mb-8">
                    <div className="w-10 h-10 bg-gradient-to-br from-indigo-400 to-indigo-600 rounded-xl flex items-center justify-center text-white text-lg font-extrabold mb-5 shadow-[0_4px_16px_rgba(99,102,241,0.3)]">
                        T
                    </div>
                    <h1 className="text-2xl font-bold text-foreground tracking-[-0.02em]">Welcome back</h1>
                    <p className="text-sm text-muted-foreground mt-1">
                        Log in to your Taxstar account
                    </p>
                </div>

                <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                    <div className="space-y-1.5">
                        <Label htmlFor="email" className="text-[13px]">
                            Email
                        </Label>
                        <Controller
                            name="email"
                            control={control}
                            render={({ field, fieldState }) => (
                                <>
                                    <Input
                                        id="email"
                                        type="email"
                                        placeholder="Enter your email address..."
                                        className="h-10"
                                        {...field}
                                    />
                                    {fieldState.error && (
                                        <p className="text-xs text-destructive mt-1">
                                            {fieldState.error.message}
                                        </p>
                                    )}
                                </>
                            )}
                        />
                    </div>

                    <div className="space-y-1.5">
                        <Label htmlFor="password" className="text-[13px]">
                            Password
                        </Label>
                        <Controller
                            name="password"
                            control={control}
                            render={({ field, fieldState }) => (
                                <>
                                    <Input
                                        id="password"
                                        type="password"
                                        placeholder="Enter your password..."
                                        className="h-10"
                                        {...field}
                                    />
                                    {fieldState.error && (
                                        <p className="text-xs text-destructive mt-1">
                                            {fieldState.error.message}
                                        </p>
                                    )}
                                </>
                            )}
                        />
                    </div>

                    <Button
                        type="submit"
                        className="w-full h-10 font-medium"
                        disabled={formState.isSubmitting}
                    >
                        {formState.isSubmitting ? "Signing in..." : "Continue"}
                    </Button>
                </form>

                <p className="text-center text-sm text-muted-foreground mt-6">
                    New user?{" "}
                    <Link href="/signup" className="text-primary hover:underline font-medium">
                        Sign up
                    </Link>
                </p>
            </div>
        </div>
    );
}
