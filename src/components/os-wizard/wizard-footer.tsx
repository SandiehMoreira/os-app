export function WizardFooter({
  onBack,
  onNext,
  nextLabel = "Avançar",
  nextDisabled = false,
  hideBack = false,
}: {
  onBack: () => void;
  onNext: () => void;
  nextLabel?: string;
  nextDisabled?: boolean;
  hideBack?: boolean;
}) {
  return (
    <div className="flex gap-3 border-t border-black/10 p-4 pb-[calc(1rem+env(safe-area-inset-bottom)+28px)] dark:border-white/10">
      {!hideBack && (
        <button
          type="button"
          onClick={onBack}
          className="flex-1 rounded-xl border border-black/15 px-4 py-3 text-base font-medium dark:border-white/15"
        >
          Voltar
        </button>
      )}
      <button
        type="button"
        onClick={onNext}
        disabled={nextDisabled}
        className="flex-[2] rounded-xl bg-blue-600 px-4 py-3 text-base font-medium text-white disabled:opacity-50"
      >
        {nextLabel}
      </button>
    </div>
  );
}
