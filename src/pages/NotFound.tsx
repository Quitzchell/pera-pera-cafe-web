import { Link } from 'react-router-dom';

export function NotFound() {
  return (
    <div className="grid gap-3 py-10 text-center">
      <h1 className="text-2xl font-semibold">Page not found</h1>
      <p>
        <Link to="/" className="text-primary underline underline-offset-4">
          Go home
        </Link>
      </p>
    </div>
  );
}
