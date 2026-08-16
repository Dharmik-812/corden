"use client";

import type { SaveStatus } from "@/hooks/useProjectSave";

export function SaveIndicator({
  status,
  onSave,
  title,
}: {
  status: SaveStatus;
  onSave: () => void;
  title?: string;
}) {
  const label =
    status === "saving" ? "Saving…" : status === "unsaved" ? "Unsaved" : "Saved";

  return (
    <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
      {title && (
        <span
          style={{
            fontSize: "0.75rem",
            color: "rgba(255,255,255,0.5)",
            maxWidth: "160px",
            overflow: "hidden",
            textOverflow: "ellipsis",
            whiteSpace: "nowrap",
          }}
        >
          {title}
        </span>
      )}
      <div className="autosave-indicator">
        <span
          className={`autosave-dot${status === "saving" ? " saving" : ""}`}
          style={status === "unsaved" ? { background: "var(--warning)" } : undefined}
        />
        {label}
      </div>
      <button
        onClick={onSave}
        disabled={status === "saving"}
        style={{
          padding: "5px 12px",
          borderRadius: "8px",
          border: "1px solid rgba(71,114,179,0.4)",
          background: "rgba(71,114,179,0.15)",
          color: "#4772b3",
          fontSize: "0.75rem",
          fontWeight: 600,
          cursor: status === "saving" ? "wait" : "pointer",
          opacity: status === "saving" ? 0.6 : 1,
        }}
      >
        Save
      </button>
    </div>
  );
}
