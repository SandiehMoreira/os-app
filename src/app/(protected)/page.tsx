import Link from "next/link";

export default function DashboardPage() {
  return (
    <div className="flex flex-1 flex-col gap-6 p-4">
      <Link
        href="/os/novo"
        className="rounded-xl bg-blue-600 px-4 py-3 text-center text-base font-medium text-white"
      >
        + Nova OS
      </Link>

      <div className="flex flex-1 items-center justify-center text-sm text-black/50 dark:text-white/50">
        Lista de OS em breve.
      </div>
    </div>
  );
}
