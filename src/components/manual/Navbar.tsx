'use client';

import {
  Navbar,
  NavBody,
  NavItems,
  MobileNav,
  MobileNavHeader,
  MobileNavToggle,
  MobileNavMenu,
} from '@/components/ui/resizable-navbar';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useTheme } from 'next-themes';
import { Button } from '../ui/button';
import { useAuthStore } from '@/store/userStore';
import { useRouter } from 'next/navigation';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { getUserFromToken } from '@/services/user/registerService';
import { initWebSocket } from '@/services/websocket/websocket';

function ModeToggle() {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  const toggleTheme = () => {
    setTheme(theme === 'dark' ? 'light' : 'dark');
  };

  return (
    <button
      onClick={toggleTheme}
      aria-label={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
      className="rounded-full p-1 bg-gray-200 dark:bg-gray-700 text-black dark:text-white hover:scale-105 transition-all duration-200 focus:outline-none"
      style={{
        width: '28px',
        height: '28px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      {theme === 'dark' ? (
        <svg
          className="w-3 h-3"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z"
          />
        </svg>
      ) : (
        <svg
          className="w-3 h-3"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z"
          />
        </svg>
      )}
    </button>
  );
}

export default function FoodLystNavbar() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const { user, setUser, setToken, setLocation, logout, token } = useAuthStore();
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  // Initialize auth and location
  useEffect(() => {
    const initAuth = async () => {
      setLoading(true);
      let storedToken = localStorage.getItem('token');
      if (!storedToken) {
        useAuthStore.setState({ user: null, token: null });
        setLoading(false);
        return;
      }
      try {
        storedToken = JSON.parse(storedToken);
      } catch (e) {
        console.warn('[Navbar] Failed to parse token from localStorage, using as-is', e);
      }

      if (!storedToken) {
        useAuthStore.setState({ user: null, token: null });
        setLoading(false);
        return;
      }

      setToken(storedToken);

      try {
        const fetchedUser = await getUserFromToken(storedToken);
        if (fetchedUser) {
          setUser(fetchedUser);
          // Fetch and set location if user is authenticated
          if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(
              (position) => {
                setLocation(position.coords.latitude, position.coords.longitude);
              },
              (error) => {
                console.error('[Navbar] Error fetching location:', error);
                setLocation(0, 0); // Fallback coordinates
              }
            );
            if (user) {
              initWebSocket(user.latitude!, user.longitude!, token!);
            }
          } else {
            console.error('[Navbar] Geolocation not supported');
            setLocation(0, 0); // Fallback coordinates
          }
        }
      } catch (err) {
        console.error('[Navbar] Failed to fetch user from token:', err);
        localStorage.removeItem('token');
        logout();
      } finally {
        setLoading(false);
        console.log(user?.latitude, user?.longitude);
      }
    };

    if (!user && !token) {
      initAuth();
    }
  }, [setToken, setUser, setLocation, logout, user, token]);

  const handleLogout = () => {
    localStorage.removeItem('token');
    logout();
    router.push('/login');
  };

  const menuItems = [
    { name: 'Home', link: '/' },
    { name: 'Restaurants', link: '/restaurant' },
    { name: 'Services', link: '/services' },
    { name: 'Profile', link: '/profile' },
  ];

  return (
    <div className="fixed w-full z-50">
      <Navbar>
        <NavBody>
          <div className="navbar-logo">
            <Link
              href="/"
              className="font-bold text-xl bg-gradient-to-r from-green-600 to-blue-600 bg-clip-text text-transparent hover:scale-105 transition-all duration-300"
            >
              FoodLyst
            </Link>
          </div>

          <NavItems
            items={menuItems.map((item) => ({
              name: item.name,
              link: item.link,
            }))}
          />

          <div className="flex items-center gap-4 relative">
            <ModeToggle />
            {!user ? (
              <Button className="rounded-full">
                <Link href="/login">Login</Link>
              </Button>
            ) : (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button className="rounded-full">{user.name}</Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem
                    onClick={() => router.push('/profile')}
                    className="cursor-pointer"
                  >
                    Profile
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onClick={handleLogout}
                    className="cursor-pointer text-red-500"
                  >
                    Logout
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            )}
          </div>
        </NavBody>

        <MobileNav>
          <MobileNavHeader>
            <div>
              <Link
                href="/"
                className="font-bold text-xl bg-gradient-to-r from-green-600 to-blue-600 bg-clip-text text-transparent hover:scale-105 transition-all duration-300"
              >
                FoodLyst
              </Link>
            </div>
            <MobileNavToggle
              isOpen={isMobileMenuOpen}
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            />
          </MobileNavHeader>

          <MobileNavMenu
            isOpen={isMobileMenuOpen}
            onClose={() => setIsMobileMenuOpen(false)}
          >
            {menuItems.map((item, idx) => (
              <Link
                key={`mobile-link-${idx}`}
                href={item.link}
                onClick={() => setIsMobileMenuOpen(false)}
                className="relative text-neutral-600 dark:text-neutral-300 py-3"
              >
                <span className="block">{item.name}</span>
              </Link>
            ))}

            <div className="flex w-full flex-col gap-4 mt-4">
              <ModeToggle />
              {!user ? (
                <Button disabled={loading}>
                  <Link href="/login">Login</Link>
                </Button>
              ) : (
                <div className="flex flex-col gap-2">
                  <Button onClick={() => router.push('/profile')}>
                    {user.name}
                  </Button>
                  <Button variant="destructive" onClick={handleLogout}>
                    Logout
                  </Button>
                </div>
              )}
            </div>
          </MobileNavMenu>
        </MobileNav>
      </Navbar>
    </div>
  );
}