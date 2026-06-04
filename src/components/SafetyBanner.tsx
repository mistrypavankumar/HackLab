export function SafetyBanner() {
  return (
    <div className="sticky top-0 z-50 border-b border-danger/40 bg-danger/10 px-4 py-2 text-center text-sm text-danger">
      ⚠ Public demo — HackLab is <strong>intentionally vulnerable</strong> by
      design. Don’t enter real data, credentials, or anything sensitive. All
      “secrets” here are fake.
    </div>
  );
}
