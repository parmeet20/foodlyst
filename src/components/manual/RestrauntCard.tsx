"use client";

import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { Restaurant } from "@/types";
import Image from "next/image";
import { Star, MapPin } from "lucide-react";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import Link from "next/link";

interface RestaurantCardProps {
    restaurant: Restaurant;
}

export default function RestaurantCard({ restaurant }: RestaurantCardProps) {
    return (
        <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            whileHover={{ y: -5, transition: { duration: 0.2 } }}
        >
            <Card className="overflow-hidden pt-0 rounded-xl border-none shadow-sm hover:shadow-md transition-shadow duration-300 bg-white dark:bg-gray-900">
                {/* Image Section */}
                <div className="relative h-50 w-full">
                    <Image
                        src={restaurant.imageUrl}
                        alt={restaurant.name}
                        fill
                        className="object-cover"
                    />
                </div>

                <CardHeader className="p-4 pb-2">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 truncate">
                        {restaurant.name}
                    </h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400 line-clamp-2">
                        {restaurant.email} • {restaurant.contactNumber}
                    </p>
                </CardHeader>

                <CardContent className="p-4 pt-0 pb-2">
                    <div className="flex items-center gap-1 text-sm text-yellow-400 font-medium">
                        <Star className="h-4 w-4 fill-yellow-400 stroke-yellow-400" />
                        {restaurant.rating.toFixed(1)}
                        <span className="ml-2 text-gray-500 dark:text-gray-400">
                            <MapPin className="h-4 w-4 inline mr-1" />
                            ({restaurant.latitude.toFixed(2)}, {restaurant.longitude.toFixed(2)})
                        </span>
                    </div>
                </CardContent>

                <CardFooter className="p-4 pt-0">
                    <Button size="sm" className="w-full rounded-full">
                        <Link href={`restaurant/${restaurant.id}`}>View Details</Link>
                    </Button>
                </CardFooter>
            </Card>
        </motion.div>
    );
}