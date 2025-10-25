'use client';
import { OfferCard } from '@/components/manual/FoodOfferCard';
import { FoodOfferRequestExtended, getAllOffersByLocationHandler } from '@/services/location/getAllOffersByLocationHandler';
import { getRestrauntByid } from '@/services/restraunt/getRestrauntById';
import { addWebSocketListener, removeWebSocketListener } from '@/components/manual/WebSocketProvider';
import { useAuthStore } from '@/store/userStore';
import { WebSocketMessage } from '@/types/websocket';
import React, { useEffect, useState, useCallback } from 'react';
import RestaurantAnalyticsPage from '@/components/manual/RestaurantAnalyticsPage';

const LiveOffersServicePage = () => {
  const [offers, setOffers] = useState<FoodOfferRequestExtended[]>([]);
  const [restaurants, setRestaurants] = useState<{ [key: number]: unknown }>({});
  const { user } = useAuthStore();

  const getRestaurant = useCallback(async (restaurantId: number) => {
    try {
      const rest = await getRestrauntByid(restaurantId.toString());
      setRestaurants((prev) => ({ ...prev, [restaurantId]: rest }));
      return rest;
    } catch (error) {
      console.error('Error fetching restaurant:', error);
      return null;
    }
  }, []);

  const fetchLiveOffers = useCallback(async () => {
    try {
      if (user && user.latitude && user.longitude) {
        console.log('Fetching live offers...');
        const response = await getAllOffersByLocationHandler(user.latitude, user.longitude);
        setOffers(response);

        // Fetch restaurants for all offers
        response.forEach((offer: FoodOfferRequestExtended) => {
          if (!restaurants[offer.restaurantId]) {
            getRestaurant(offer.restaurantId);
          }
        });
      }
    } catch (error) {
      console.error('Error fetching offers:', error);
    }
  }, [user, getRestaurant, restaurants]);

  // WebSocket message handler
  const handleWebSocketMessage = useCallback((data: WebSocketMessage) => {
    console.log('LiveOffersServicePage received WebSocket message:', data);

    if (data.type === 'NEW_OFFER' || data.type === 'FOOD_QUANTITY_UPDATED') {
      console.log('Refreshing offers due to:', data.type);
      fetchLiveOffers();
    }
  }, [fetchLiveOffers]);

  // Register WebSocket listener
  useEffect(() => {
    addWebSocketListener(handleWebSocketMessage);

    return () => {
      removeWebSocketListener(handleWebSocketMessage);
    };
  }, [handleWebSocketMessage]);

  // Initial data fetch
  useEffect(() => {
    fetchLiveOffers();
  }, [fetchLiveOffers]);
  if (user?.role === "OWNER") return <RestaurantAnalyticsPage />

  return (
    <div className="container mx-auto p-4 pt-24">
      <div className="flex items-center mx-auto space-x-4 justify-center">      <div className='h-5 w-5 mb-1 animate-bounce rounded-full bg-green-400' />
        <h1 className="text-4xl text-center font-bold mb-4">Live Food Offers</h1>
      </div>
      {!user?.latitude || !user?.longitude ? (
        <p className="text-red-500">Please enable location access to see live offers</p>
      ) : offers.length === 0 ? (
        <p>No live offers available in your area</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {offers.map((offer) => (
            <OfferCard
              key={offer.id}
              offer={offer}
              // @typescript-eslint/no-explicit-any
              restaurant={restaurants[offer.restaurantId] as any}
              onOrderSuccess={fetchLiveOffers}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default LiveOffersServicePage;