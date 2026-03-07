export default function Home() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-[var(--color-bg-primary)] p-4">
      <main className="animate-fade-in text-center">
        <h1 className="mb-4 text-5xl font-bold text-[var(--color-snake)] drop-shadow-[0_0_10px_rgba(57,255,20,0.5)]">
          SNAKE GAME
        </h1>
        <p className="mb-8 text-lg text-[var(--color-text-secondary)]">
          Classic arcade action. Modern web tech.
        </p>
        <div className="rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] p-8">
          <p className="text-[var(--color-text-muted)]">
            Game implementation coming soon...
          </p>
          <div className="mt-4 flex justify-center gap-2">
            <div className="h-3 w-3 animate-pulse rounded-sm bg-[var(--color-snake)]" />
            <div className="h-3 w-3 animate-pulse rounded-sm bg-[var(--color-snake)] [animation-delay:150ms]" />
            <div className="h-3 w-3 animate-pulse rounded-sm bg-[var(--color-snake)] [animation-delay:300ms]" />
          </div>
        </div>
      </main>
    </div>
  );
}
