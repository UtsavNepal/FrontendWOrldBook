import React from "react";

interface PageShellProps {
  title?: string;
  action?: React.ReactNode;
  wide?: boolean;
  children: React.ReactNode;
}

const PageShell: React.FC<PageShellProps> = ({ title, action, wide, children }) => (
  <div className="wb-page">
    <div className={wide ? "wb-container-wide" : "wb-container"}>
      {(title || action) && (
        <div className="mb-5 flex items-center justify-between gap-3">
          {title ? <h1 className="wb-title">{title}</h1> : <span />}
          {action}
        </div>
      )}
      {children}
    </div>
  </div>
);

export default PageShell;
