export default function Loading() {
  return (
    <div className="mx-auto flex min-h-[45vh] max-w-7xl items-center px-4 py-10 sm:px-6">
      <div className="h-1.5 w-full overflow-hidden rounded-full bg-white/10">
        <div className="h-full w-1/3 animate-[loading-bar_820ms_ease-in-out_infinite] rounded-full bg-[linear-gradient(90deg,var(--brand-red),var(--brand-yellow),var(--brand-green))]" />
      </div>
    </div>
  );
}
