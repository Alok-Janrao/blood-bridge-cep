import { useCallback, useEffect, useMemo, useState } from 'react';
import { ArrowRight, CalendarDays, Droplets, HeartHandshake, Loader2, Plus, Search, RefreshCw } from 'lucide-react';
import LogDonationDialog from '@/components/LogDonationDialog';
import { useAuth } from '@/context/AuthContext';
import { WHOLE_BLOOD_INTERVAL_DAYS, addDays, formatDate, toIsoDate } from '@/lib/dates';
import { listDonations } from '@/services/donations';
import type { Donation, Page } from '@/types';

interface DonorDashboardPageProps {
  onNavigate: (page: Page) => void;
}

const QUICK_ACTIONS: { page: Page; label: string; description: string; icon: typeof Search }[] = [
  { page: 'find', label: 'Find a Donor', description: 'Search donors by blood group', icon: Search },
  { page: 'request', label: 'Request Blood', description: 'Post a request for a patient', icon: Droplets },
];

function getNextEligibleLabel(donations: Donation[]): string {
  const latest = donations[0];
  if (!latest) return 'Eligible now';

  const nextDate = addDays(latest.donatedOn, WHOLE_BLOOD_INTERVAL_DAYS);
  return nextDate <= toIsoDate(new Date()) ? 'Eligible now' : formatDate(nextDate);
}

export default function DonorDashboardPage({ onNavigate }: DonorDashboardPageProps) {
  const { profile } = useAuth();
  const [donations, setDonations] = useState<Donation[] | null>(null);
  const [loadError, setLoadError] = useState('');
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const loadDonations = useCallback(async () => {
    setLoadError('');
    try {
      setDonations(await listDonations());
    } catch {
      setLoadError('We could not load your donations.');
    }
  }, []);

  useEffect(() => {
    loadDonations();
  }, [loadDonations]);

  const stats = useMemo(() => {
    const list = donations ?? [];
    return {
      totalDonations: list.length,
      livesHelped: list.reduce((sum, donation) => sum + donation.livesHelped, 0),
      nextEligible: getNextEligibleLabel(list),
    };
  }, [donations]);

  const initials = (profile?.fullName ?? '')
    .split(' ')
    .filter(Boolean)
    .map((part) => part[0])
    .join('')
    .slice(0, 2);

  return (
    <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6 sm:py-12">
      <header className="flex flex-col gap-6 animate-fade-up sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-4">
          <span className="flex h-14 w-14 items-center justify-center rounded-2xl bg-red-600 text-lg font-extrabold text-white shadow-lg shadow-red-600/25">
            {initials || '?'}
          </span>
          <div>
            <p className="text-sm text-stone-500">Welcome back</p>
            <h1 className="text-2xl font-extrabold tracking-tight text-stone-900 sm:text-3xl">
              {profile?.fullName ?? 'Donor'}
            </h1>
            {profile && (
              <div className="mt-2 flex flex-wrap items-center gap-2">
                <span className="rounded-full bg-red-50 px-3 py-1 text-xs font-bold text-red-700">
                  {profile.bloodGroup} Blood Group
                </span>
                <span className="rounded-full bg-stone-100 px-3 py-1 text-xs font-semibold text-stone-600">
                  {profile.city}
                </span>
              </div>
            )}
          </div>
        </div>
        <button type="button" onClick={() => setIsDialogOpen(true)} className="btn-primary self-start sm:self-auto">
          <Plus className="h-4 w-4" />
          Log a donation
        </button>
      </header>

      {loadError ? (
        <div role="alert" className="card mt-10 flex flex-col items-center gap-4 px-6 py-12 text-center">
          <p className="font-semibold text-stone-900">{loadError}</p>
          <button type="button" onClick={loadDonations} className="btn-secondary">
            <RefreshCw className="h-4 w-4" />
            Try again
          </button>
        </div>
      ) : donations === null ? (
        <div className="mt-10 flex items-center justify-center py-20 text-stone-500">
          <Loader2 className="h-6 w-6 animate-spin" />
        </div>
      ) : (
        <>
          <section className="mt-10 grid gap-6 md:grid-cols-2">
            <article className="card group relative overflow-hidden p-8 animate-fade-up transition-all duration-300 hover:-translate-y-1 hover:shadow-xl hover:shadow-red-900/5">
              <div className="absolute -right-10 -top-10 h-32 w-32 rounded-full bg-red-50 transition-transform duration-500 group-hover:scale-125" />
              <div className="relative flex items-start justify-between">
                <div>
                  <p className="text-sm font-semibold uppercase tracking-wider text-stone-500">Total Donations</p>
                  <p className="mt-3 text-5xl font-extrabold tracking-tight text-stone-900">{stats.totalDonations}</p>
                </div>
                <span className="flex h-12 w-12 items-center justify-center rounded-xl bg-red-600 text-white shadow-md shadow-red-600/25">
                  <Droplets className="h-6 w-6" />
                </span>
              </div>
            </article>

            <article className="card group relative overflow-hidden p-8 animate-fade-up transition-all duration-300 hover:-translate-y-1 hover:shadow-xl hover:shadow-red-900/5 [animation-delay:120ms]">
              <div className="absolute -right-10 -top-10 h-32 w-32 rounded-full bg-red-50 transition-transform duration-500 group-hover:scale-125" />
              <div className="relative flex items-start justify-between">
                <div>
                  <p className="text-sm font-semibold uppercase tracking-wider text-stone-500">Lives Helped</p>
                  <p className="mt-3 text-5xl font-extrabold tracking-tight text-stone-900">{stats.livesHelped}</p>
                </div>
                <span className="flex h-12 w-12 items-center justify-center rounded-xl bg-red-600 text-white shadow-md shadow-red-600/25">
                  <HeartHandshake className="h-6 w-6" />
                </span>
              </div>
            </article>
          </section>

          <section className="mt-6 grid gap-6 lg:grid-cols-3">
            <article className="card flex flex-col justify-between p-8">
              <div>
                <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-red-50 text-red-600">
                  <CalendarDays className="h-5 w-5" />
                </span>
                <p className="mt-5 text-sm font-semibold uppercase tracking-wider text-stone-500">Next eligible date</p>
                <p className="mt-2 text-2xl font-extrabold text-stone-900">{stats.nextEligible}</p>
              </div>
              <p className="mt-6 rounded-xl bg-stone-50 px-4 py-3 text-sm text-stone-600">
                {donations.length === 0
                  ? 'Log your first donation to start tracking your impact.'
                  : `You can donate again ${WHOLE_BLOOD_INTERVAL_DAYS} days after your last donation.`}
              </p>
            </article>

            <article className="card p-8 lg:col-span-2">
              <h2 className="text-lg font-bold text-stone-900">Quick actions</h2>
              <p className="mt-1 text-sm text-stone-500">Jump straight to what you need.</p>
              <div className="mt-6 grid gap-4 sm:grid-cols-2">
                {QUICK_ACTIONS.map((action) => (
                  <button
                    key={action.page}
                    type="button"
                    onClick={() => onNavigate(action.page)}
                    className="group flex items-center gap-4 rounded-2xl border border-stone-200 p-5 text-left transition-all duration-200 hover:-translate-y-0.5 hover:border-red-200 hover:bg-red-50/50 hover:shadow-md focus:outline-none focus-visible:ring-4 focus-visible:ring-red-100"
                  >
                    <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-red-50 text-red-600 transition-colors duration-200 group-hover:bg-red-600 group-hover:text-white">
                      <action.icon className="h-5 w-5" />
                    </span>
                    <span className="flex-1">
                      <span className="block font-semibold text-stone-900">{action.label}</span>
                      <span className="block text-sm text-stone-500">{action.description}</span>
                    </span>
                    <ArrowRight className="h-4 w-4 text-stone-400 transition-transform duration-200 group-hover:translate-x-1 group-hover:text-red-600" />
                  </button>
                ))}
              </div>
            </article>
          </section>

          <section className="card mt-6 p-8">
            <h2 className="text-lg font-bold text-stone-900">Donation history</h2>
            {donations.length === 0 ? (
              <p className="mt-3 text-sm text-stone-500">No donations recorded yet.</p>
            ) : (
              <ul className="mt-5 divide-y divide-stone-100">
                {donations.map((donation) => (
                  <li key={donation.id} className="flex items-center justify-between gap-4 py-4">
                    <span className="flex items-center gap-3">
                      <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-red-50 text-red-600">
                        <Droplets className="h-4 w-4" />
                      </span>
                      <span className="font-medium text-stone-900">{formatDate(donation.donatedOn)}</span>
                    </span>
                    <span className="text-sm text-stone-500">
                      {donation.livesHelped} {donation.livesHelped === 1 ? 'life' : 'lives'} helped
                    </span>
                  </li>
                ))}
              </ul>
            )}
          </section>
        </>
      )}

      {isDialogOpen && (
        <LogDonationDialog
          onClose={() => setIsDialogOpen(false)}
          onSaved={() => {
            setIsDialogOpen(false);
            loadDonations();
          }}
        />
      )}
    </div>
  );
}
