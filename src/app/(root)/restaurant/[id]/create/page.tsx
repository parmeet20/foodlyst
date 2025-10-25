"use client";

import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { format } from "date-fns";
import { Calendar as CalendarIcon } from "lucide-react";
import { z } from "zod";
import { useParams, useRouter } from "next/navigation";
import { toast } from "sonner";
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { createFoodOffer } from "@/services/foodOffer/createFoodOffer";
import { useAuthStore } from "@/store/userStore";
import { FoodOfferRequestSchema, FoodType } from "@/types";
import { ENV } from "@/config/envConfig";

const ExtendedFoodOfferRequestSchema = FoodOfferRequestSchema.extend({
    imageUrl: z.union([z.instanceof(File), z.string(), z.null()]).optional(),
});

type ExtendedFoodOfferRequest = z.infer<typeof ExtendedFoodOfferRequestSchema>;

const CreateOffer = () => {
    const params = useParams();
    const router = useRouter();
    const id = Number(params?.id);
    const { token, user } = useAuthStore();
    const [fromDate, setFromDate] = useState<Date | undefined>();
    const [toDate, setToDate] = useState<Date | undefined>();
    const [previewImage, setPreviewImage] = useState<string | null>(null);
    const [uploading, setUploading] = useState(false);

    const form = useForm<ExtendedFoodOfferRequest>({
        // @typescript-eslint/no-explicit-any
        resolver: zodResolver(ExtendedFoodOfferRequestSchema) as unknown as any,
        defaultValues: {
            isActive: true,
            restaurantId: id,
            latitude: user?.latitude,
            longitude: user?.longitude,
            type: FoodType.VEG,
            imageUrl: null,
        },
    });

    if (!token) {
        toast.error("Authentication required.");
        return null;
    }

    async function uploadToCloudinary(file: File): Promise<string> {
        if (!file.type.startsWith("image/")) throw new Error("Please upload a valid image file");
        if (file.size > 10 * 1024 * 1024) throw new Error("Image size must be less than 10MB");

        setUploading(true);
        const formData = new FormData();
        formData.append("file", file);
        formData.append("upload_preset", "estateWebsite"); // Verify this
        formData.append("cloud_name", ENV.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME); // Verify this

        try {
            const res = await fetch("https://api.cloudinary.com/v1_1/dttieo9rb/image/upload", {
                method: "POST",
                body: formData,
            });
            const data = await res.json();
            if (data.secure_url) return data.secure_url;
            throw new Error("Image upload failed");
        } catch {
            throw new Error("Failed to upload image");
        } finally {
            setUploading(false);
        }
    }

    const onSubmit = async (data: ExtendedFoodOfferRequest) => {
        try {
            if (!fromDate || !toDate) {
                toast.error("Please select both start and end dates.");
                return;
            }

            let imageUrl: string | undefined;
            if (data.imageUrl instanceof File) {
                imageUrl = await uploadToCloudinary(data.imageUrl);
            } else if (typeof data.imageUrl === "string") {
                imageUrl = data.imageUrl;
            }

            const offerData: z.infer<typeof FoodOfferRequestSchema> = {
                ...data,
                availableFrom: fromDate.toISOString(),
                availableTo: toDate.toISOString(),
                imageUrl: imageUrl || "", // Ensure imageUrl is string or empty
            };

            const res = await createFoodOffer(offerData, token);
            if (res) {
                toast.success("Food Offer created successfully!");
                router.push(`/restaurant/${id}`);
            } else {
                toast.error("Failed to create food offer.");
            }
        } catch (err) {
            toast.error("Something went wrong.");
        } finally {
            if (previewImage) {
                URL.revokeObjectURL(previewImage);
                setPreviewImage(null);
            }
        }
    };
    if (user?.role !== "OWNER") {
        return <div className="flex justify-center items-center min-h-screen">
            <h1 className="text-2xl font-bold">Access Denied: Only restaurant owners can create food offers.</h1>
        </div>
    }

    return (
        <main className="min-h-screen bg-gradient-to-b from-green-50 to-white dark:from-gray-950 dark:to-black p-6 flex justify-center items-center">
            <Card className="w-full max-w-3xl shadow-xl border border-gray-200 dark:border-gray-800">
                <CardHeader>
                    <CardTitle className="text-3xl font-bold text-center text-green-700 dark:text-green-400">
                        Create New Food Offer
                    </CardTitle>
                </CardHeader>

                <CardContent>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                        <div>
                            <Label>Food Name</Label>
                            <Input {...form.register("foodName")} placeholder="e.g. Chicken Curry Combo" />
                            {form.formState.errors.foodName && (
                                <p className="text-red-500 text-sm">{form.formState.errors.foodName.message}</p>
                            )}
                        </div>

                        <div>
                            <Label>Food Type</Label>
                            <Select
                                onValueChange={(val) => form.setValue("type", val as FoodType)}
                                defaultValue={FoodType.VEG}
                            >
                                <SelectTrigger>
                                    <SelectValue placeholder="Select type" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value={FoodType.VEG}>VEG</SelectItem>
                                    <SelectItem value={FoodType.NON_VEG}>NON VEG</SelectItem>
                                    <SelectItem value={FoodType.DESSERT}>DESSERT</SelectItem>
                                    <SelectItem value={FoodType.SNACK}>SNACK</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div>
                                <Label>Quantity</Label>
                                <Input type="number" {...form.register("quantity")} />
                                {form.formState.errors.quantity && (
                                    <p className="text-red-500 text-sm">{form.formState.errors.quantity.message}</p>
                                )}
                            </div>
                            <div>
                                <Label>Max per Person</Label>
                                <Input type="number" {...form.register("maxPerPerson")} />
                                {form.formState.errors.maxPerPerson && (
                                    <p className="text-red-500 text-sm">{form.formState.errors.maxPerPerson.message}</p>
                                )}
                            </div>
                            <div>
                                <Label>Price per Quantity</Label>
                                <Input type="number" step="any" {...form.register("perQtyPrice")} />
                                {form.formState.errors.perQtyPrice && (
                                    <p className="text-red-500 text-sm">{form.formState.errors.perQtyPrice.message}</p>
                                )}
                            </div>
                        </div>

                        <div>
                            <Label>Image</Label>
                            <Input
                                type="file"
                                accept="image/*"
                                onChange={(e) => {
                                    const file = e.target.files?.[0];
                                    if (file) {
                                        form.setValue("imageUrl", file);
                                        const previewUrl = URL.createObjectURL(file);
                                        setPreviewImage(previewUrl);
                                    } else {
                                        form.setValue("imageUrl", null);
                                        setPreviewImage(null);
                                    }
                                }}
                            />
                            {form.formState.errors.imageUrl && (
                                <p className="text-red-500 text-sm">{form.formState.errors.imageUrl.message}</p>
                            )}
                            {previewImage && (
                                <div className="mt-4">
                                    <img
                                        src={previewImage}
                                        alt="Offer Preview"
                                        className="w-full h-48 object-cover rounded-md"
                                    />
                                </div>
                            )}
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="flex flex-col space-y-2">
                                <Label>Available From</Label>
                                <Popover>
                                    <PopoverTrigger asChild>
                                        <Button
                                            variant="outline"
                                            className={cn(
                                                "w-full justify-start text-left font-normal",
                                                !fromDate && "text-muted-foreground"
                                            )}
                                        >
                                            <CalendarIcon className="mr-2 h-4 w-4" />
                                            {fromDate ? format(fromDate, "PPP p") : <span>Select start date</span>}
                                        </Button>
                                    </PopoverTrigger>
                                    <PopoverContent className="w-auto p-0" align="start">
                                        <Calendar
                                            mode="single"
                                            selected={fromDate}
                                            onSelect={setFromDate}
                                            initialFocus
                                        />
                                    </PopoverContent>
                                </Popover>
                            </div>

                            <div className="flex flex-col space-y-2">
                                <Label>Available To</Label>
                                <Popover>
                                    <PopoverTrigger asChild>
                                        <Button
                                            variant="outline"
                                            className={cn(
                                                "w-full justify-start text-left font-normal",
                                                !toDate && "text-muted-foreground"
                                            )}
                                        >
                                            <CalendarIcon className="mr-2 h-4 w-4" />
                                            {toDate ? format(toDate, "PPP p") : <span>Select end date</span>}
                                        </Button>
                                    </PopoverTrigger>
                                    <PopoverContent className="w-auto p-0" align="start">
                                        <Calendar
                                            mode="single"
                                            selected={toDate}
                                            onSelect={setToDate}
                                            initialFocus
                                        />
                                    </PopoverContent>
                                </Popover>
                            </div>
                        </div>

                        <div className="flex justify-center pt-4">
                            <Button
                                type="submit"
                                className="px-8 py-2 text-lg bg-green-600 hover:bg-green-700"
                                disabled={uploading || form.formState.isSubmitting}
                            >
                                {uploading ? "Uploading..." : form.formState.isSubmitting ? "Submitting..." : "Submit Offer"}
                            </Button>
                        </div>
                    </form>
                </CardContent>
            </Card>
        </main>
    );
};

export default CreateOffer;