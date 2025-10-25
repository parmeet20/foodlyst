'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { getUserFromToken } from '@/services/user/registerService';
import { connectWalletHandler } from '@/services/user/connectWallet';
import { useAuthStore } from '@/store/userStore';
import { WalletMultiButton } from '@solana/wallet-adapter-react-ui';
import { useWallet } from '@solana/wallet-adapter-react';
import { Connection, PublicKey } from '@solana/web3.js';
import { getAssociatedTokenAddress, getAccount } from '@solana/spl-token';
import { Button } from '@/components/ui/button';
import Link from 'next/link';

interface User {
  id: number;
  name: string;
  email: string;
  role: string;
  walletAddress: string;
  walletConnected: boolean;
  balance: number;
}

const USDC_MINT = new PublicKey('Gh9ZwEmdLJ8DscKNTkTqPbNwLNNBjuSzaG9Vp2KGtKJr');
const RPC_ENDPOINT = 'https://api.devnet.solana.com';

const ProfilePage = () => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const { token } = useAuthStore();
  const { publicKey } = useWallet();

  useEffect(() => {
    const fetchUser = async () => {
      const userData = await getUserFromToken(token!);
      setUser(userData);
      setLoading(false);
    };
    fetchUser();
  }, [token]);

  useEffect(() => {
    const fetchBalance = async () => {
      if (!publicKey || !user) return;
      try {
        const connection = new Connection(RPC_ENDPOINT, 'confirmed');
        const tokenAccount = await getAssociatedTokenAddress(USDC_MINT, publicKey);
        const accountInfo = await getAccount(connection, tokenAccount);
        const balance = Number(accountInfo.amount) / 10 ** 6; // USDC has 6 decimals
        setUser((prev) => prev ? { ...prev, balance, walletAddress: publicKey.toString(), walletConnected: true } : prev);
        await connectWalletHandler(user.id.toString(), publicKey.toString(), balance, token!);
      } catch (error) {
        console.error('Failed to fetch USDC balance:', error);
        setUser((prev) => prev ? { ...prev, balance: 0, walletAddress: publicKey.toString(), walletConnected: true } : prev);
      }
    };
    fetchBalance();
  }, [publicKey, user, token]);

  const handleWalletConnect = async () => {
    try {
      if (!publicKey || !user) return;
      const connection = new Connection(RPC_ENDPOINT, 'confirmed');
      const tokenAccount = await getAssociatedTokenAddress(USDC_MINT, publicKey);
      const accountInfo = await getAccount(connection, tokenAccount);
      const balance = Number(accountInfo.amount) / 10 ** 6;
      await connectWalletHandler(user.id.toString(), publicKey.toString(), balance, token!);
      setUser({ ...user, walletAddress: publicKey.toString(), walletConnected: true, balance });
    } catch (error) {
      console.error('Wallet connection failed:', error);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-background">
        <Skeleton className="w-64 h-96 rounded-xl" />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-background text-foreground">
        <p className="text-xl">Failed to load user data</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <Card className="w-full max-w-md border-border shadow-lg">
        <CardHeader className="flex items-center justify-center">
          <Avatar className="w-24 h-24">
            <AvatarImage src="" alt={user.name} />
            <AvatarFallback className="text-3xl font-bold bg-primary text-primary-foreground">
              {user.name.charAt(0).toUpperCase()}
            </AvatarFallback>
          </Avatar>
        </CardHeader>
        <CardContent className="space-y-4">
          <CardTitle className="text-2xl font-bold text-center text-foreground">{user.name}</CardTitle>
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-muted-foreground">Email:</span>
              <span>{user.email}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-muted-foreground">Role:</span>
              <Badge variant="secondary" className="capitalize">{user.role}</Badge>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-muted-foreground">Wallet Address:</span>
              <span className="truncate w-48">{user.walletAddress || '------------------------------'}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-muted-foreground">Wallet Connected:</span>
              <Badge variant={user.walletConnected ? 'default' : 'destructive'}>
                {user.walletConnected ? 'Yes' : 'No'}
              </Badge>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-muted-foreground">Balance:</span>
              <span>{user.balance} USDC</span>
            </div>
            <div className="flex justify-between items-center">
              <Button><Link href={'/orders'}>My Orders</Link></Button>
              <Button><Link href={'/transactions'}>My Transactions</Link></Button>
            </div>
          </div>
          <div className="flex justify-center pt-4">
            <WalletMultiButton
              className="w-full bg-primary text-primary-foreground hover:bg-primary/90 rounded-md py-2 px-4 transition-colors duration-200"
              onClick={handleWalletConnect}
            />
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ProfilePage;