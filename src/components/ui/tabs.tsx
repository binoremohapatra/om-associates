"use client";

import { useState } from "react";
import { motion } from "motion/react";
import { useNavigate, useLocation } from "react-router-dom";
import { cn } from "../../lib/utils";

type Tab = {
  title: string;
  value: string;
  path?: string;
  content?: string | React.ReactNode | any;
};

export const Tabs = ({
  tabs: propTabs,
  containerClassName,
  activeTabClassName,
  tabClassName,
  contentClassName,
}: {
  tabs: Tab[];
  containerClassName?: string;
  activeTabClassName?: string;
  tabClassName?: string;
  contentClassName?: string;
}) => {
  const navigate = useNavigate();
  const location = useLocation();

  // Initialize with the tab that matches the current URL route
  const defaultActive = propTabs.find(t => t.path && location.pathname.startsWith(t.path)) || propTabs[0];

  const [active, setActive] = useState<Tab>(defaultActive);
  const [tabs, setTabs] = useState<Tab[]>(propTabs);

  const moveSelectedTabToTop = (idx: number) => {
    const newTabs = [...propTabs];
    const selectedTab = newTabs.splice(idx, 1);
    newTabs.unshift(selectedTab[0]);
    setTabs(newTabs);
    setActive(newTabs[0]);
  };

  const [hovering, setHovering] = useState(false);

  return (
    <>
      <div
        className={cn(
          "flex flex-row items-center justify-start [perspective:1000px] relative overflow-auto sm:overflow-visible no-visible-scrollbar max-w-full w-full",
          containerClassName
        )}
      >
        {propTabs.map((tab, idx) => (
          <button
            key={tab.title}
            onClick={() => {
              moveSelectedTabToTop(idx);
              if (tab.path) {
                navigate(tab.path);
              }
            }}
            onMouseEnter={() => setHovering(true)}
            onMouseLeave={() => setHovering(false)}
            className={cn("relative px-4 py-2 rounded-full whitespace-nowrap", tabClassName)}
            style={{
              transformStyle: "preserve-3d",
            }}
          >
            {active.value === tab.value && (
              <motion.div
                layoutId="clickedbutton"
                transition={{ type: "spring", bounce: 0.3, duration: 0.6 }}
                className={cn(
                  "absolute inset-0 bg-[#C9A94B]/10 border border-[#C9A94B]/30 rounded-full",
                  activeTabClassName
                )}
              />
            )}

            <span className={cn("relative block font-medium text-sm transition-colors duration-300", 
              active.value === tab.value ? "text-[#C9A94B]" : "text-slate-400 hover:text-white"
            )}>
              {tab.title}
            </span>
          </button>
        ))}
      </div>
      
      {/* Optional Content Rendering */}
      {tabs[0].content && (
        <FadeInDiv
          tabs={tabs}
          active={active}
          key={active.value}
          hovering={hovering}
          className={cn("mt-32", contentClassName)}
        />
      )}
    </>
  );
};

export const FadeInDiv = ({
  className,
  active,
}: {
  className?: string;
  key?: string;
  tabs: Tab[];
  active: Tab;
  hovering?: boolean;
}) => {
  return (
    <div className="relative w-full h-full">
      <motion.div
        key={active.value}
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -10 }}
        transition={{ duration: 0.2 }}
        className={cn("w-full h-full", className)}
      >
        {active.content}
      </motion.div>
    </div>
  );
};
