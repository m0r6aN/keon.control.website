export function omegaFlowUrl(path: string): string {
  const base = process.env.NEXT_PUBLIC_OMEGA_FLOW_URL ?? "http://localhost:3000";
  return `${base.replace(/\/+$/, "")}${path}`;
}
