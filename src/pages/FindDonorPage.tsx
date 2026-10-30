import { useCallback, useEffect, useMemo, useState } from 'react';
import { Droplets, Loader2, MapPin, Clock, RefreshCw, Search, SearchX } from 'lucide-react';
import { formatDate } from '@/lib/dates';
import { listAvailableDonors } from '@/services/donors';
import { BLOOD_GROUPS, type BloodGroup, type Donor, type Page } from '@/types';

interface FindDonorPageProps {
  onNavigate: (page: Page) => void;
}

const ALL_GROUPS = 'All' as const;
type GroupFilter = BloodGroup | typeof ALL_GROUPS;

const GROUP_FILTERS: GroupFilter[] = [ALL_GROUPS, ...BLOOD_GROUPS];

function matchesSearch(donor: Donor, query: string) {
  if (!query) return true;
  return (
    donor.bloodGroup.toLowerCase().includes(query) ||
    donor.name.toLowerCase().includes(query) ||
    donor.city.toLowerCase().includes(query)
  );
}

export default function FindDonorPage({ onNavigate }: FindDonorPageProps) {
  const [donors, setDonors] = useState<Donor[] | null>(null);
  const [loadError, setLoadError] = useState('');
  const [search, setSearch] = useState('');
  const [groupFilter, setGroupFilter] = useState<GroupFilter>(ALL_GROUPS);

  const loadDonors = useCallback(async () => {
    setLoadError('');
    try {
      setDonors(await listAvailableDonors());
    } catch {
      setLoadError('We could not load the donor list.');
    }
  }, []);

  useEffect(() => {
    loadDonors();
  }, [loadDonors]);

  const results = useMemo(() => {
    const query = search.trim().toLowerCase();
    return (donors ?? [])
      .filter((donor) => (groupFilter === ALL_GROUPS || donor.bloodGroup === groupFilter) && matchesSearch(donor, query))
      .sort((a, b) => a.name.localeCompare(b.name));
  }, [donors, search, groupFilter]);

  return (
    <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6 sm:py-12">
      <header className="animate-fade-up">
        <h1 className="text-3xl font-extrabold tracking-tight text-stone-900">Find a donor</h1>
        <p className="mt-2 text-stone-600">Search by blood group, name, or city to find available donors.</p>
      </header>

      <div className="mt-8 space-y-5 animate-fade-up [animation-delay:100ms]">
        <div className="relative">
          <Search className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-stone-400" />
          <input
            type="search"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Search by blood group (e.g. A+, O-), name, or city"
            aria-label="Search donors"
            className="input-field py-4 pl-12 text-base shadow-sm"
          />
        </div>

        <div className="flex gap-2 overflow-x-auto pb-1" role="group" aria-label="Filter by blood group">
          {GROUP_FILTERS.map((group) => {
            const isActive = groupFilter === group;
            return (
              <button
                key={group}
                type="button"
                onClick={() => setGroupFilter(group)}
                aria-pressed={isActive}
                className={`shrink-0 rounded-full border px-4 py-2 text-sm font-semibold transition-all duration-200 focus:outline-none focus-visible:ring-4 focus-visible:ring-red-100 ${
                  isActive
                    ? 'border-red-600 bg-red-600 text-white shadow-md shadow-red-600/20'
                    : 'border-stone-200 bg-white text-stone-700 hover:border-red-200 hover:text-red-700'
                }`}
              >
                {group}
              </button>
            );
          })}
        </div>
      </div>

      {loadError ? (
        <div role="alert" className="card mt-10 flex flex-col items-center gap-4 px-6 py-12 text-center">
          <p className="font-semibold text-stone-900">{loadError}</p>
          <button type="button" onClick={loadDonors} className="btn-secondary">
            <RefreshCw className="h-4 w-4" />
            Try again
          </button>
        </div>
      ) : donors === null ? (
        <div className="mt-10 flex items-center justify-center py-20 text-stone-500">
          <Loader2 className="h-6 w-6 animate-spin" />
        </div>
      ) : (
        <>
          <p className="mt-8 text-sm text-stone-500" aria-live="polite">
            {results.length} {results.length === 1 ? 'donor' : 'donors'} found
          </p>

          {results.length === 0 ? (
            <div className="card mt-4 flex flex-col items-center px-6 py-16 text-center animate-fade-up">
              <span className="flex h-14 w-14 items-center justify-center rounded-2xl bg-stone-100 text-stone-500">
                <SearchX className="h-7 w-7" />
              </span>
              <h2 className="mt-5 text-lg font-bold text-stone-900">No donors match your search</h2>
              <p className="mt-2 max-w-sm text-sm text-stone-600">
                Try a different blood group or clear the search to see all available donors.
              </p>
              <button
                type="button"
                onClick={() => {
                  setSearch('');
                  setGroupFilter(ALL_GROUPS);
                }}
                className="btn-secondary mt-6"
              >
                Clear filters
              </button>
            </div>
          ) : (
            <ul className="mt-4 grid gap-4 md:grid-cols-2">
              {results.map((donor, index) => (
                <li
                  key={donor.id}
                  className="card flex items-center gap-4 p-5 animate-fade-up transition-all duration-300 hover:-translate-y-0.5 hover:border-red-100 hover:shadow-lg hover:shadow-red-900/5"
                  style={{ animationDelay: `${Math.min(index, 6) * 60}ms` }}
                >
                  <span className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-red-50 text-base font-extrabold text-red-700">
                    {donor.bloodGroup}
                  </span>

                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <h2 className="truncate font-bold text-stone-900">{donor.name}</h2>
                      <span className="rounded-full bg-emerald-50 px-2.5 py-0.5 text-xs font-semibold text-emerald-700">
                        Available
                      </span>
                    </div>
                    <p className="mt-1 flex items-center gap-1.5 text-sm text-stone-600">
                      <MapPin className="h-3.5 w-3.5 shrink-0 text-stone-400" />
                      <span className="truncate">{donor.city}</span>
                    </p>
                    <p className="mt-1 flex items-center gap-1.5 text-xs text-stone-500">
                      <Clock className="h-3.5 w-3.5 shrink-0" />
                      {donor.lastDonatedOn ? `Last donated ${formatDate(donor.lastDonatedOn)}` : 'Has not donated yet'}
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={() => onNavigate('request')}
                    className="btn-primary shrink-0 px-4 py-2 text-sm shadow-md"
                  >
                    <Droplets className="h-4 w-4" />
                    Request
                  </button>
                </li>
              ))}
            </ul>
          )}
        </>
      )}
    </div>
  );
}
