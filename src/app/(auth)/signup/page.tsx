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

const signupSchema = z
    .object({
        name: z.string().min(2, "Name must be at least 2 characters"),
        email: z.email("Invalid email address"),
        password: z.string().min(8, "Password must be at least 8 characters"),
        confirmPassword: z.string(),
    })
    .refine((data) => data.password === data.confirmPassword, {
        message: "Passwords don't match",
        path: ["confirmPassword"],
    });

export default function SignupPage() {
    const router = useRouter();
    const { data: session, isPending } = authClient.useSession();

    const { control, handleSubmit, formState } = useForm({
        resolver: zodResolver(signupSchema),
        defaultValues: { name: "", email: "", password: "", confirmPassword: "" },
    });

    // Client-side fallback: if session appears, redirect
    useEffect(() => {
        if (session) {
            router.replace("/home");
        }
    }, [session, router]);

    const onSubmit = async (data: z.infer<typeof signupSchema>) => {
        const result = await authClient.signUp.email({
            name: data.name,
            email: data.email,
            password: data.password,
        });
        if (result.error) {
            toast.error(result.error.message || "Failed to create account");
        } else {
            toast.success("Account created! Welcome to Taxstar.");
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
                    <h1 className="text-2xl font-bold text-foreground tracking-[-0.02em]">Create an account</h1>
                    <p className="text-sm text-muted-foreground mt-1">
                        Get started with Taxstar for free
                    </p>
                </div>

                <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                    <div className="space-y-1.5">
                        <Label htmlFor="name" className="text-[13px]">
                            Name
                        </Label>
                        <Controller
                            name="name"
                            control={control}
                            render={({ field, fieldState }) => (
                                <>
                                    <Input
                                        id="name"
                                        type="text"
                                        placeholder="Enter your name..."
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
                                        placeholder="Min. 8 characters"
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
                        <Label htmlFor="confirmPassword" className="text-[13px]">
                            Confirm password
                        </Label>
                        <Controller
                            name="confirmPassword"
                            control={control}
                            render={({ field, fieldState }) => (
                                <>
                                    <Input
                                        id="confirmPassword"
                                        type="password"
                                        placeholder="Confirm your password..."
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
                        {formState.isSubmitting ? "Creating account..." : "Continue"}
                    </Button>
                </form>

                <p className="text-center text-sm text-muted-foreground mt-6">
                    Already have an account?{" "}
                    <Link href="/login" className="text-primary hover:underline font-medium">
                        Log in
                    </Link>
                </p>
            </div>
        </div>
    );
}
