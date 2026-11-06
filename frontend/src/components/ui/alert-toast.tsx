import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import {
  CheckCircle2,
  AlertTriangle,
  Info,
  XOctagon,
  X,
} from "lucide-react";

// Define variants for the alert toast using cva
const alertToastVariants = cva(
  "relative w-full max-w-sm overflow-hidden rounded-xl shadow-xl flex items-start p-4 space-x-4 backdrop-blur-md",
  {
    variants: {
      variant: {
        success: "",
        warning: "",
        info: "",
        error: "",
      },
      styleVariant: {
        default: "bg-white/90 dark:bg-slate-900/90 border",
        filled: "",
      },
    },
    compoundVariants: [
      {
        variant: "success",
        styleVariant: "default",
        className: "text-emerald-950 dark:text-emerald-100 border-green-200 dark:border-green-800 shadow-emerald-500/10",
      },
      {
        variant: "warning",
        styleVariant: "default",
        className: "text-amber-950 dark:text-amber-100 border-amber-200 dark:border-amber-800 shadow-amber-500/10",
      },
      {
        variant: "info",
        styleVariant: "default",
        className: "text-sky-950 dark:text-sky-100 border-sky-200 dark:border-sky-800 shadow-sky-500/10",
      },
      {
        variant: "error",
        styleVariant: "default",
        className: "text-rose-950 dark:text-rose-100 border-rose-200 dark:border-rose-800 shadow-rose-500/10",
      },
      {
        variant: "success",
        styleVariant: "filled",
        className: "bg-emerald-600 text-white",
      },
      {
        variant: "warning",
        styleVariant: "filled",
        className: "bg-amber-500 text-white",
      },
      {
        variant: "info",
        styleVariant: "filled",
        className: "bg-sky-600 text-white",
      },
      {
        variant: "error",
        styleVariant: "filled",
        className: "bg-rose-600 text-white",
      },
    ],
    defaultVariants: {
      variant: "info",
      styleVariant: "default",
    },
  }
);

// Define icon map for different variants
const iconMap = {
  success: CheckCircle2,
  warning: AlertTriangle,
  info: Info,
  error: XOctagon,
};

// Define icon color classes
const iconColorClasses: Record<string, Record<string, string>> = {
  default: {
    success: "text-emerald-500",
    warning: "text-amber-500",
    info: "text-sky-500",
    error: "text-rose-500",
  },
  filled: {
    success: "text-white",
    warning: "text-white",
    info: "text-white",
    error: "text-white",
  },
};

export interface AlertToastProps
  extends Omit<React.HTMLAttributes<HTMLDivElement>, 'onDrag' | 'onDragEnd' | 'onDragStart' | 'onAnimationStart'>,
    VariantProps<typeof alertToastVariants> {
  /** The title of the alert. */
  title: string;
  /** A more detailed description for the alert. */
  description?: string;
  /** A function to call when the alert is dismissed. */
  onClose: () => void;
}

const AlertToast = React.forwardRef<HTMLDivElement, AlertToastProps>(
  ({ className, variant = 'info', styleVariant = 'default', title, description, onClose, ...props }, ref) => {
    const safeVariant = variant ?? 'info';
    const safeStyle = styleVariant ?? 'default';
    const Icon = iconMap[safeVariant];

    return (
      <motion.div
        ref={ref}
        role="alert"
        layout
        initial={{ opacity: 0, y: 50, scale: 0.3 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: 20, scale: 0.5 }}
        transition={{
          type: "spring",
          stiffness: 260,
          damping: 20,
        }}
        className={cn(alertToastVariants({ variant: safeVariant, styleVariant: safeStyle }), className)}
        {...props}
      >
        {/* Icon */}
        <div className="flex-shrink-0">
          <Icon className={cn("h-6 w-6", iconColorClasses[safeStyle][safeVariant])} aria-hidden="true" />
        </div>

        {/* Content */}
        <div className="flex-1">
          <p className="text-sm font-semibold">{title}</p>
          {description && <p className="text-xs opacity-90 mt-0.5">{description}</p>}
        </div>
        
        {/* Close Button */}
        <div className="flex-shrink-0">
          <button
            onClick={onClose}
            aria-label="Close"
            className={cn(
              "p-1 rounded-full opacity-80 hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-offset-2",
               safeStyle === 'default' ? "text-foreground/70 hover:bg-slate-200/50 dark:hover:bg-slate-800" : "hover:bg-black/20"
            )}
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      </motion.div>
    );
  }
);

AlertToast.displayName = "AlertToast";

export { AlertToast, alertToastVariants };
