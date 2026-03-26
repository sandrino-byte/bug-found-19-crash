import React from "react";

interface SystemPanelProps {
  title: string;
  children: React.ReactNode;
  className?: string;
}

const SystemPanel: React.FC<SystemPanelProps> = ({ title, children, className = "" }) => {
  return (
    <div className={`relative ${className}`}>
      <div className="panel-chamfer glow-border bg-card p-[1px]">
        <div className="panel-chamfer bg-card relative scanlines">
          <div className="border-b border-primary/20 px-4 py-2 flex items-center gap-2">
            <div className="w-1.5 h-1.5 bg-primary rotate-45" />
            <span className="text-primary text-xs font-semibold tracking-[0.2em] uppercase glow-text">
              {title}
            </span>
            <div className="flex-1 h-px bg-gradient-to-r from-primary/30 to-transparent" />
          </div>
          <div className="p-5">
            {children}
          </div>
        </div>
      </div>
    </div>
  );
};

export default SystemPanel;
