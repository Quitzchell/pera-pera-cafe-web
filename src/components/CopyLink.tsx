import { Check, Copy } from 'lucide-react';
import { useState } from 'react';

import type { IssuedLink } from '@/api/types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { formatDateTime } from '@/lib/labels';

export function CopyLink({ link, expiresAt, label }: IssuedLink & { label: string }) {
  const [copied, setCopied] = useState(false);

  async function copy() {
    try {
      await navigator.clipboard.writeText(link);
      setCopied(true);
    } catch {
      setCopied(false);
    }
  }

  return (
    <div className="bg-accent text-accent-foreground grid gap-2 rounded-lg p-3">
      <p className="text-sm font-medium">{label}</p>
      <div className="flex gap-2">
        <Input
          readOnly
          value={link}
          aria-label={label}
          onFocus={(event) => event.currentTarget.select()}
          className="font-mono text-sm"
        />
        <Button type="button" variant="outline" onClick={copy}>
          {copied ? <Check aria-hidden /> : <Copy aria-hidden />}
          {copied ? 'Copied' : 'Copy'}
        </Button>
      </div>
      <p className="text-muted-foreground text-sm">Expires {formatDateTime(expiresAt)}</p>
      <span className="sr-only" aria-live="polite">
        {copied ? 'Link copied to clipboard' : ''}
      </span>
    </div>
  );
}
