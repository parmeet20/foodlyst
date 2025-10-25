"use client";
import React from "react";
import { Button } from "@/components/ui/button";

const Home = () => {
  return (
    <main className="flex flex-col min-h-screen bg-gradient-to-b from-green-50 to-white dark:from-gray-900 dark:to-black transition-colors pt-16">
      {/* Added pt-16 (padding-top) to account for navbar height */}
      {/* Hero Section */}
      <section className="relative flex flex-col md:flex-row items-center justify-between px-6 md:px-20 py-16 gap-10">
        <div className="flex-1 space-y-6">
          <h1 className="text-4xl md:text-6xl font-bold text-gray-900 dark:text-white leading-tight">
            Save Food, Save Money, Save the{" "}
            <span className="text-green-600 dark:text-green-400">Planet</span>
          </h1>
          <p className="text-lg text-gray-600 dark:text-gray-300 max-w-lg">
            Restaurants sell surplus food at discounted prices. Get delicious meals, reduce waste, and
            help create a sustainable world — one bite at a time.
          </p>
          <div className="flex gap-4">
            <Button size="lg" className="rounded-full">
              Explore Deals
            </Button>
            <Button size="lg" variant="outline" className="rounded-full">
              For Restaurants
            </Button>
          </div>
        </div>

        {/* Hero img */}
        <div className="flex-1 relative h-[350px] md:h-[450px]">
          <img
            src="https://images.unsplash.com/photo-1600891964599-f61ba0e24092"
            alt="Food"
            className="object-cover rounded-3xl shadow-2xl w-full h-full"
          />
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 px-6 md:px-20 bg-white dark:bg-gray-950 transition-colors">
        <h2 className="text-3xl md:text-4xl font-bold text-center text-gray-900 dark:text-white mb-12">
          Why Choose Us?
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
          <div className="p-8 rounded-2xl shadow-lg hover:shadow-2xl transition bg-green-50 dark:bg-gray-800">
            <img
              src="https://cdn-icons-png.flaticon.com/512/3075/3075977.png"
              alt="Discount"
              width={80}
              height={80}
              className="mx-auto mb-6"
            />
            <h3 className="text-xl font-semibold text-center text-gray-900 dark:text-white mb-2">
              Big Discounts
            </h3>
            <p className="text-gray-600 dark:text-gray-300 text-center">
              Enjoy tasty meals from your favorite restaurants at unbeatable prices.
            </p>
          </div>

          <div className="p-8 rounded-2xl shadow-lg hover:shadow-2xl transition bg-green-50 dark:bg-gray-800">
            <img
              src="https://cdn-icons-png.flaticon.com/512/3076/3076827.png"
              alt="Sustainability"
              width={80}
              height={80}
              className="mx-auto mb-6"
            />
            <h3 className="text-xl font-semibold text-center text-gray-900 dark:text-white mb-2">
              Reduce Waste
            </h3>
            <p className="text-gray-600 dark:text-gray-300 text-center">
              Every order helps save food that would otherwise go to waste.
            </p>
          </div>

          <div className="p-8 rounded-2xl shadow-lg hover:shadow-2xl transition bg-green-50 dark:bg-gray-800">
            <img
              src="https://cdn-icons-png.flaticon.com/512/3075/3075970.png"
              alt="Community"
              width={80}
              height={80}
              className="mx-auto mb-6"
            />
            <h3 className="text-xl font-semibold text-center text-gray-900 dark:text-white mb-2">
              Support Local
            </h3>
            <p className="text-gray-600 dark:text-gray-300 text-center">
              Help local restaurants thrive while doing good for the environment.
            </p>
          </div>
        </div>
      </section>

      {/* Call to Action */}
      <section className="py-20 px-6 md:px-20 bg-green-600 dark:bg-green-700 text-white text-center transition-colors">
        <h2 className="text-3xl md:text-4xl font-bold mb-6">Join the Movement</h2>
        <p className="text-lg mb-8">
          Together, we can save millions of meals and build a more sustainable future.
        </p>
        <Button
          size="lg"
          variant="secondary"
          className="rounded-full bg-white text-green-600 hover:bg-gray-100 dark:bg-gray-900 dark:text-green-400 dark:hover:bg-gray-800"
        >
          Get Started
        </Button>
      </section>

      {/* Footer */}
      <footer className="py-10 bg-gray-900 dark:bg-black text-gray-400 text-center transition-colors">
        <p>© {new Date().getFullYear()} FoodSaver. All rights reserved.</p>
      </footer>
    </main>
  );
};

export default Home;