export function SafetyBanner() {
  return (
    <div className="sticky top-0 z-50 border-b border-danger/40 bg-danger/10 px-4 py-2 text-center text-sm text-danger">
      ⚠ HackLab is <strong>intentionally vulnerable</strong> — for learning on{' '}
      <strong>localhost only</strong>. Never deploy this publicly or point it at
      real systems.
    </div>
  );
}
