"use client";

import React, { useState, useEffect } from "react";
import { ChevronDown, ChevronUp, MoreVertical, Link as LinkIcon, Check } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";

interface CollapsibleSectionProps {
  title: string;
  id?: string;
  icon?: React.ReactNode;
  children: React.ReactNode;
  defaultOpen?: boolean;
  className?: string;
  headerClassName?: string;
  contentClassName?: string;
}

export function CollapsibleSection({
  title,
  id: providedId,
  icon,
  children,
  defaultOpen = true,
  className,
  headerClassName,
  contentClassName,
}: CollapsibleSectionProps) {
  const [isOpen, setIsOpen] = useState(defaultOpen);
  const [copied, setCopied] = useState(false);
  const [showMenu, setShowMenu] = useState(false);
  
  // Generate a safe ID for anchoring if not provided
  const sectionId = providedId || title.toLowerCase().replace(/\s+/g, '-').replace(/[^\w-]/g, '');

  const toggle = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsOpen(!isOpen);
  };

  const copyLink = (e: React.MouseEvent) => {
    e.stopPropagation();
    const url = new URL(window.location.href);
    url.hash = sectionId;
    navigator.clipboard.writeText(url.toString());
    setCopied(true);
    setTimeout(() => {
      setCopied(false);
      setShowMenu(false);
    }, 2000);
  };

  // Close menu when clicking outside
  useEffect(() => {
    if (!showMenu) return;
    const close = () => setShowMenu(false);
    window.addEventListener('click', close);
    return () => window.removeEventListener('click', close);
  }, [showMenu]);

  return (
    <div
      id={sectionId}
      className={cn(
        "border border-gray-200 dark:border-gray-800 rounded-xl overflow-hidden bg-white dark:bg-gray-950 transition-all duration-200 shadow-sm scroll-mt-20",
        className
      )}
    >
      <div
        className={cn(
          "flex items-center justify-between p-4 bg-gray-50/50 dark:bg-gray-900/50 select-none group/header",
          headerClassName
        )}
      >
        <div className="flex items-center gap-3 flex-1 min-w-0">
          <button
            onClick={toggle}
            className="p-1.5 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-lg transition-all active:scale-95 flex items-center justify-center shrink-0"
            aria-label={isOpen ? "Collapse section" : "Expand section"}
          >
            {isOpen ? (
              <ChevronUp className="w-4 h-4 text-gray-500 dark:text-gray-400 group-hover/header:text-gray-700 dark:group-hover/header:text-gray-200" />
            ) : (
              <ChevronDown className="w-4 h-4 text-gray-500 dark:text-gray-400 group-hover/header:text-gray-700 dark:group-hover/header:text-gray-200" />
            )}
          </button>
          
          {icon && (
            <div className="text-gray-500 dark:text-gray-400 shrink-0">
              {icon}
            </div>
          )}
          
          <h3 className="text-sm font-semibold text-gray-800 dark:text-gray-200 tracking-tight truncate">
            {title}
          </h3>
        </div>

        <div className="relative shrink-0 flex items-center gap-1">
          <button
            onClick={(e) => {
              e.stopPropagation();
              setShowMenu(!showMenu);
            }}
            className="p-1.5 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-lg transition-all text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
          >
            <MoreVertical className="w-4 h-4" />
          </button>

          <AnimatePresence>
            {showMenu && (
              <motion.div
                initial={{ opacity: 0, scale: 0.95, y: 10 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: 10 }}
                className="absolute right-0 top-full mt-1 w-48 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-lg shadow-xl z-10 py-1"
                onClick={(e) => e.stopPropagation()}
              >
                <button
                  onClick={copyLink}
                  className="w-full flex items-center gap-2 px-3 py-2 text-xs text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                >
                  {copied ? (
                    <Check className="w-3.5 h-3.5 text-green-500" />
                  ) : (
                    <LinkIcon className="w-3.5 h-3.5" />
                  )}
                  {copied ? "Copied!" : "Copy link to section"}
                </button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
      
      <AnimatePresence initial={false}>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3, ease: [0.04, 0.62, 0.23, 0.98] }}
          >
            <div className={cn("p-4 border-t border-gray-100 dark:border-gray-900", contentClassName)}>
              {children}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
