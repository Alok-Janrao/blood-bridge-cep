import { useState, type FormEvent } from 'react';
import { CalendarDays, Loader2, X } from 'lucide-react';
import { addDonation } from '@/services/donations';
import { toIsoDate } from '@/lib/dates';

interface LogDonationDialogProps {
  onClose: () => void;
  onSaved: () => void;
}

export default function LogDonationDialog({ onClose, onSaved }: LogDonationDialogProps) {
  const today = toIsoDate(new Date());
  const [donatedOn, setDonatedOn] = useState(today);
  const [error, setError] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!donatedOn || donatedOn > today) {
      setError('Choose a date that is today or earlier.');
      return;
    }

    setError('');
    setIsSaving(true);
    try {
      await addDonation(donatedOn);
      onSaved();
    } catch {
      setError('We could not save your donation. Please try again.');
      setIsSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-stone-900/50 px-4 backdrop-blur-sm animate-fade-up" role="dialog" aria-modal="true" aria-labelledby="log-donation-title">
      <div className="card w-full max-w-md p-6 shadow-2xl sm:p-8">
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-center gap-3">
            <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-red-50 text-red-600">
              <CalendarDays className="h-5 w-5" />
            </span>
            <div>
              <h2 id="log-donation-title" className="text-lg font-bold text-stone-900">
                Log a donation
              </h2>
              <p className="text-sm text-stone-500">Record the date you donated blood.</p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            className="rounded-lg p-1.5 text-stone-400 transition-colors hover:bg-stone-100 hover:text-stone-700 focus:outline-none focus-visible:ring-4 focus-visible:ring-red-100"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} noValidate className="mt-6 space-y-5">
          <div>
            <label htmlFor="donated-on" className="label-text">
              Donation date
            </label>
            <input
              id="donated-on"
              type="date"
              max={today}
              value={donatedOn}
              onChange={(event) => setDonatedOn(event.target.value)}
              className="input-field"
            />
          </div>

          {error && (
            <p role="alert" className="rounded-xl bg-red-50 px-4 py-3 text-sm font-medium text-red-700">
              {error}
            </p>
          )}

          <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
            <button type="button" onClick={onClose} className="btn-secondary">
              Cancel
            </button>
            <button type="submit" disabled={isSaving} className="btn-primary">
              {isSaving && <Loader2 className="h-4 w-4 animate-spin" />}
              Save donation
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
