"use client";

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
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";

import { registerUser } from "@/services/user/registerService";
import { toast } from "sonner";
import { useState } from "react";
import { Loader2Icon } from "lucide-react";

// ✅ Zod schema
const signupSchema = z.object({
    name: z.string().min(2, "Name must be at least 2 characters"),
    email: z.string().email("Invalid email address"),
    password: z.string().min(6, "Password must be at least 6 characters"),
    phone: z
        .string()
        .regex(/^\+?[1-9]\d{1,14}$/, "Invalid phone number"),
    // @ts-expect-error - TypeScript may incorrectly flag the enum constraint
    role: z.enum(["USER", "OWNER"] as const, { required_error: "Please select a role" }),
});

type SignupFormValues = z.infer<typeof signupSchema>;

const SignupPage = () => {
    const router = useRouter();
    const [loading, setLoading] = useState<boolean>(false);

    const form = useForm<SignupFormValues>({
        resolver: zodResolver(signupSchema),
        defaultValues: {
            name: "",
            email: "",
            password: "",
            phone: "",
            role: "USER",
        },
    });

    const onSubmit = async (values: SignupFormValues) => {
        setLoading(true);
        try {
            const newUser = await registerUser(values);
            console.log("✅ Registered user:", newUser);

            toast("Signup success", {
                description: "You can now login with your credentials.",
            });

            router.push("/login");
        } catch (err) {
            console.error("❌ Signup error:", err);
            toast.error("Something went wrong. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="flex pt-24 h-screen items-center justify-center">
            <Card className="w-full max-w-md shadow-xl rounded-2xl">
                <CardHeader>
                    <CardTitle className="text-center text-2xl font-bold">
                        Create an Account
                    </CardTitle>
                </CardHeader>

                <CardContent>
                    <Form {...form}>
                        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                            {/* Name */}
                            <FormField
                                control={form.control}
                                name="name"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Name</FormLabel>
                                        <FormControl>
                                            <Input placeholder="John Doe" {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

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

                            {/* Phone */}
                            <FormField
                                control={form.control}
                                name="phone"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Phone</FormLabel>
                                        <FormControl>
                                            <Input placeholder="+919876543210" {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            {/* Role */}
                            <FormField
                                control={form.control}
                                name="role"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Role</FormLabel>
                                        <Select
                                            onValueChange={field.onChange}
                                            defaultValue={field.value}
                                        >
                                            <FormControl>
                                                <SelectTrigger>
                                                    <SelectValue placeholder="Select a role" />
                                                </SelectTrigger>
                                            </FormControl>
                                            <SelectContent>
                                                <SelectItem value="USER">User</SelectItem>
                                                <SelectItem value="OWNER">Owner</SelectItem>
                                            </SelectContent>
                                        </Select>
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
                                ) : "Sign Up"}
                            </Button>
                        </form>
                    </Form>
                </CardContent>

                <CardFooter className="flex justify-center">
                    <p className="text-sm">
                        Already a user?{" "}
                        <button
                            onClick={() => router.push("/login")}
                            className="underline"
                        >
                            Login
                        </button>
                    </p>
                </CardFooter>
            </Card>
        </div>
    );
};

export default SignupPage;