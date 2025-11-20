export default function Policies() {
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold">Policies & Compliance</h1>
      <ul className="list-disc pl-6 text-sm text-neutral-700">
        <li>Kyverno: require limits, block :latest, block privileged, readonly rootfs, verify signed</li>
        <li>EU-only defaults; see COMPLIANCE.md</li>
      </ul>
      <a className="text-accent underline" href="/COMPLIANCE.md">COMPLIANCE.md</a>
    </div>
  );
}



