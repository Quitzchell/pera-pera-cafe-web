import { useId, type ReactElement, type ReactNode, cloneElement } from 'react';

interface FieldProps {
  label: ReactNode;
  hint?: ReactNode;
  children: ReactElement<{ id?: string; 'aria-describedby'?: string }>;
}

export function Field({ label, hint, children }: FieldProps) {
  const id = useId();
  const hintId = `${id}-hint`;

  return (
    <div className="grid gap-1.5">
      <label htmlFor={id} className="text-sm font-medium">
        {label}
      </label>
      {cloneElement(children, { id, 'aria-describedby': hint ? hintId : undefined })}
      {hint && (
        <p id={hintId} className="text-muted-foreground text-sm">
          {hint}
        </p>
      )}
    </div>
  );
}
