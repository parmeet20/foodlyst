// src/ws/types.ts
export type WebSocketMessage =
    | {
        type: "ORDER_CONFIRMED";
        payload: {
            orderId: number;
            message: string;
        };
    }
    | {
        type: "NEW_ORDER";
        payload: {
            orderId: number;
            message: string;
            quantity: number;
        };
    }
    | {
        type: "FOOD_QUANTITY_UPDATED";
        payload: {
            foodOfferId: number;
            foodName: string;
            remainingQty: number;
        };
    }
    | {
        type: "NEW_OFFER",
        payload: {
            restaurantId: number;
            restaurantName: string;
            message: string;
        }
    }
    | {
        type: "GENERIC";
        payload: {
            message: string;
        };
    };
