export function FieldError({ message }: { message?: string }) {
  if (!message) return null;
  return <p data-field-error="true" className="text-sm text-destructive">{message}</p>;
}
