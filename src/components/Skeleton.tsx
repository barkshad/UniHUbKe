import React from 'react';
import { cn } from '../lib/utils';
import { motion } from 'motion/react';

export const Skeleton = ({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) => {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className={cn("animate-pulse bg-white/5 rounded-xl border border-white/5", className)}
      {...props}
    />
  );
};
