import React, { useRef, useState, useEffect } from "react";
import { cn } from "../../lib/utils";
import { IconLayoutNavbarCollapse } from "@tabler/icons-react";
import {
  AnimatePresence,
  MotionValue,
  motion,
  useMotionValue,
  useSpring,
  useTransform,
} from "motion/react";
import { Link, useLocation } from "react-router-dom";

export const FloatingDock = ({
  items,
  desktopClassName,
  mobileClassName,
}: {
  items: { title: string; icon: React.ReactNode; href: string }[];
  desktopClassName?: string;
  mobileClassName?: string;
}) => {
  return (
    <FloatingDockDesktop items={items} className={cn(desktopClassName, mobileClassName)} />
  );
};

const FloatingDockDesktop = ({
  items,
  className,
}: {
  items: { title: string; icon: React.ReactNode; href: string }[];
  className?: string;
}) => {
  let mouseX = useMotionValue(Infinity);
  return (
    <div className={cn("relative w-full md:w-auto", className)}>
      {/* Visual background — only as tall as the visible bar */}
      <div
        className="absolute bottom-0 left-0 right-0 bg-gray-50 dark:bg-neutral-900 border-t md:border border-neutral-200 dark:border-neutral-800 shadow-2xl rounded-none md:rounded-2xl pointer-events-none"
        style={{ height: 'calc(4rem + env(safe-area-inset-bottom, 0px))' }}
      />

      {/* Scroll row — taller so icons can pop upward freely */}
      <div
        className="relative flex w-full overflow-x-auto [&::-webkit-scrollbar]:hidden"
        style={{
          height: 120,
          scrollbarWidth: 'none',
          msOverflowStyle: 'none',
          alignItems: 'flex-end',
        }}
      >
        <motion.div
          onMouseMove={(e) => mouseX.set(e.pageX)}
          onMouseLeave={() => mouseX.set(Infinity)}
          className="flex min-w-full w-max items-end justify-start md:justify-center gap-2 md:gap-3 px-3 md:px-4"
          style={{ paddingBottom: 'calc(0.75rem + env(safe-area-inset-bottom, 0px))' }}
        >
          {items.map((item) => (
            <IconContainer mouseX={mouseX} key={item.title} {...item} />
          ))}
        </motion.div>
      </div>
    </div>
  );
};

function IconContainer({
  mouseX,
  title,
  icon,
  href,
}: {
  mouseX: MotionValue;
  title: string;
  icon: React.ReactNode;
  href: string;
}) {
  let ref = useRef<HTMLDivElement>(null);

  let distance = useTransform(mouseX, (val) => {
    let bounds = ref.current?.getBoundingClientRect() ?? { x: 0, width: 0 };
    return val - bounds.x - bounds.width / 2;
  });

  let widthTransform = useTransform(distance, [-150, 0, 150], [40, 52, 40]);
  let heightTransform = useTransform(distance, [-150, 0, 150], [40, 52, 40]);

  let widthTransformIcon = useTransform(distance, [-150, 0, 150], [20, 26, 20]);
  let heightTransformIcon = useTransform(
    distance,
    [-150, 0, 150],
    [20, 26, 20],
  );

  let width = useSpring(widthTransform, {
    mass: 0.1,
    stiffness: 150,
    damping: 12,
  });
  let height = useSpring(heightTransform, {
    mass: 0.1,
    stiffness: 150,
    damping: 12,
  });

  let widthIcon = useSpring(widthTransformIcon, {
    mass: 0.1,
    stiffness: 150,
    damping: 12,
  });
  let heightIcon = useSpring(heightTransformIcon, {
    mass: 0.1,
    stiffness: 150,
    damping: 12,
  });

  const [hovered, setHovered] = useState(false);
  const location = useLocation();
  const isActive = location.pathname === href || (href !== '/dashboard' && location.pathname.startsWith(href));

  useEffect(() => {
    if (isActive && ref.current) {
      const timeout = setTimeout(() => {
        ref.current?.scrollIntoView({
          behavior: "smooth",
          inline: "center",
          block: "nearest"
        });
      }, 100);
      return () => clearTimeout(timeout);
    }
  }, [isActive]);

  return (
    <Link to={href}>
      <motion.div
        ref={ref}
        style={{ width, height }}
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
        className={cn(
          "relative flex aspect-square items-center justify-center rounded-full transition-colors",
          isActive 
            ? "bg-[#C9A94B]/20 shadow-[inset_0_0_0_1px_rgba(201,169,75,0.3)]" 
            : "bg-gray-200 dark:bg-neutral-800"
        )}
      >
        <AnimatePresence>
          {hovered && (
            <motion.div
              initial={{ opacity: 0, y: 10, x: "-50%" }}
              animate={{ opacity: 1, y: 0, x: "-50%" }}
              exit={{ opacity: 0, y: 2, x: "-50%" }}
              className="absolute -top-10 left-1/2 w-fit hidden md:block rounded-md border border-gray-200 bg-gray-100 px-3 py-1.5 text-sm whitespace-pre text-neutral-700 dark:border-neutral-900 dark:bg-neutral-800 dark:text-white shadow-xl z-50"
            >
              {title}
            </motion.div>
          )}
        </AnimatePresence>
        <motion.div
          style={{ width: widthIcon, height: heightIcon }}
          className={cn(
            "flex items-center justify-center",
            isActive ? "text-[#C9A94B]" : "text-neutral-600 dark:text-neutral-300"
          )}
        >
          {icon}
        </motion.div>
      </motion.div>
    </Link>
  );
}
