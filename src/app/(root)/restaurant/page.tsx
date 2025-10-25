"use client";

import { getAllRestraunts } from "@/services/restraunt/getAllRestraunts";
import React, { useEffect, useState } from "react";
import RestaurantCard from "@/components/manual/RestrauntCard";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { Restaurant } from "@/types";
import { useAuthStore } from "@/store/userStore";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

const RestrauntListPage = () => {
  const { user } = useAuthStore();
  const [restraunts, setRestraunts] = useState<Restaurant[]>([]);

  const fetchRestraunts = async () => {
    const restrauntsAll = await getAllRestraunts();
    setRestraunts(restrauntsAll);
  };

  useEffect(() => {
    fetchRestraunts();
  }, []);

  const myRestaurants = restraunts.filter(
    (restaurant) => restaurant.ownerId === user?.id
  );

  return (
    <div className="max-w-7xl mx-auto px-4 pt-24 py-8">
      <h1 className="text-3xl font-bold mb-6 text-center">
        Discover Restaurants 🍴
      </h1>
      {user?.role === "OWNER" && (
        <>
          <Button className="mb-4">
            <Link href="/restaurant/create">Create</Link>
          </Button>
          <Tabs defaultValue="restaurants" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="restaurants">Restaurants</TabsTrigger>
              <TabsTrigger value="myRestaurants">My Restaurants</TabsTrigger>
            </TabsList>
            <TabsContent value="restaurants">
              {restraunts.length === 0 ? (
                <p className="text-center text-muted-foreground">
                  No restaurants found.
                </p>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                  {restraunts.map((restaurant) => (
                    <RestaurantCard key={restaurant.id} restaurant={restaurant} />
                  ))}
                </div>
              )}
            </TabsContent>
            <TabsContent value="myRestaurants">
              {myRestaurants.length === 0 ? (
                <p className="text-center text-muted-foreground">
                  No restaurants found.
                </p>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                  {myRestaurants.map((restaurant) => (
                    <RestaurantCard key={restaurant.id} restaurant={restaurant} />
                  ))}
                </div>
              )}
            </TabsContent>
          </Tabs>
        </>
      )}
      {user?.role !== "OWNER" && (
        <>
          {restraunts.length === 0 ? (
            <p className="text-center text-muted-foreground">
              No restaurants found.
            </p>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {restraunts.map((restaurant) => (
                <RestaurantCard key={restaurant.id} restaurant={restaurant} />
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default RestrauntListPage;