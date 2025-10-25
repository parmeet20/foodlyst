'use client';
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { TrendingUp, DollarSign, CheckCircle, Star } from 'lucide-react';

const RestaurantAnalyticsPage = () => {
  const revenueData = [
    { name: 'Mon', revenue: 4200, orders: 45 },
    { name: 'Tue', revenue: 3800, orders: 38 },
    { name: 'Wed', revenue: 5300, orders: 52 },
    { name: 'Thu', revenue: 4800, orders: 47 },
    { name: 'Fri', revenue: 7200, orders: 68 },
    { name: 'Sat', revenue: 8900, orders: 82 },
    { name: 'Sun', revenue: 6500, orders: 58 },
  ];

  const categoryData = [
    { name: 'Appetizers', value: 25 },
    { name: 'Main Course', value: 45 },
    { name: 'Desserts', value: 15 },
    { name: 'Beverages', value: 15 },
  ];

  const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444'];

  const popularItems = [
    { name: 'Truffle Pasta', orders: 124, rating: 4.8 },
    { name: 'Wagyu Burger', orders: 98, rating: 4.7 },
    { name: 'Caesar Salad', orders: 87, rating: 4.5 },
    { name: 'Chocolate Lava', orders: 76, rating: 4.9 },
  ];

  const kpiData = [
    { title: 'Total Revenue', value: '$45,230', change: '+12.5%', icon: DollarSign, description: 'From last month' },
    { title: 'Orders Fulfilled', value: '2,847', change: '+8.2%', icon: CheckCircle, description: 'Successful orders' },
    { title: 'Avg. Order Value', value: '$45.67', change: '+3.1%', icon: TrendingUp, description: 'From last month' },
    { title: 'Customer Satisfaction', value: '4.7/5', change: '+0.2', icon: Star, description: 'Average rating' },
  ];

  return (
    <div className="min-h-screen bg-background text-foreground p-6 pt-24">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold">Restaurant Analytics</h1>
          <p className="text-muted-foreground mt-2">Real-time insights and performance metrics</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {kpiData.map((kpi, index) => (
            <Card key={index} className="bg-card border-none shadow-lg hover:shadow-xl transition-shadow">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">{kpi.title}</CardTitle>
                <kpi.icon className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{kpi.value}</div>
                <p className="text-xs text-muted-foreground flex items-center mt-1">
                  <span className="text-green-500 font-medium">{kpi.change}</span>
                  <span className="ml-1">{kpi.description}</span>
                </p>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          <Card className="bg-card border-none shadow-lg">
            <CardHeader>
              <CardTitle>Revenue & Orders</CardTitle>
              <CardDescription>Weekly revenue and order trends</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={revenueData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis dataKey="name" stroke="hsl(var(--foreground))" />
                  <YAxis stroke="hsl(var(--foreground))" />
                  <Tooltip contentStyle={{ backgroundColor: 'hsl(var(--card))', color: 'hsl(var(--foreground))' }} />
                  <Legend />
                  <Bar dataKey="revenue" fill="#3b82f6" name="Revenue ($)" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="orders" fill="#10b981" name="Orders" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          <Card className="bg-card border-none shadow-lg">
            <CardHeader>
              <CardTitle>Menu Category Distribution</CardTitle>
              <CardDescription>Sales by food category</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={categoryData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, value }) => `${name} ${value}%`}
                    outerRadius={80}
                    dataKey="value"
                  >
                    {categoryData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip contentStyle={{ backgroundColor: 'hsl(var(--card))', color: 'hsl(var(--foreground))' }} formatter={(value) => [`${value}%`, 'Percentage']} />
                </PieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <Card className="bg-card border-none shadow-lg lg:col-span-2">
            <CardHeader>
              <CardTitle>Popular Menu Items</CardTitle>
              <CardDescription>Most ordered items with ratings</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {popularItems.map((item, index) => (
                  <div key={index} className="flex items-center justify-between p-3 bg-muted rounded-lg">
                    <div className="flex items-center space-x-3">
                      <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center">
                        <span className="text-sm font-medium text-primary">{index + 1}</span>
                      </div>
                      <div>
                        <p className="font-medium">{item.name}</p>
                        <p className="text-sm text-muted-foreground">{item.orders} orders</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-1">
                      <Star className="h-4 w-4 text-yellow-400 fill-current" />
                      <span className="text-sm font-medium">{item.rating}</span>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card className="bg-card border-none shadow-lg">
            <CardHeader>
              <CardTitle>Performance Metrics</CardTitle>
              <CardDescription>Key operational metrics</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-muted-foreground">Avg. Prep Time</span>
                  <span className="font-medium">18 min</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-muted-foreground">Table Turnover</span>
                  <span className="font-medium">2.3x</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-muted-foreground">Peak Hours</span>
                  <span className="font-medium">7-9 PM</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-muted-foreground">Repeat Customers</span>
                  <span className="font-medium">42%</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default RestaurantAnalyticsPage;