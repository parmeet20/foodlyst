"use client";

import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  CardFooter,
} from "@/components/ui/card";
import { toast } from "sonner";
import { RestaurantInputSchemaType, RestaurantInputSchema, createRestaurant } from "@/services/restraunt/createRestraunt";
import { useAuthStore } from "@/store/userStore";
import { ENV } from "@/config/envConfig";

const uploadToCloudinary = async (file: File): Promise<string> => {
  if (!file.type.startsWith("image/")) throw new Error("Please upload a valid image file");
  if (file.size > 10 * 1024 * 1024) throw new Error("Image size must be less than 10MB");

  const formData = new FormData();
  formData.append("file", file);
  formData.append("upload_preset", "estateWebsite");
  formData.append("cloud_name", ENV.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME);

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
  }
};

const CreateRestrauntPage = () => {
  const [loading, setLoading] = useState(false);
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const { token, user } = useAuthStore();

  const form = useForm<RestaurantInputSchemaType>({
    resolver: zodResolver(RestaurantInputSchema),
    defaultValues: {
      name: "",
      email: "",
      imageUrl: "",
      contactNumber: "",
      latitude: 0,
      longitude: 0,
    },
  });

  if (!token) return <>User unauthenticated</>;

  const onSubmit = async (values: RestaurantInputSchemaType) => {
    try {
      setLoading(true);
      let imageUrl = values.imageUrl;
      if (selectedFile) {
        imageUrl = await uploadToCloudinary(selectedFile);
        form.setValue("imageUrl", imageUrl);
      }
      const newRestaurant = await createRestaurant({ ...values, imageUrl }, token);
      if (newRestaurant) {
        toast.success("✅ Restaurant created successfully!", {
          description: `${newRestaurant.name} has been added.`,
        });
        form.reset();
        setPreviewImage(null);
        setSelectedFile(null);
      } else {
        toast.error("❌ Failed to create restaurant");
      }
    } catch (error: any) {
      toast.error("Error", {
        description: error.message || "Something went wrong",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      toast.error("Error", { description: "Please upload a valid image file" });
      return;
    }
    if (file.size > 10 * 1024 * 1024) {
      toast.error("Error", { description: "Image size must be less than 10MB" });
      return;
    }

    setSelectedFile(file);
    const reader = new FileReader();
    reader.onloadend = () => {
      setPreviewImage(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleRemoveImage = () => {
    setPreviewImage(null);
    setSelectedFile(null);
    form.setValue("imageUrl", "");
  };

  if (user?.role !== "OWNER") {
    return <div className="flex justify-center items-center min-h-screen">
      <h1 className="text-2xl font-bold">Access Denied: Only restaurant owners can create a restaurant.</h1>
    </div>
  }

  return (
    <div className="flex justify-center pt-24 items-center min-h-screen px-4">
      <Card className="w-full max-w-lg shadow-2xl rounded-2xl">
        <CardHeader>
          <CardTitle className="text-center text-2xl font-bold bg-gradient-to-r from-green-600 to-blue-600 bg-clip-text text-transparent">
            Create New Restaurant
          </CardTitle>
        </CardHeader>

        <CardContent>
          <Form {...form}>
            <div className="space-y-5">
              {/* Name */}
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Restaurant Name</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="Enter restaurant name"
                        {...field}
                      />
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
                      <Input
                        type="email"
                        placeholder="restaurant@example.com"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Contact Number */}
              <FormField
                control={form.control}
                name="contactNumber"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Contact Number</FormLabel>
                    <FormControl>
                      <Input
                        type="tel"
                        placeholder="+91 9876543210"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Image Upload */}
              <FormField
                control={form.control}
                name="imageUrl"
                render={() => (
                  <FormItem>
                    <FormLabel>Restaurant Image</FormLabel>
                    <FormControl>
                      <Input
                        type="file"
                        accept="image/*"
                        onChange={handleImageChange}
                        disabled={loading}
                      />
                    </FormControl>
                    {previewImage && (
                      <div className="mt-2">
                        <img
                          src={previewImage}
                          alt="Restaurant preview"
                          className="w-full h-40 object-cover rounded"
                        />
                        <Button
                          variant="destructive"
                          className="mt-2 w-full rounded-full"
                          onClick={handleRemoveImage}
                          disabled={loading}
                        >
                          Remove Image
                        </Button>
                      </div>
                    )}
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Latitude */}
              <FormField
                control={form.control}
                name="latitude"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Latitude</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        step="any"
                        placeholder="e.g., 28.6139"
                        {...field}
                        onChange={(e) =>
                          field.onChange(parseFloat(e.target.value))
                        }
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Longitude */}
              <FormField
                control={form.control}
                name="longitude"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Longitude</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        step="any"
                        placeholder="e.g., 77.2090"
                        {...field}
                        onChange={(e) =>
                          field.onChange(parseFloat(e.target.value))
                        }
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <Button
                type="submit"
                className="w-full rounded-full"
                disabled={loading}
                onClick={form.handleSubmit(onSubmit)}
              >
                {loading ? "Processing..." : "Create Restaurant"}
              </Button>
            </div>
          </Form>
        </CardContent>

        <CardFooter className="flex justify-center text-sm text-muted-foreground">
          Help save food, reduce waste 🌍
        </CardFooter>
      </Card>
    </div>
  );
};

export default CreateRestrauntPage;