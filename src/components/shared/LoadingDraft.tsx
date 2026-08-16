export function LoadingDraft({ text = "Awaiting verification..." }: { text?: string }) {
  return (
    <div className="loading-draft" style={{ padding: '2rem' }}>
      <div className="loading-draft-icon">
        <svg viewBox="0 0 100 100">
          <path className="draft-line" d="M20,50 Q40,20 80,50 T20,50" />
        </svg>
      </div>
      <div className="loading-draft-text">{text}</div>
    </div>
  );
}
