import { Link } from "react-router-dom";

export default function NotFound() {
  return (
    <div className="min-h-[70vh] flex flex-col items-center justify-center text-center px-5">
      <div className="font-display font-bold text-6xl text-volt-glow mb-4">404</div>
      <p className="text-cream-faint mb-6">This market doesn't exist — or it's private.</p>
      <Link to="/" className="btn-primary px-6 py-2.5 text-sm">Back home</Link>
    </div>
  );
}
