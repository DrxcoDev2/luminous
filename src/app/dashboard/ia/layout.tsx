'use client';

import React from "react";
import { useState, useMemo, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Menu,
  X,
  Home,
  LayoutDashboard,
  Settings,
  User,
  HelpCircle,
  LogOut,
  ChevronLeft,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/auth-context";
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { Loader2, Building, Globe, Hourglass, Star, Send } from 'lucide-react';
import { getUserSettings, saveUserSettings } from '@/lib/user-settings';
import { Skeleton } from '@/components/ui/skeleton';
import { timezones } from '@/lib/timezones';
import { typeBusiness } from '@/lib/type_business';
import { getCountryFlag, cn } from '@/lib/utils';
import { Textarea } from '@/components/ui/textarea';
import { submitFeedback } from '@/ai/flows/send-feedback-flow';
import { getAiChat } from "@/lib/firestore";



const SIDEBAR_WIDTH = 280;
const SIDEBAR_COLLAPSED = 80;

function useMediaQuery(query) {
  const [matches, setMatches] = useState(false);
  useEffect(() => {
    const media = window.matchMedia(query);
    const handler = () => setMatches(media.matches);
    handler();
    media.addEventListener?.("change", handler);
    return () => media.removeEventListener?.("change", handler);
  }, [query]);
  return matches;
}

export default function SidebarLayout({ children }: { children: React.ReactNode }) {
  const isDesktop = useMediaQuery("(min-width: 1024px)");
  const [open, setOpen] = useState(true);
  const [mobileOpen, setMobileOpen] = useState(false);
  const { user } = useAuth();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [isFetching, setIsFetching] = useState(true);

  

  useEffect(() => {

    async function fetchConversations() {
      try {
        const conversations = await getAiChat(user?.uid);

      }
    }

    function onKey(e) {
      if (e.key === "Escape") setMobileOpen(false);
    }
    if (mobileOpen) window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [mobileOpen]);

  const sidebarTargetWidth = useMemo(
    () => (isDesktop ? (open ? SIDEBAR_WIDTH : SIDEBAR_COLLAPSED) : 0),
    [isDesktop, open]
  );

  return (
    <div className="min-h-screen w-full bg-neutral-50 text-neutral-900">
      {/* Bot�n para mostrar/ocultar sidebar en desktop */}
      {isDesktop && (
        <div className="p-2 border-b border-neutral-200 bg-white sticky top-0 z-50 flex justify-between items-center">
          <Button
            variant="ghost"
            size="icon"
            aria-label="Toggle sidebar"
            className="rounded-2xl"
            onClick={() => setOpen((prev) => !prev)}
          >
            {open ? <ChevronLeft className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </Button>
          <span className="font-semibold tracking-tight flex-1 text-center">Current Chat</span>
        </div>
      )}

      <div className="flex max-w-7xl">
        <AnimatePresence initial={false}>
          {isDesktop && (
            <motion.aside
              key="sidebar-desktop"
              initial={{ width: sidebarTargetWidth }}
              animate={{ width: sidebarTargetWidth }}
              transition={{ type: "spring", stiffness: 260, damping: 30 }}
              className="relative hidden lg:block border-r border-neutral-200 bg-white"
              aria-label="Barra lateral"
            >
              <nav className="flex h-[calc(100dvh-57px)] flex-col justify-between p-3">
                <ul className="space-y-1">
                  {NAV_LINKS.map((item) => (
                    <li key={item.href}>
                      <a
                        href={item.href}
                        className="group flex items-center gap-3 rounded-2xl px-3 py-2.5 text-sm font-medium hover:bg-neutral-100 focus:outline-none focus:ring-2 focus:ring-neutral-300"
                      >
                        <item.icon className="h-5 w-5 shrink-0" />
                        <span
                          className={`transition-opacity duration-200 ${
                            open ? "opacity-100" : "opacity-0 pointer-events-none"
                          }`}
                        >
                          {item.label}
                        </span>
                      </a>
                    </li>
                  ))}
                </ul>
                <div className="mt-4 border-t border-neutral-200 pt-3">
                  <button className="flex w-full items-center gap-3 rounded-2xl px-3 py-2.5 text-left text-sm font-medium hover:bg-neutral-100">
                    <LogOut className="h-5 w-5" />
                    <span className={`${open ? "opacity-100" : "opacity-0 pointer-events-none"}`}>
                      Cerrar sesion
                    </span>
                  </button>
                </div>
              </nav>
            </motion.aside>
          )}
        </AnimatePresence>

        <main
          className="min-h-[calc(100dvh-57px)] flex-1 p-4 lg:p-6"
          style={{ paddingLeft: isDesktop ? 0 : undefined }}
        >
          {children}
        </main>
      </div>

      <AnimatePresence>
        {!isDesktop && mobileOpen && (
          <>
            <motion.div
              key="backdrop"
              className="fixed inset-0 z-40 bg-black/40"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setMobileOpen(false)}
            />
            <motion.aside
              key="drawer"
              className="fixed inset-y-0 left-0 z-50 w-[80vw] max-w-[320px] border-r border-neutral-200 bg-white"
              initial={{ x: -40, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: -40, opacity: 0 }}
              transition={{ type: "spring", stiffness: 280, damping: 26 }}
              aria-label="Menu mobile"
            >
              <div className="flex items-center justify-between px-3 py-3">
                <div className="flex items-center gap-2">
                  <div className="h-8 w-8 rounded-2xl bg-neutral-900" />
                  <span className="font-semibold">Mi App</span>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  aria-label="Cerrar menu"
                  className="rounded-2xl"
                  onClick={() => setMobileOpen(false)}
                >
                  <X className="h-5 w-5" />
                </Button>
              </div>
              <nav className="px-3">
                <ul className="space-y-1">
                  {NAV_LINKS.map((item) => (
                    <li key={item.href}>
                      <a
                        href={item.href}
                        className="flex items-center gap-3 rounded-2xl px-3 py-2.5 text-sm font-medium hover:bg-neutral-100"
                        onClick={() => setMobileOpen(false)}
                      >
                        <item.icon className="h-5 w-5" />
                        <span>{item.label}</span>
                      </a>
                    </li>
                  ))}
                </ul>
              </nav>
            </motion.aside>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
