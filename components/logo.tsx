export function Logo({ size = "sm" }: { size?: "sm" | "lg" }) {
  return (
    <span className={`brand-logo brand-logo-${size}`}>
      <img src="/RevampedEPFOlogo.png" alt="EPFO Reimagined" />
    </span>
  );
}
