"use client";

import React, { useEffect, useState } from "react";
import {
    Card,
    CardHeader,
    CardTitle,
    CardDescription,
    CardContent,
    CardFooter,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { format } from "date-fns";
import { FoodOfferRequest, Restaurant } from "@/types";
import { OrderDrawer } from "@/components/manual/OrderDrawer";

interface OfferCardProps {
    offer: FoodOfferRequest;
    restaurant: Restaurant;
    onOrder?: (offer: FoodOfferRequest) => void;
    onOrderSuccess?: () => void; 
}

export const OfferCard: React.FC<OfferCardProps> = ({
    offer,
    restaurant,
    onOrderSuccess
}) => {
    const {
        foodName,
        type,
        remainingQty,
        quantity,
        maxPerPerson,
        perQtyPrice,
        availableFrom,
        availableTo,
        imageUrl,
    } = offer;

    const fromDate = availableFrom
        ? format(new Date(availableFrom), "PPP p")
        : "N/A";
    const toDate = availableTo ? format(new Date(availableTo), "PPP p") : null;
    const isExpired = availableTo ? new Date(availableTo) < new Date() : false;
    const [drawerOpen, setDrawerOpen] = useState(false);
    useEffect(() => {
    }, [])

    return (
        <Card className="hover:shadow-xl transition-shadow duration-300 rounded-2xl border overflow-hidden">
            <CardHeader className="flex justify-between items-start px-4 pt-4">
                <div>
                    <CardTitle className="text-xl font-semibold">{foodName}</CardTitle>
                    <CardDescription className="text-sm text-muted-foreground">
                        {type}
                    </CardDescription>
                </div>
                <Badge variant={isExpired ? "outline" : "secondary"}>
                    {isExpired ? "Expired" : "Available"}
                </Badge>
            </CardHeader>

            {imageUrl && (
                <div className="px-4">
                    <img
                        src={imageUrl}
                        alt={foodName}
                        className="w-full h-40 object-cover rounded"
                    />
                </div>
            )}

            <CardContent className="px-4 py-2 space-y-2">
                <div className="text-sm text-muted-foreground">
                    <p>
                        Available from: <span className="font-medium">{fromDate}</span>
                    </p>
                    {toDate && (
                        <p>
                            Until: <span className="font-medium">{toDate}</span>
                        </p>
                    )}
                    <p>
                        Remaining:{" "}
                        <span className="font-medium">{remainingQty ?? quantity}</span>
                    </p>
                    <p>
                        Max per person: <span className="font-medium">{maxPerPerson}</span>
                    </p>
                    {perQtyPrice !== undefined && (
                        <p>
                            Price per unit:{" "}
                            <span className="font-medium">₹{perQtyPrice.toFixed(2)}</span>
                        </p>
                    )}
                </div>
            </CardContent>

            <CardFooter className="px-4 pb-4 flex justify-end">
                <Button
                    onClick={() => setDrawerOpen(true)}
                    disabled={isExpired || (remainingQty ?? quantity) <= 0}
                >
                    Order Now
                </Button>

                <OrderDrawer
                    open={drawerOpen}
                    onClose={() => setDrawerOpen(false)}
                    foodName={foodName}
                    foodOfferRequestId={offer.id!}
                    availableQty={remainingQty ?? quantity}
                    pricePerQty={perQtyPrice ?? 0}
                    restaurant={restaurant}
                    onOrderSuccess={onOrderSuccess}
                    tokenMint="Gh9ZwEmdLJ8DscKNTkTqPbNwLNNBjuSzaG9Vp2KGtKJr"
                />
            </CardFooter>
        </Card>
    );
};
