'use client';

import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";

import { Button } from "@/components/ui/button";
import {
    Card,
    CardContent,
    CardFooter,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";

import { loginUser } from "@/services/user/loginService";
import { toast } from "sonner";
import { useState } from "react";
import { Loader2Icon } from "lucide-react";
import { useAuthStore } from "@/store/userStore";

// ✅ Zod schema
const loginSchema = z.object({
    email: z.string().email("Invalid email address"),
    password: z.string().min(6, "Password must be at least 6 characters"),
});

type LoginFormValues = z.infer<typeof loginSchema>;

const LoginPage = () => {
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const { setUser, setToken, token } = useAuthStore();

    const form = useForm<LoginFormValues>({
        resolver: zodResolver(loginSchema),
        defaultValues: {
            email: "",
            password: "",
        },
    });
    const requestLocation = async (): Promise<{ latitude: number; longitude: number } | null> => {
        return new Promise((resolve) => {
            if (typeof window === "undefined" || !navigator.geolocation) {
                toast("Location not supported", {
                    description: "Your browser does not support geolocation.",
                });
                return resolve(null);
            }

            navigator.geolocation.getCurrentPosition(
                (position) => {
                    const { latitude, longitude } = position.coords;
                    console.log("📍 Location captured:", latitude, longitude);
                    resolve({ latitude, longitude });
                },
                (error) => {
                    let message = "We couldn't get your location. Some features may be limited.";

                    // Handle known errors better
                    switch (error.code) {
                        case error.PERMISSION_DENIED:
                            message = "Location access denied. Please enable it in your browser settings.";
                            break;
                        case error.POSITION_UNAVAILABLE:
                            message = "Location information is unavailable.";
                            break;
                        case error.TIMEOUT:
                            message = "Location request timed out. Please try again.";
                            break;
                    }

                    toast("Location Error", { description: message });
                    resolve(null);
                },
                { enableHighAccuracy: true, timeout: 10000 }
            );
        });
    };


    const onSubmit = async (values: LoginFormValues) => {
        try {
            setLoading(true);
            const loggedInUser = await loginUser(values);

            toast("Login Successful", {
                description: `Welcome back, ${loggedInUser.name || "User"}!`,
            });

            // ✅ Ask for location permission
            const location = await requestLocation();

            // ✅ Store user and token in Zustand with location if available
            const updatedUser = {
                ...loggedInUser,
                latitude: location?.latitude,
                longitude: location?.longitude,
            };

            setUser(updatedUser);
            if (token) {
                setToken(token);
            }

            router.push("/");
        } catch (err) {
            console.error(err);
            toast(
                "Invalid credentials. Please try again.",);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="flex min-h-screen items-center justify-center">
            <Card className="w-full max-w-md shadow-xl rounded-2xl">
                <CardHeader>
                    <CardTitle className="text-center text-2xl font-bold">
                        Login to Your Account
                    </CardTitle>
                </CardHeader>

                <CardContent>
                    <Form {...form}>
                        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                            {/* Email */}
                            <FormField
                                control={form.control}
                                name="email"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Email</FormLabel>
                                        <FormControl>
                                            <Input placeholder="you@example.com" {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            {/* Password */}
                            <FormField
                                control={form.control}
                                name="password"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Password</FormLabel>
                                        <FormControl>
                                            <Input type="password" placeholder="********" {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <Button type="submit" className="w-full" disabled={loading}>
                                {loading ? (
                                    <div className="flex items-center space-x-2">
                                        <Loader2Icon className="animate-spin" />
                                        <p>Please wait</p>
                                    </div>
                                ) : (
                                    "Login"
                                )}
                            </Button>
                        </form>
                    </Form>
                </CardContent>

                <CardFooter className="flex justify-center">
                    <p className="text-sm">
                        New user?{" "}
                        <button
                            onClick={() => router.push("/register")}
                            className="underline"
                            disabled={loading}
                        >
                            Sign up
                        </button>
                    </p>
                </CardFooter>
            </Card>
        </div>
    );
};

export default LoginPage;
