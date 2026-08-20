import React from 'react';
import { CheckCircle2, Clock, PackageCheck, Truck, XCircle, AlertCircle } from 'lucide-react';
import { cn } from '@/lib/utils';

export interface OrderStatusTrackerProps {
  status: string;
}

const STAGES = [
  { key: 'PENDING', label: 'Pending', icon: Clock },
  { key: 'CONFIRMED', label: 'Confirmed', icon: CheckCircle2 },
  { key: 'PROCESSING', label: 'Processing', icon: PackageCheck },
  { key: 'SHIPPED', label: 'Shipped', icon: Truck },
  { key: 'DELIVERED', label: 'Delivered', icon: CheckCircle2 },
];

export const OrderStatusTracker: React.FC<OrderStatusTrackerProps> = ({ status }) => {
  const isCancelled = status === 'CANCELLED';

  if (isCancelled) {
    return (
      <div className="p-4 bg-red-50 border border-red-200 rounded-xs flex items-center gap-3 text-red-800 text-xs font-semibold">
        <XCircle className="h-5 w-5 flex-shrink-0 text-red-600" />
        <div>
          <span className="font-bold block">Order Cancelled</span>
          <span className="text-[11px] font-normal text-red-700">
            This order has been cancelled. Contact Laraib Studio WhatsApp support for questions.
          </span>
        </div>
      </div>
    );
  }

  const currentIndex = STAGES.findIndex((s) => s.key === status);
  const activeIndex = currentIndex === -1 ? 0 : currentIndex;

  return (
    <div className="bg-white p-5 rounded-sm border border-stone-200 space-y-4 shadow-2xs">
      <h4 className="text-xs font-bold uppercase tracking-wider text-stone-700">
        Order Progress Status
      </h4>

      <div className="relative flex items-center justify-between">
        {/* Progress Bar Line */}
        <div className="absolute top-1/2 left-0 right-0 h-1 bg-stone-200 -translate-y-1/2 z-0" />
        <div
          className="absolute top-1/2 left-0 h-1 bg-brand-dark -translate-y-1/2 z-0 transition-all duration-500"
          style={{
            width: `${(activeIndex / (STAGES.length - 1)) * 100}%`,
          }}
        />

        {/* Steps */}
        {STAGES.map((stage, idx) => {
          const Icon = stage.icon;
          const isCompleted = idx <= activeIndex;
          const isCurrent = idx === activeIndex;

          return (
            <div key={stage.key} className="relative z-10 flex flex-col items-center gap-1.5">
              <div
                className={cn(
                  'w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-all shadow-xs',
                  isCurrent
                    ? 'bg-brand-dark text-white ring-4 ring-brand-dark/20 scale-110'
                    : isCompleted
                    ? 'bg-brand-dark text-white'
                    : 'bg-stone-100 text-stone-400 border border-stone-300'
                )}
              >
                <Icon className="h-4 w-4" />
              </div>
              <span
                className={cn(
                  'text-[11px] font-medium tracking-tight text-center hidden sm:block',
                  isCurrent
                    ? 'font-bold text-brand-dark'
                    : isCompleted
                    ? 'text-stone-800'
                    : 'text-stone-400'
                )}
              >
                {stage.label}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
};
