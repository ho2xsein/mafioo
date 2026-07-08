import type { PropsWithChildren, ReactNode } from "react";

interface CardProps {
  title?: ReactNode;
  actions?: ReactNode;
  className?: string;
}

export function Card({ title, actions, className, children }: PropsWithChildren<CardProps>) {
  return (
    <div className={`card ${className ?? ""}`}>
      {(title || actions) && (
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
          {title && <h3 style={{ margin: 0 }}>{title}</h3>}
          {actions}
        </div>
      )}
      {children}
    </div>
  );
}
