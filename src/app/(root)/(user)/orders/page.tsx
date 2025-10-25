'use client';
import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogFooter,
} from '@/components/ui/dialog';
import { Loader2, Utensils, Copy, Undo2, Star } from 'lucide-react';
import { Restaurant, FoodOfferRequest, GrabOffer } from '@/types';
import { format } from 'date-fns';
import { useRouter } from 'next/navigation';
import { getAllMyOrders } from '@/services/order/getAllMyOrders';
import { OrderData } from '@/services/order/handleOrder';
import { getRestrauntByid } from '@/services/restraunt/getRestrauntById';
import { getFoodOffersById } from '@/services/foodOffer/foodOfferService';
import { grabMyOrderHandler } from '@/services/grab/grabOfferHandler';
import { useAuthStore } from '@/store/userStore';
import { toast } from 'sonner';
import { Table, TableHeader, TableHead, TableRow, TableBody, TableCell } from '@/components/ui/table';

// Modern Star Rating Component
const StarRating = ({
    rating,
    setRating,
}: {
    rating: number;
    setRating: (value: number) => void;
}) => {
    return (
        <div className="flex gap-1 justify-center">
            {[1, 2, 3, 4, 5].map((star) => (
                <Star
                    key={star}
                    className={`h-8 w-8 cursor-pointer transition-colors ${star <= rating ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'
                        }`}
                    onClick={() => setRating(star)}
                />
            ))}
        </div>
    );
};

// Order Row Component to encapsulate state for each order
const OrderRow = ({
    order,
    restaurant,
    foodOffer,
    isGrabbed,
    onGrab,
    copyToClipboard
}: {
    order: OrderData;
    restaurant: Restaurant | undefined;
    foodOffer: FoodOfferRequest | undefined;
    isGrabbed: boolean;
    onGrab: (order: OrderData, rating: number) => void;
    copyToClipboard: (token: string) => void;
}) => {
    const [open, setOpen] = useState(false);
    const [rating, setRating] = useState(0);

    const truncateToken = (token: string, visibleChars: number = 8) => {
        if (token.length <= visibleChars * 2) return token;
        return `${token.substring(0, visibleChars)}...${token.substring(token.length - visibleChars)}`;
    };

    const handleSubmitRating = () => {
        onGrab(order, rating);
        setOpen(false);
        setRating(0);
    };

    return (
        <TableRow key={order.id}>
            <TableCell>{order.id}</TableCell>
            <TableCell>{restaurant?.name || 'Loading...'}</TableCell>
            <TableCell>{foodOffer?.foodName || 'Loading...'}</TableCell>
            <TableCell>{order.quantity}</TableCell>
            <TableCell className="text-green-400">${order.totalPrice.toFixed(2)}</TableCell>
            <TableCell>
                {order.createdAt ? format(new Date(order.createdAt), 'PPP') : 'N/A'}
            </TableCell>
            <TableCell>
                <Badge
                    variant={
                        order.status === 'CONFIRMED'
                            ? 'warning'
                            : order.status === 'COMPLETED'
                                ? 'success'
                                : order.status === 'CANCELLED'
                                    ? 'destructive'
                                    : 'default'
                    }
                >
                    {order.status}
                </Badge>
            </TableCell>
            <TableCell>
                {order.token ? (
                    <Button
                        variant="ghost"
                        size="sm"
                        className="flex text-blue-600 items-center gap-1 h-8 px-2 text-xs font-mono"
                        onClick={() => copyToClipboard(order.token)}
                    >
                        <Copy className="h-3 w-3" />
                        {truncateToken(order.token)}
                    </Button>
                ) : (
                    'N/A'
                )}
            </TableCell>
            <TableCell>{order.status === "COMPLETED" && <Button className='bg-green-400' disabled>Grabbed</Button>}
                {order.status === 'CONFIRMED' && order.token ? (
                    <>
                        <Button
                            variant={isGrabbed ? 'secondary' : 'default'}
                            className={`${isGrabbed
                                ? 'bg-gray-500 hover:bg-gray-600'
                                : 'bg-blue-600 hover:bg-blue-700'
                                } transition-colors`}
                            onClick={() => setOpen(true)}
                            disabled={isGrabbed}
                        >
                            {isGrabbed ? 'Grabbed' : 'Grab'}
                        </Button>
                        <Dialog open={open} onOpenChange={setOpen}>
                            <DialogContent className="sm:max-w-md bg-white dark:bg-gray-800 rounded-xl">
                                <DialogHeader>
                                    <DialogTitle className="text-lg font-semibold">
                                        Rate this Order
                                    </DialogTitle>
                                </DialogHeader>
                                <div className="py-4">
                                    <StarRating rating={rating} setRating={setRating} />
                                </div>
                                <DialogFooter>
                                    <Button
                                        variant="outline"
                                        onClick={() => setOpen(false)}
                                        className="border-gray-300"
                                    >
                                        Cancel
                                    </Button>
                                    <Button
                                        onClick={handleSubmitRating}
                                        disabled={rating === 0}
                                        className="bg-blue-600 hover:bg-blue-700"
                                    >
                                        Submit Rating
                                    </Button>
                                </DialogFooter>
                            </DialogContent>
                        </Dialog>
                    </>
                ) : (
                    null
                )}
            </TableCell>
        </TableRow>
    );
};

const OrderDetailsPage = () => {
    const router = useRouter();
    const [orders, setOrders] = useState<OrderData[]>([]);
    const [restaurants, setRestaurants] = useState<Map<number, Restaurant>>(new Map());
    const [foodOffers, setFoodOffers] = useState<Map<number, FoodOfferRequest>>(new Map());
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const { user, token } = useAuthStore();
    const [grabbedOrders, setGrabbedOrders] = useState<Set<string>>(new Set());

    // Function to copy token to clipboard
    const copyToClipboard = async (token: string) => {
        try {
            await navigator.clipboard.writeText(token);
            toast('Token copied!');
        } catch (err) {
            console.error('Failed to copy token:', err);
            toast('Copy failed');
        }
    };

    useEffect(() => {
        const fetchOrders = async () => {
            if (!user?.id) {
                setError('No user ID provided');
                setIsLoading(false);
                return;
            }

            try {
                setIsLoading(true);
                const response = await getAllMyOrders(user.id.toString(), token || '');
                if (response?.success && response.orders) {
                    setOrders(response.orders);

                    // Fetch restaurant and food offer details for all orders
                    const restaurantPromises = response.orders.map((order) =>
                        getRestrauntByid(order.restaurantId.toString()).then((res) => ({
                            id: order.restaurantId,
                            data: res,
                        }))
                    );
                    const offerPromises = response.orders.map((order) =>
                        getFoodOffersById(order.foodOfferRequestId).then((res) => ({
                            id: order.foodOfferRequestId,
                            data: res,
                        }))
                    );

                    const restaurantResults = await Promise.all(restaurantPromises);
                    const offerResults = await Promise.all(offerPromises);

                    // Store results in Maps for efficient lookup
                    const restaurantMap = new Map<number, Restaurant>();
                    const offerMap = new Map<number, FoodOfferRequest>();

                    restaurantResults.forEach((res) => {
                        if (res.data) restaurantMap.set(res.id, res.data);
                    });
                    offerResults.forEach((res) => {
                        if (res.data) offerMap.set(res.id, res.data);
                    });

                    setRestaurants(restaurantMap);
                    setFoodOffers(offerMap);
                } else {
                    setError('No orders found');
                }
            } catch (err) {
                console.error('Error fetching orders:', err);
                setError('Failed to fetch orders');
            } finally {
                setIsLoading(false);
            }
        };

        fetchOrders();
    }, [user?.id, token]);

    // Handle grab order
    const handleGrab = async (order: OrderData, rating: number) => {
        if (!order.token || !token) return;
        try {
            const response = await grabMyOrderHandler(rating, order.token, token);
            if (response) {
                setGrabbedOrders((prev) => new Set(prev).add(order.token));
                toast('Order grabbed successfully!');
            }
        } catch (error: any) {
            toast(error.message || 'Failed to grab order');
        }
    };

    if (isLoading) {
        return (
            <div className="flex items-center justify-center h-screen">
                <Loader2 className="h-8 w-8 animate-spin" />
            </div>
        );
    }

    if (error || orders.length === 0) {
        return (
            <div className="flex items-center justify-center h-screen">
                <Card className="w-full max-w-md">
                    <CardContent className="pt-6">
                        <p className="text-center text-red-500">{error || 'No orders found'}</p>
                    </CardContent>
                </Card>
            </div>
        );
    }

    return (
        <div className="container mx-auto px-4 py-8">
            <Card className="max-w-4xl mx-auto">
                <CardHeader className="flex items-center justify-between">
                    <Button onClick={() => router.back()}>
                        <Undo2 />
                        Back
                    </Button>
                    <CardTitle className="flex text-3xl items-center gap-2">
                        <Utensils className="h-6 w-6" />
                        My Orders
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Order ID</TableHead>
                                <TableHead>Restaurant</TableHead>
                                <TableHead>Food Offer</TableHead>
                                <TableHead>Quantity</TableHead>
                                <TableHead>Total Price</TableHead>
                                <TableHead>Date</TableHead>
                                <TableHead>Status</TableHead>
                                <TableHead>Token</TableHead>
                                <TableHead>Grab Order</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {orders.map((order) => (
                                <OrderRow
                                    key={order.id}
                                    order={order}
                                    restaurant={restaurants.get(order.restaurantId)}
                                    foodOffer={foodOffers.get(order.foodOfferRequestId)}
                                    isGrabbed={grabbedOrders.has(order.token)}
                                    onGrab={handleGrab}
                                    copyToClipboard={copyToClipboard}
                                />
                            ))}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>
        </div>
    );
};

export default OrderDetailsPage;