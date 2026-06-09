import { Link } from 'react-router-dom';

export default function NotFoundPage() {
  return (
    <div className="min-h-screen flex items-center justify-center px-4 bg-paper">
      <div className="text-center">
        <div className="font-scrawl font-bold text-[120px] leading-none text-paper-3 mb-4 select-none">404</div>
        <h1 className="font-scrawl font-bold text-3xl text-ink mb-3">Sahifa topilmadi</h1>
        <p className="text-ink-soft mb-8 max-w-sm">
          Bu sahifa mavjud emas yoki ko'chirilgan.
        </p>
        <Link to="/" className="btn-primary">
          Bosh sahifaga qaytish
        </Link>
      </div>
    </div>
  );
}
