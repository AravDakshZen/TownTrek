import * as React from "react";
import { cn } from "@/lib/utils";

// --- SVG Icons ---

const CheckCircleIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg
    {...props}
    xmlns="http://www.w3.org/2000/svg"
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
    <polyline points="22 4 12 14.01 9 11.01" />
  </svg>
);

const MastercardIcon = (props: React.SVGProps<SVGSVGElement>) => (
    <svg
        {...props}
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 24 24"
        width="36"
        height="24"
    >
        <circle cx="8" cy="12" r="7" fill="#EA001B"></circle>
        <circle cx="16" cy="12" r="7" fill="#F79E1B" fillOpacity="0.8"></circle>
    </svg>
);


// --- Helper Components ---

const DashedLine = () => (
  <div
    className="w-full border-t-2 border-dashed border-border"
    aria-hidden="true"
  />
);

const Barcode = ({ value }: { value: string }) => {
    const hashCode = (s: string) => s.split('').reduce((a, b) => { a = ((a << 5) - a) + b.charCodeAt(0); return a & a }, 0);
    const seed = hashCode(value || "123456");
    const random = (s: number) => {
        const x = Math.sin(s) * 10000;
        return x - Math.floor(x);
    };

    const bars = Array.from({ length: 60 }).map((_, index) => {
        const rand = random(seed + index);
        const width = rand > 0.7 ? 2.5 : 1.5;
        return { width };
    });

    const spacing = 1.5;
    const totalWidth = bars.reduce((acc, bar) => acc + bar.width + spacing, 0) - spacing;
    const svgWidth = 250;
    const svgHeight = 70;
    let currentX = (svgWidth - totalWidth) / 2;

    return (
        <div className="flex flex-col items-center py-2">
             <svg
                xmlns="http://www.w3.org/2000/svg"
                width={svgWidth}
                height={svgHeight}
                viewBox={`0 0 ${svgWidth} ${svgHeight}`}
                aria-label={`Barcode for value ${value}`}
                className="fill-current text-slate-800 dark:text-slate-200"
            >
                {bars.map((bar, index) => {
                    const x = currentX;
                    currentX += bar.width + spacing;
                    return (
                        <rect
                            key={index}
                            x={x}
                            y="10"
                            width={bar.width}
                            height="50"
                        />
                    );
                })}
            </svg>
            <p className="text-xs text-slate-500 dark:text-slate-400 tracking-[0.3em] mt-2 font-mono">{value}</p>
        </div>
    );
};

const ConfettiExplosion = () => {
  const confettiCount = 100;
  const colors = ["#ef4444", "#3b82f6", "#22c55e", "#eab308", "#8b5cf6", "#f97316"];

  return (
    <>
      <style>
        {`
          @keyframes fall {
            0% {
                transform: translateY(-10vh) rotate(0deg);
                opacity: 1;
            }
            100% {
              transform: translateY(110vh) rotate(720deg);
              opacity: 0;
            }
          }
        `}
      </style>
      <div className="fixed inset-0 z-0 pointer-events-none" aria-hidden="true">
        {Array.from({ length: confettiCount }).map((_, i) => (
          <div
            key={i}
            className="absolute w-2 h-4"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${-20 + Math.random() * 10}%`,
              backgroundColor: colors[i % colors.length],
              transform: `rotate(${Math.random() * 360}deg)`,
              animation: `fall ${2.5 + Math.random() * 2.5}s ${Math.random() * 2}s linear forwards`,
            }}
          />
        ))}
      </div>
    </>
  );
};


// --- Main Ticket Component ---

export interface TicketProps extends React.HTMLAttributes<HTMLDivElement> {
  ticketId?: string;
  bookingId?: string;
  amount?: number;
  totalAmount?: number;
  date?: Date;
  showDate?: string;
  showTime?: string;
  cardHolder?: string;
  userName?: string;
  last4Digits?: string;
  barcodeValue?: string;
  icon?: React.ReactNode;
  eventTitle?: string;
  movieTitle?: string;
  venue?: string;
  theaterName?: string;
  seatCodes?: string;
  seats?: string;
  ticketCount?: number;
  status?: string;
  onCancel?: () => void;
  triggerConfetti?: boolean;
}

const AnimatedTicket = React.forwardRef<HTMLDivElement, TicketProps>(
  (
    {
      className,
      ticketId,
      bookingId,
      amount,
      totalAmount,
      date,
      showDate,
      showTime,
      cardHolder,
      userName,
      last4Digits = "7719",
      barcodeValue,
      eventTitle,
      movieTitle,
      venue,
      theaterName,
      seatCodes,
      seats,
      ticketCount,
      status = "CONFIRMED",
      onCancel,
      triggerConfetti = false,
      ...props
    },
    ref
  ) => {
    const [showConfetti, setShowConfetti] = React.useState(false);

    React.useEffect(() => {
      if (triggerConfetti) {
        const mountTimer = setTimeout(() => setShowConfetti(true), 100);
        const unmountTimer = setTimeout(() => setShowConfetti(false), 6000);
        return () => {
          clearTimeout(mountTimer);
          clearTimeout(unmountTimer);
        };
      }
    }, [triggerConfetti]);

    const effectiveTicketId = ticketId || bookingId || "#TT-PASS-001";
    const effectiveAmount = amount ?? totalAmount ?? 0;
    const effectiveCardHolder = cardHolder || userName || "Guest Passholder";
    const effectiveTitle = eventTitle || movieTitle || "TownTrek District Pass";
    const effectiveVenue = venue || theaterName || "TownTrek District Arena";
    const effectiveSeats = seatCodes || seats || (ticketCount ? `${ticketCount} Pass(es)` : undefined);
    const effectiveBarcode = barcodeValue || effectiveTicketId.replace(/[^0-9]/g, '') || "481902847291";

    let effectiveDate = date;
    if (!effectiveDate) {
      if (showDate && showTime) {
        const parsed = new Date(`${showDate}T${showTime}`);
        effectiveDate = isNaN(parsed.getTime()) ? new Date() : parsed;
      } else if (showDate) {
        const parsed = new Date(showDate);
        effectiveDate = isNaN(parsed.getTime()) ? new Date() : parsed;
      } else {
        effectiveDate = new Date();
      }
    }

    const formattedAmount = new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 0,
    }).format(effectiveAmount);

    const formattedDate = new Intl.DateTimeFormat("en-GB", {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      hour12: false
    }).format(effectiveDate).replace(',', ' •');

    const isConfirmed = status.toUpperCase() === "CONFIRMED";

    return (
      <>
        {showConfetti && <ConfettiExplosion />}
        <div
          ref={ref}
          className={cn(
            "relative w-full max-w-sm bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 font-sans z-10 overflow-hidden mx-auto",
            "animate-in fade-in-0 zoom-in-95 duration-500",
            className
          )}
          {...props}
        >
          {/* Ticket cut-out effects with liquid glass styling */}
          <div className="absolute -left-4 top-[58%] -translate-y-1/2 w-8 h-8 rounded-full bg-slate-50 dark:bg-slate-950 border-r border-slate-200 dark:border-slate-800 shadow-inner" />
          <div className="absolute -right-4 top-[58%] -translate-y-1/2 w-8 h-8 rounded-full bg-slate-50 dark:bg-slate-950 border-l border-slate-200 dark:border-slate-800 shadow-inner" />

          {/* Header & Status */}
          <div className="p-7 flex flex-col items-center text-center">
              <div className={cn(
                "p-3 rounded-2xl animate-in zoom-in-50 delay-300 duration-500",
                isConfirmed ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400" : "bg-rose-500/10 text-rose-600 dark:text-rose-400"
              )}>
                  <CheckCircleIcon className="w-9 h-9 animate-in zoom-in-75 delay-500 duration-500" />
              </div>

              <div className="mt-3 flex items-center space-x-2">
                <span className={cn(
                  "text-[10px] font-black uppercase tracking-widest px-3 py-0.5 rounded-full border",
                  isConfirmed 
                    ? "bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-300 dark:border-emerald-800" 
                    : "bg-rose-50 text-rose-700 border-rose-200 dark:bg-rose-950/40 dark:text-rose-300 dark:border-rose-800"
                )}>
                  {status}
                </span>
              </div>

              <h1 className="text-xl font-bold mt-2 text-slate-900 dark:text-white">
                {effectiveTitle}
              </h1>
              {effectiveVenue && (
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                  {effectiveVenue}
                </p>
              )}
          </div>

          <div className="px-7 pb-7 space-y-5">
              <DashedLine />

              <div className="grid grid-cols-2 gap-4 text-left">
                  <div>
                      <p className="text-[11px] text-slate-400 uppercase font-semibold">Ticket ID</p>
                      <p className="font-mono font-medium text-xs text-slate-700 dark:text-slate-200 truncate">{effectiveTicketId}</p>
                  </div>
                  <div className="text-right">
                      <p className="text-[11px] text-slate-400 uppercase font-semibold">Total Paid</p>
                      <p className="font-bold text-base text-brand-600 dark:text-sky-400">{formattedAmount}</p>
                  </div>
              </div>

              <div className="grid grid-cols-2 gap-4 text-left">
                <div>
                    <p className="text-[11px] text-slate-400 uppercase font-semibold">Date &amp; Time</p>
                    <p className="font-medium text-xs">{formattedDate}</p>
                </div>
                {effectiveSeats && (
                  <div className="text-right">
                      <p className="text-[11px] text-slate-400 uppercase font-semibold">Seats / Slots</p>
                      <p className="font-bold text-xs text-slate-800 dark:text-slate-200">{effectiveSeats}</p>
                  </div>
                )}
              </div>

              <div className="bg-slate-50 dark:bg-slate-800/60 p-3.5 rounded-2xl flex items-center justify-between border border-slate-100 dark:border-slate-700/60">
                  <div className="flex items-center space-x-3">
                    <MastercardIcon />
                    <div>
                        <p className="font-semibold text-xs text-slate-900 dark:text-slate-100">{effectiveCardHolder}</p>
                        <p className="text-slate-400 font-mono text-[11px] tracking-wider">•••• {last4Digits}</p>
                    </div>
                  </div>
                  {onCancel && isConfirmed && (
                    <button
                      onClick={onCancel}
                      className="text-xs font-semibold text-rose-600 dark:text-rose-400 hover:underline px-2 py-1"
                    >
                      Cancel
                    </button>
                  )}
              </div>

              <DashedLine />

              <Barcode value={effectiveBarcode} />
          </div>
        </div>
      </>
    );
  }
);

AnimatedTicket.displayName = "AnimatedTicket";

export { AnimatedTicket };
export default AnimatedTicket;
