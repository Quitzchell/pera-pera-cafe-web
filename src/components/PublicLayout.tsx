import type { ReactNode } from 'react';

export function PublicLayout({ title, children }: { title: string; children: ReactNode }) {
  return (
    <main className="mx-auto grid min-h-dvh max-w-sm content-center gap-8 px-4 py-10">
      <div className="grid gap-1 text-center">
        <p lang="ja" className="text-3xl font-semibold">
          ぺらぺら
        </p>
        <h1 className="text-muted-foreground text-xl font-medium">{title}</h1>
      </div>
      {children}
    </main>
  );
}
