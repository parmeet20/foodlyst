'use client';

import React, { useEffect, useState } from 'react';
import { getAllMyTransactions } from '@/services/transaction/getAllMyTransactionsService';
import { useAuthStore } from '@/store/userStore';
import { Transaction } from '@/types';
import {
    Table,
    TableBody,
    TableCaption,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { getRestrauntByid } from '@/services/restraunt/getRestrauntById';
import { Button } from '@/components/ui/button';
import { useRouter } from 'next/navigation';
import { Undo2, Wallet } from 'lucide-react';

const TransactionsDetailPage = () => {
    const [transactions, setTransactions] = useState<Transaction[]>([]);
    const [restaurantNames, setRestaurantNames] = useState<Record<number, string>>({});
    const [loading, setLoading] = useState(true);
    const { user, token } = useAuthStore();
    const router = useRouter();

    const fetchTransactions = async () => {
        try {
            if (user && token) {
                const txs = await getAllMyTransactions(user.id.toString(), token);
                setTransactions(txs);

                // Fetch restaurant names for all unique toUserId values
                const uniqueIds = [...new Set(txs.map((tx) => tx.toUserId))];
                const names: Record<number, string> = {};

                await Promise.all(
                    uniqueIds.map(async (id) => {
                        try {
                            const res = await getRestrauntByid(id.toString());
                            names[id] = res?.name ?? `Restaurant #${id}`;
                        } catch (err) {
                            console.error(`Error fetching restaurant ${id}:`, err);
                            names[id] = `Restaurant #${id}`;
                        }
                    })
                );

                setRestaurantNames(names);
            }
        } catch (error) {
            console.error('Failed to fetch transactions:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchTransactions();
    }, []);

    // Utility to trim long Solana transaction signatures
    const trimSignature = (signature: string, start = 5, end = 5) => {
        if (!signature) return '';
        return signature.length > start + end
            ? `${signature.slice(0, start)}...${signature.slice(-end)}`
            : signature;
    };

    return (
        <div className="min-h-screen py-10 px-6">
            <Card className="max-w-6xl mx-auto shadow-sm border">
                <CardHeader className="pb-4 ">
                    <CardTitle className="text-2xl font-bold tracking-tight flex items-center justify-between">
                        <Button
                            onClick={() => router.back()}
                        >
                            <Undo2 />
                            Back
                        </Button>
                        <div className='flex items-center space-x-2'>                        <Wallet className="h-6 mt-1 w-6 mr-2" />
                            Transaction History</div>
                    </CardTitle>
                    <p className="text-sm text-muted-foreground">
                        View all your recent payment transactions and details.
                    </p>
                </CardHeader>

                <CardContent>
                    {loading ? (
                        <div className="space-y-2">
                            {[...Array(6)].map((_, i) => (
                                <Skeleton key={i} className="h-12 w-full rounded-md" />
                            ))}
                        </div>
                    ) : transactions.length === 0 ? (
                        <div className="flex flex-col items-center justify-center py-16 text-gray-500">
                            <p className="text-lg font-medium">No transactions found</p>
                        </div>
                    ) : (
                        <Table>
                            <TableCaption>Your latest transactions</TableCaption>
                            <TableHeader>
                                <TableRow>
                                    <TableHead className="w-[60px]">#</TableHead>
                                    <TableHead>Order ID</TableHead>
                                    <TableHead>Restaurant</TableHead>
                                    <TableHead>Amount</TableHead>
                                    <TableHead>Signature</TableHead>
                                    <TableHead>Date</TableHead>
                                    <TableHead className="text-right">Status</TableHead>
                                </TableRow>
                            </TableHeader>

                            <TableBody>
                                {transactions.map((tx, index) => (
                                    <TableRow key={tx.id}>
                                        <TableCell className="font-medium">{index + 1}</TableCell>
                                        <TableCell>{tx.orderId ?? '-'}</TableCell>

                                        <TableCell>
                                            {restaurantNames[tx.toUserId] || `Restaurant #${tx.toUserId}`}
                                        </TableCell>

                                        <TableCell className="font-semibold text-green-600">
                                            ${tx.amountPaid.toFixed(2)}
                                        </TableCell>

                                        <TableCell className="truncate font-mono max-w-[160px] text-xs">
                                            <a
                                                href={`https://explorer.solana.com/tx/${tx.txSignature}?cluster=devnet`}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="text-blue-600 hover:underline"
                                            >
                                                {trimSignature(tx.txSignature)}
                                            </a>
                                        </TableCell>

                                        <TableCell>
                                            {new Date(tx.createdAt).toLocaleDateString()}
                                        </TableCell>

                                        <TableCell className="text-right">
                                            <Badge variant="success">Completed</Badge>
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    )}
                </CardContent>
            </Card>
        </div>
    );
};

export default TransactionsDetailPage;
