"use client";

import React, { useState, useEffect, useCallback, useMemo } from "react";
import { useWallet } from "@solana/wallet-adapter-react";
import {
  Connection,
  PublicKey,
  Transaction,
  VersionedTransaction,
} from "@solana/web3.js";
import {
  getAssociatedTokenAddress,
  createTransferInstruction,
  TOKEN_PROGRAM_ID,
  createAssociatedTokenAccountInstruction,
  getAccount,
} from "@solana/spl-token";
import { toast } from "sonner";
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
} from "@/components/ui/drawer";
import { Button } from "@/components/ui/button";
import { Minus, Plus } from "lucide-react";
import { useAuthStore } from "@/store/userStore";
import { Restaurant } from "@/types";
import { bookOrderHandler, OrderData } from "@/services/order/handleOrder";

interface OrderDrawerProps {
  open: boolean;
  onClose: () => void;
  foodName: string;
  availableQty: number;
  pricePerQty: number;
  foodOfferRequestId: number;
  restaurant: Restaurant;
  tokenMint: string;
  onOrderSuccess?: () => void;
}

export const OrderDrawer: React.FC<OrderDrawerProps> = ({
  open,
  onClose,
  foodName,
  foodOfferRequestId,
  availableQty,
  pricePerQty,
  onOrderSuccess,
  restaurant,
  tokenMint,
}) => {
  const [qty, setQty] = useState(1);
  const [loading, setLoading] = useState(false);
  const totalPrice = qty * pricePerQty;
  const { user, token } = useAuthStore();

  const connection = useMemo(() => new Connection("https://api.devnet.solana.com", "confirmed"), []);
  const { publicKey, signTransaction } = useWallet();

  useEffect(() => {
    if (qty > availableQty) setQty(availableQty);
  }, [availableQty, qty]);

  // Reset states when drawer opens/closes
  useEffect(() => {
    if (open) {
      setQty(1);
    }
  }, [open]);

  const createATAIfNeeded = useCallback(
    async (
      tokenMintAddress: PublicKey,
      restaurantWalletKey: PublicKey
    ): Promise<void> => {
      try {
        const toTokenAccount = await getAssociatedTokenAddress(
          tokenMintAddress,
          restaurantWalletKey
        );

        // Check if recipient's ATA exists
        try {
          await getAccount(connection, toTokenAccount);
          console.log("Recipient ATA already exists");
          return; // ATA exists, no need to create
        } catch {
          // ATA doesn't exist, create it
        }

        if (!publicKey || !signTransaction) {
          throw new Error("Wallet not connected");
        }

        const ataTransaction = new Transaction();
        ataTransaction.add(
          createAssociatedTokenAccountInstruction(
            publicKey, // Payer
            toTokenAccount, // ATA to create
            restaurantWalletKey, // Owner
            tokenMintAddress // Mint
          )
        );

        const { blockhash, lastValidBlockHeight } =
          await connection.getLatestBlockhash("confirmed");
        ataTransaction.recentBlockhash = blockhash;
        ataTransaction.feePayer = publicKey;

        const signedATATx = await signTransaction(ataTransaction);
        const rawATATransaction = signedATATx.serialize();

        const ataTxid = await connection.sendRawTransaction(rawATATransaction, {
          skipPreflight: false,
          preflightCommitment: "confirmed",
          maxRetries: 3,
        });

        console.log("ATA creation transaction sent:", ataTxid);

        await connection.confirmTransaction(
          {
            signature: ataTxid,
            blockhash,
            lastValidBlockHeight,
          },
          "confirmed"
        );

        toast.info("Recipient account initialized successfully.");
      } catch (error: unknown) {
        console.error("ATA creation error:", error);
        const errorMessage = error instanceof Error ? error.message : "Unknown error";
        throw new Error(`Failed to create recipient account: ${errorMessage}`);
      }
    },
    [publicKey, signTransaction, connection]
  );

  const handlePayment = useCallback(async (): Promise<string | null> => {
    const maxAttempts = 3;
    let attempt = 0;

    while (attempt < maxAttempts) {
      attempt++;
      try {
        if (!publicKey || !signTransaction) {
          toast.error("Please connect your wallet first.");
          return null;
        }

        if (!tokenMint || !restaurant?.walletAddress) {
          toast.error("Token mint or restaurant wallet not provided.");
          return null;
        }

        let tokenMintAddress: PublicKey;
        let restaurantWalletKey: PublicKey;

        try {
          tokenMintAddress = new PublicKey(tokenMint);
          restaurantWalletKey = new PublicKey(restaurant.walletAddress);
        } catch {
          toast.error("Invalid wallet or token address provided.");
          return null;
        }

        const fromTokenAccount = await getAssociatedTokenAddress(
          tokenMintAddress,
          publicKey
        );
        const toTokenAccount = await getAssociatedTokenAddress(
          tokenMintAddress,
          restaurantWalletKey
        );

        // Create a new transaction for token transfer
        const transaction = new Transaction();

        // Convert to proper token decimals (e.g., 6 for USDC)
        const amount = BigInt(Math.floor(totalPrice * 1_000_000));

        // Add transfer instruction
        transaction.add(
          createTransferInstruction(
            fromTokenAccount,
            toTokenAccount,
            publicKey,
            Number(amount),
            [],
            TOKEN_PROGRAM_ID
          )
        );

        transaction.feePayer = publicKey;

        // Fetch a fresh blockhash for this attempt
        const { blockhash, lastValidBlockHeight } = await connection.getLatestBlockhash("confirmed");
        transaction.recentBlockhash = blockhash;

        console.log(`Attempt ${attempt}: Using blockhash ${blockhash}`);

        // Skip simulation to avoid "already processed" errors
        const skipSimulation = true;

        if (!skipSimulation) {
          // Convert Transaction to VersionedTransaction for simulation
          const messageV0 = transaction.compileMessage();
          const versionedTransaction = new VersionedTransaction(messageV0);

          const simulation = await connection.simulateTransaction(versionedTransaction, {
            sigVerify: false,
            replaceRecentBlockhash: false,
          });

          if (simulation.value.err) {
            throw new Error(`Simulation failed: ${JSON.stringify(simulation.value.err)}`);
          }
        }

        // Sign and send the transaction
        const signedTx = await signTransaction(transaction);
        const rawTransaction = signedTx.serialize();

        const txid = await connection.sendRawTransaction(rawTransaction, {
          skipPreflight: false,
          preflightCommitment: "confirmed",
          maxRetries: 3,
        });

        console.log(`Attempt ${attempt}: Transaction sent: ${txid}`);

        // Confirm transaction with timeout
        try {
          await connection.confirmTransaction(
            {
              signature: txid,
              blockhash,
              lastValidBlockHeight,
            },
            "confirmed"
          );
        } catch (confirmationError: unknown) {
          const errorMessage = confirmationError instanceof Error ? confirmationError.message : "";
          if (errorMessage.includes("Transaction has already been processed")) {
            console.log(`Attempt ${attempt}: Transaction already processed, assuming success: ${txid}`);
            toast.success("Payment successful (already processed)!");
            return txid;
          }
          throw confirmationError;
        }

        toast.success("Payment successful!");
        return txid;
      } catch (error: unknown) {
        console.error(`Attempt ${attempt}: Payment error details:`, error);

        const errorMessage = error instanceof Error ? error.message : "";

        if (
          errorMessage.includes("This transaction has already been processed") ||
          errorMessage.includes("Blockhash not found")
        ) {
          if (attempt < maxAttempts) {
            console.log(`Attempt ${attempt} failed: ${errorMessage}. Retrying with fresh blockhash...`);
            continue; // Retry with a fresh blockhash
          } else {
            toast.error("Max retries reached. Transaction was already processed or expired. Please try again.");
            return null;
          }
        } else if (errorMessage.includes("insufficient funds")) {
          toast.error("Insufficient funds for transaction.");
        } else if (errorMessage.includes("user rejected")) {
          toast.error("Transaction was rejected by user.");
        } else if (errorMessage.includes("Confirmation timeout")) {
          toast.error("Transaction confirmation timeout. Please check your wallet.");
        } else {
          toast.error(`Payment failed: ${errorMessage || "Unknown error"}`);
        }

        return null;
      }
    }

    return null; // Fallback if all attempts fail
  }, [publicKey, signTransaction, tokenMint, restaurant, totalPrice, connection]);

  const handleOrderEvent = useCallback(async () => {
    try {
      if (!user || !token) {
        toast.error("Please login to place an order.");
        return;
      }

      if (!publicKey) {
        toast.error("Please connect your wallet.");
        return;
      }

      setLoading(true);

      // 🔹 Step 1: Validate inputs
      if (!tokenMint || !restaurant?.walletAddress) {
        toast.error("Token mint or restaurant wallet not provided.");
        return;
      }

      let tokenMintAddress: PublicKey;
      let restaurantWalletKey: PublicKey;

      try {
        tokenMintAddress = new PublicKey(tokenMint);
        restaurantWalletKey = new PublicKey(restaurant.walletAddress);
      } catch {
        toast.error("Invalid wallet or token address provided.");
        return;
      }

      // 🔹 Step 2: Ensure recipient ATA exists
      await createATAIfNeeded(tokenMintAddress, restaurantWalletKey);

      // 🔹 Step 3: Make the payment on Solana
      const paymentTxId = await handlePayment();

      if (!paymentTxId) {
        return; // Error is already handled in handlePayment
      }

      // 🔹 Step 4: Prepare order data for backend
      const orderData: OrderData = {
        userId: user.id,
        restaurantId: restaurant.id,
        foodOfferRequestId,
        quantity: qty,
        token: tokenMint,
        totalPrice,
        txHash: paymentTxId,
        paymentId: paymentTxId,
      };

      // 🔹 Step 5: Call backend API
      const success = await bookOrderHandler(orderData, token);

      if (success) {
        toast.success("✅ Order placed successfully!");
        onOrderSuccess?.();
        onClose();
      } else {
        toast.error("Failed to book order. Please contact support.");
      }
    } catch (error: unknown) {
      console.error("Order event error:", error);
      const errorMessage = error instanceof Error ? error.message : "Unknown error";
      toast.error(`Error placing order: ${errorMessage}`);
    } finally {
      setLoading(false);
    }
  }, [
    user,
    token,
    publicKey,
    restaurant,
    foodOfferRequestId,
    qty,
    totalPrice,
    tokenMint,
    onClose,
    createATAIfNeeded,
    handlePayment,
    onOrderSuccess,
  ]);

  const handleIncrement = useCallback(() => {
    setQty((prev) => Math.min(availableQty, prev + 1));
  }, [availableQty]);

  const handleDecrement = useCallback(() => {
    setQty((prev) => Math.max(1, prev - 1));
  }, []);

  return (
    <Drawer open={open} onOpenChange={onClose}>
      <DrawerContent>
        <div className="mx-auto w-full max-w-sm">
          <DrawerHeader>
            <DrawerTitle>Order {foodName}</DrawerTitle>
            <DrawerDescription>
              Adjust your quantity and confirm payment securely.
            </DrawerDescription>
          </DrawerHeader>

          <div className="p-4 pb-0 flex flex-col items-center">
            <div className="flex items-center space-x-2 mb-4">
              <Button
                variant="outline"
                size="icon"
                className="h-8 w-8 rounded-full"
                onClick={handleDecrement}
                disabled={qty <= 1 || loading}
              >
                <Minus />
              </Button>
              <div className="text-center">
                <div className="text-5xl font-bold">{qty}</div>
                <div className="text-xs text-muted-foreground uppercase">
                  Quantity
                </div>
              </div>
              <Button
                variant="outline"
                size="icon"
                className="h-8 w-8 rounded-full"
                onClick={handleIncrement}
                disabled={qty >= availableQty || loading}
              >
                <Plus />
              </Button>
            </div>

            <div className="text-center space-y-1">
              <p className="text-muted-foreground">
                Available: <span className="font-medium">{availableQty}</span>
              </p>
              <p className="text-xl font-semibold">
                Total: ₹{totalPrice.toFixed(2)}
              </p>
            </div>
          </div>

          <DrawerFooter>
            <Button
              onClick={handleOrderEvent}
              disabled={loading || qty > availableQty}
            >
              {loading ? "Processing..." : "Pay Now"}
            </Button>
            <DrawerClose asChild>
              <Button variant="outline" disabled={loading}>
                Cancel
              </Button>
            </DrawerClose>
          </DrawerFooter>
        </div>
      </DrawerContent>
    </Drawer>
  );
};