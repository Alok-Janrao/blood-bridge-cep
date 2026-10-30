import { useCallback, useEffect, useState, type FormEvent, type ReactNode } from 'react';
import { AlertTriangle, CheckCircle2, Clock, Droplets, Hospital, Loader2, Phone, RefreshCw, User } from 'lucide-react';
import { formatTimestamp } from '@/lib/dates';
import { createBloodRequest, listMyBloodRequests } from '@/services/bloodRequests';
import { BLOOD_GROUPS, URGENCY_LEVELS, type BloodGroup, type BloodRequest, type Urgency } from '@/types';

interface RequestFormState {
  patientName: string;
  bloodGroup: BloodGroup | '';
  units: string;
  hospital: string;
  contact: string;
  urgency: Urgency;
  notes: string;
}

type RequestFormErrors = Partial<Record<keyof RequestFormState, string>>;

const EMPTY_FORM: RequestFormState = {
  patientName: '',
  bloodGroup: '',
  units: '1',
  hospital: '',
  contact: '',
  urgency: 'Normal',
  notes: '',
};

const CONTACT_PATTERN = /^[+]?[0-9 -]{7,15}$/;

const URGENCY_STYLES: Record<Urgency, string> = {
  Normal: 'border-emerald-200 text-emerald-700 data-[active=true]:bg-emerald-600 data-[active=true]:text-white data-[active=true]:border-emerald-600',
  Urgent: 'border-amber-200 text-amber-700 data-[active=true]:bg-amber-500 data-[active=true]:text-white data-[active=true]:border-amber-500',
  Critical: 'border-red-200 text-red-700 data-[active=true]:bg-red-600 data-[active=true]:text-white data-[active=true]:border-red-600',
};

function validate(form: RequestFormState): RequestFormErrors {
  const errors: RequestFormErrors = {};
  const units = Number(form.units);

  if (form.patientName.trim().length < 2) errors.patientName = 'Enter the patient name.';
  if (!form.bloodGroup) errors.bloodGroup = 'Choose a blood group.';
  if (!Number.isInteger(units) || units < 1 || units > 10) errors.units = 'Enter between 1 and 10 units.';
  if (form.hospital.trim().length < 2) errors.hospital = 'Enter the hospital or location.';
  if (!CONTACT_PATTERN.test(form.contact.trim())) errors.contact = 'Enter a valid contact number.';
  if (form.notes.length > 1000) errors.notes = 'Keep notes under 1000 characters.';

  return errors;
}

function FormField({ label, error, children }: { label: string; error?: string; children: ReactNode }) {
  return (
    <div>
      <span className="label-text">{label}</span>
      {children}
      {error && <p className="mt-1.5 text-xs font-medium text-red-600">{error}</p>}
    </div>
  );
}

export default function RequestBloodPage() {
  const [form, setForm] = useState<RequestFormState>(EMPTY_FORM);
  const [errors, setErrors] = useState<RequestFormErrors>({});
  const [successMessage, setSuccessMessage] = useState('');
  const [submitError, setSubmitError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [requests, setRequests] = useState<BloodRequest[] | null>(null);
  const [loadError, setLoadError] = useState('');

  const loadRequests = useCallback(async () => {
    setLoadError('');
    try {
      setRequests(await listMyBloodRequests());
    } catch {
      setLoadError('We could not load your requests.');
    }
  }, []);

  useEffect(() => {
    loadRequests();
  }, [loadRequests]);

  const updateField = <K extends keyof RequestFormState>(field: K, value: RequestFormState[K]) => {
    setForm((prev) => ({ ...prev, [field]: value }));
    setErrors((prev) => ({ ...prev, [field]: undefined }));
    setSuccessMessage('');
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const nextErrors = validate(form);
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0 || !form.bloodGroup) return;

    const patientName = form.patientName.trim();
    setSubmitError('');
    setSuccessMessage('');
    setIsSubmitting(true);
    try {
      await createBloodRequest({
        patientName,
        bloodGroup: form.bloodGroup,
        units: Number(form.units),
        hospital: form.hospital.trim(),
        contact: form.contact.trim(),
        urgency: form.urgency,
        notes: form.notes.trim(),
      });
      setForm(EMPTY_FORM);
      setSuccessMessage(`Request for ${patientName} has been posted.`);
      await loadRequests();
    } catch {
      setSubmitError('We could not post your request. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const inputClass = (field: keyof RequestFormState) =>
    `input-field ${errors[field] ? 'border-red-400 focus:border-red-500' : ''}`;

  return (
    <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6 sm:py-12">
      <header className="animate-fade-up">
        <h1 className="text-3xl font-extrabold tracking-tight text-stone-900">Request blood</h1>
        <p className="mt-2 text-stone-600">Share the details below and nearby donors will be able to respond.</p>
      </header>

      <div className="mt-10 grid gap-8 lg:grid-cols-3">
        <form onSubmit={handleSubmit} noValidate className="card space-y-6 p-6 sm:p-8 lg:col-span-2 animate-fade-up [animation-delay:100ms]">
          {successMessage && (
            <div role="status" className="flex items-start gap-3 rounded-xl bg-emerald-50 px-4 py-3 text-sm font-medium text-emerald-800">
              <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-emerald-600" />
              {successMessage}
            </div>
          )}

          {submitError && (
            <p role="alert" className="rounded-xl bg-red-50 px-4 py-3 text-sm font-medium text-red-700">
              {submitError}
            </p>
          )}

          <div className="grid gap-6 sm:grid-cols-2">
            <FormField label="Patient name" error={errors.patientName}>
              <div className="relative">
                <User className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-stone-400" />
                <input
                  type="text"
                  value={form.patientName}
                  onChange={(event) => updateField('patientName', event.target.value)}
                  placeholder="Full name"
                  className={`${inputClass('patientName')} pl-11`}
                />
              </div>
            </FormField>

            <FormField label="Blood group" error={errors.bloodGroup}>
              <div className="relative">
                <Droplets className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-stone-400" />
                <select
                  value={form.bloodGroup}
                  onChange={(event) => updateField('bloodGroup', event.target.value as BloodGroup | '')}
                  className={`${inputClass('bloodGroup')} appearance-none pl-11`}
                >
                  <option value="">Select blood group</option>
                  {BLOOD_GROUPS.map((group) => (
                    <option key={group} value={group}>
                      {group}
                    </option>
                  ))}
                </select>
              </div>
            </FormField>

            <FormField label="Units needed" error={errors.units}>
              <input
                type="number"
                min={1}
                max={10}
                value={form.units}
                onChange={(event) => updateField('units', event.target.value)}
                className={inputClass('units')}
              />
            </FormField>

            <FormField label="Contact number" error={errors.contact}>
              <div className="relative">
                <Phone className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-stone-400" />
                <input
                  type="tel"
                  value={form.contact}
                  onChange={(event) => updateField('contact', event.target.value)}
                  placeholder="+91 98765 43210"
                  className={`${inputClass('contact')} pl-11`}
                />
              </div>
            </FormField>
          </div>

          <FormField label="Hospital or location" error={errors.hospital}>
            <div className="relative">
              <Hospital className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-stone-400" />
              <input
                type="text"
                value={form.hospital}
                onChange={(event) => updateField('hospital', event.target.value)}
                placeholder="City Hospital, Solapur"
                className={`${inputClass('hospital')} pl-11`}
              />
            </div>
          </FormField>

          <fieldset>
            <legend className="label-text">Urgency</legend>
            <div className="grid grid-cols-3 gap-3">
              {URGENCY_LEVELS.map((level) => {
                const isActive = form.urgency === level;
                return (
                  <button
                    key={level}
                    type="button"
                    data-active={isActive}
                    aria-pressed={isActive}
                    onClick={() => updateField('urgency', level)}
                    className={`rounded-xl border-2 bg-white px-3 py-3 text-sm font-semibold transition-all duration-200 hover:-translate-y-0.5 focus:outline-none focus-visible:ring-4 focus-visible:ring-red-100 ${URGENCY_STYLES[level]}`}
                  >
                    {level}
                  </button>
                );
              })}
            </div>
          </fieldset>

          <FormField label="Additional notes (optional)" error={errors.notes}>
            <textarea
              rows={4}
              value={form.notes}
              onChange={(event) => updateField('notes', event.target.value)}
              placeholder="Share the surgery date, ward, or any other helpful detail"
              className={`${inputClass('notes')} resize-none`}
            />
          </FormField>

          <div className="flex flex-col-reverse gap-3 pt-2 sm:flex-row sm:items-center sm:justify-between">
            <p className="flex items-center gap-2 text-xs text-stone-500">
              <AlertTriangle className="h-3.5 w-3.5 text-amber-500" />
              Only post requests for real, verified patients.
            </p>
            <button type="submit" disabled={isSubmitting} className="btn-primary">
              {isSubmitting && <Loader2 className="h-4 w-4 animate-spin" />}
              {isSubmitting ? 'Posting request...' : 'Submit request'}
            </button>
          </div>
        </form>

        <aside className="animate-fade-up [animation-delay:200ms]">
          <div className="card p-6">
            <h2 className="flex items-center justify-between text-lg font-bold text-stone-900">
              Your requests
              {requests && <span className="rounded-full bg-red-50 px-2.5 py-0.5 text-xs font-bold text-red-700">{requests.length}</span>}
            </h2>

            {loadError ? (
              <div role="alert" className="mt-4 flex flex-col items-start gap-3">
                <p className="text-sm text-stone-600">{loadError}</p>
                <button type="button" onClick={loadRequests} className="btn-secondary">
                  <RefreshCw className="h-4 w-4" />
                  Try again
                </button>
              </div>
            ) : requests === null ? (
              <div className="flex justify-center py-10 text-stone-500">
                <Loader2 className="h-5 w-5 animate-spin" />
              </div>
            ) : requests.length === 0 ? (
              <p className="mt-4 text-sm text-stone-500">No requests yet. Your submitted requests will appear here.</p>
            ) : (
              <ul className="mt-4 space-y-3">
                {requests.map((request) => (
                  <li key={request.id} className="rounded-xl border border-stone-100 bg-stone-50/60 p-4 transition-colors hover:border-red-100 hover:bg-red-50/40">
                    <div className="flex items-center justify-between gap-3">
                      <p className="truncate font-semibold text-stone-900">{request.patientName}</p>
                      <span className="shrink-0 rounded-lg bg-red-600 px-2 py-0.5 text-xs font-bold text-white">
                        {request.bloodGroup}
                      </span>
                    </div>
                    <p className="mt-1 truncate text-sm text-stone-600">
                      {request.units} {request.units === 1 ? 'unit' : 'units'} &middot; {request.hospital}
                    </p>
                    <p className="mt-2 flex items-center gap-1.5 text-xs text-stone-500">
                      <Clock className="h-3.5 w-3.5" />
                      {request.urgency} &middot; {formatTimestamp(request.createdAt)}
                    </p>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </aside>
      </div>
    </div>
  );
}
