import React from "react";

interface ProcessProgressBoxProps {
  label: string;
  percent: number;
}

const ProcessProgressBox: React.FC<ProcessProgressBoxProps> = ({ label, percent }) => (
  <div className="fixed inset-0 z-[80] flex items-center justify-center bg-black/45 p-4">
    <div className="w-full max-w-sm rounded-xl bg-white p-5 shadow-card">
      <p className="mb-3 text-sm font-semibold text-wb-ink">{label}</p>
      <div className="h-2.5 overflow-hidden rounded-full bg-wb-canvas">
        <div
          className="h-full rounded-full bg-wb-blue transition-[width] duration-100"
          style={{ width: `${percent}%` }}
        />
      </div>
      <p className="mt-2 text-right text-sm font-bold text-wb-blue">{percent}%</p>
    </div>
  </div>
);

export default ProcessProgressBox;
