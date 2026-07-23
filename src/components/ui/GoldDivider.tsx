interface GoldDividerProps {
  className?: string;
  dot?: boolean;
}

export default function GoldDivider({ className = '', dot = true }: GoldDividerProps) {
  return (
    <div className={`flex items-center gap-4 ${className}`}>
      <div
        className="flex-1 h-px"
        style={{ background: 'linear-gradient(90deg, transparent, rgba(201,169,75,0.4))' }}
      />
      {dot && (
        <div
          className="w-1.5 h-1.5 rounded-full flex-shrink-0"
          style={{ background: 'linear-gradient(135deg, #C9A94B, #E8C96B)' }}
        />
      )}
      <div
        className="flex-1 h-px"
        style={{ background: 'linear-gradient(90deg, rgba(201,169,75,0.4), transparent)' }}
      />
    </div>
  );
}
