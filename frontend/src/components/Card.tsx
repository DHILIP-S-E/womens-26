import { motion } from 'framer-motion';
import type { ReactNode } from 'react';

interface CardProps {
  title?: string;
  children: ReactNode;
  className?: string;
  onClick?: () => void;
}

export function Card({ title, children, className = '', onClick }: CardProps) {
  return (
    <motion.div
      whileHover={{ scale: 1.02, boxShadow: '0 10px 25px rgba(0,0,0,0.1)' }}
      transition={{ duration: 0.2 }}
      onClick={onClick}
      className={`rounded-xl border border-[hsl(var(--border))] bg-[hsl(var(--card))] p-6 text-[hsl(var(--card-foreground))] shadow-sm ${onClick ? 'cursor-pointer' : ''} ${className}`}
    >
      {title && <h3 className="mb-3 text-lg font-semibold">{title}</h3>}
      {children}
    </motion.div>
  );
}
