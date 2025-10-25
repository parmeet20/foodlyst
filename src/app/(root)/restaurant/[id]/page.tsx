"use client";

import React, { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { Restaurant, FoodOfferRequest } from "@/types";
import { getRestrauntByid } from "@/services/restraunt/getRestrauntById";
import { OfferCard } from "@/components/manual/FoodOfferCard";
import {
  Card,
  CardContent,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { getFoodOffersByRestraunt } from "@/services/foodOffer/foodOfferService";
import { useAuthStore } from "@/store/userStore";
import { Button } from "@/components/ui/button";
import Link from "next/link";

const RestaurantDetailPage = () => {
  const params = useParams();
  const id = params?.id?.toString();
  const { user } = useAuthStore();
  const [restaurant, setRestaurant] = useState<Restaurant | null>(null);
  const [offers, setOffers] = useState<FoodOfferRequest[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const { token } = useAuthStore();

  const fetch = async () => {
    try {
      const rest = await getRestrauntByid(id!);
      setRestaurant(rest);
      if (!rest) return;
      const fetchedOffers = await getFoodOffersByRestraunt(rest.id.toString(), token!);
      setOffers(fetchedOffers);

      // Debug logs
      console.log("Fetched restaurant id:", rest?.id);
      console.log("Param id:", id);
      console.log("All offers:", fetchedOffers);
    } catch (err) {
      console.error("Fetch failed", err);
    } finally {
      setLoading(false);
    }
  };
  useEffect(() => {
    if (!id) {
      setLoading(false);
      return;
    }


    fetch();
  }, [id]);

  const handleOrderSuccess = () => {
    // Refresh offers when an order is successfully placed
    fetch();
  };


  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p className="text-muted-foreground text-lg">Loading restaurant...</p>
      </div>
    );
  }

  if (!restaurant) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p className="text-destructive text-lg">Restaurant not found</p>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-6 py-10 space-y-10">
      {/* Restaurant Details Card */}
      <Card className="rounded-3xl shadow-xl overflow-hidden">
        <CardContent className="px-6 py-6">
          <div className="flex flex-col md:flex-row md:justify-between md:items-center space-y-4 md:space-y-0">
            <div>
              <h1 className="text-4xl font-bold">{restaurant.name}</h1>
            </div>
            <div className="space-y-1 text-sm text-muted-foreground">
              <p>Email: {restaurant.email}</p>
              <p>Contact: {restaurant.contactNumber}</p>
              <p>
                Location: {restaurant.latitude.toFixed(4)},{" "}
                {restaurant.longitude.toFixed(4)}
              </p>
              <p>Rating: {restaurant.rating.toFixed(1)} ★</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* <Button>Create Offer</Button> */}
      {user?.role === "OWNER" && <Button>
        <Link href={`/restaurant/${id}/create`}>Create Offer</Link>
      </Button>
      }
      <Separator />

      {/* Live Offers Section */}
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div className="flex items-center space-x-2">
            <div className="h-5 w-5 bg-green-500 mt-[5px] rounded-full animate-pulse" />
            <h2 className="text-2xl font-semibold">Live Offers</h2></div>
          <Badge variant="outline">{offers.length} Active</Badge>
        </div>
        {offers.length === 0 ? (
          <div className="text-center text-muted-foreground">
            No offers available right now.
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            {offers.map((offer) => (
              <OfferCard
                key={offer.id}
                offer={offer}
                restaurant={restaurant}
                onOrderSuccess={handleOrderSuccess}
                onOrder={(o) => {
                  console.log("Ordering offer:", o);
                  // You can implement your order logic here
                }}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default RestaurantDetailPage;
