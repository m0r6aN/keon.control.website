export function EvidenceBanner() {
  return (
    <div className="rounded border border-[#384656] bg-[#10121A] px-5 py-3 font-mono text-sm text-[--steel] shadow-[0_0_8px_rgba(0,0,0,0.4)]">
      <div className="text-[13px] font-semibold uppercase tracking-wider text-[--reactor-glow]">Evidence Mode</div>
      <p className="text-[11px] leading-tight text-[--steel]">Read-only proof surface. This is not a production control plane.</p>
    </div>
  );
}
