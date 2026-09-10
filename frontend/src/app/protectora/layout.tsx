import type { ReactNode } from "react";

export default function ProtectoraLayout({ children }: { children: ReactNode }) {
  return (
    <>
      <style>{`.protector-matrix-section { display: none !important; }`}</style>
      {children}
    </>
  );
}
