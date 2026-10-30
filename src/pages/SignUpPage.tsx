import { useState, type FormEvent, type ReactNode } from 'react';
import { ArrowRight, Loader2, MapPin, Phone, User, Droplets, Mail, Lock } from 'lucide-react';
import BrandLogo from '@/components/BrandLogo';
import { useAuth } from '@/context/AuthContext';
import { BLOOD_GROUPS, type BloodGroup, type SignUpInput } from '@/types';

interface SignUpPageProps {
  onSwitchToLogin: () => void;
}

type SignUpFormState = Omit<SignUpInput, 'bloodGroup'> & { bloodGroup: BloodGroup | '' };
type SignUpFormErrors = Partial<Record<keyof SignUpFormState, string>>;

const EMPTY_FORM: SignUpFormState = {
  fullName: '',
  bloodGroup: '',
  phone: '',
  city: '',
  email: '',
  password: '',
};

const PHONE_PATTERN = /^[+]?[0-9 -]{7,15}$/;

function validate(form: SignUpFormState): SignUpFormErrors {
  const errors: SignUpFormErrors = {};
  if (form.fullName.trim().length < 2) errors.fullName = 'Enter your full name.';
  if (!form.bloodGroup) errors.bloodGroup = 'Choose your blood group.';
  if (!PHONE_PATTERN.test(form.phone.trim())) errors.phone = 'Enter a valid phone number.';
  if (form.city.trim().length < 2) errors.city = 'Enter your city.';
  if (!/^\S+@\S+\.\S+$/.test(form.email.trim())) errors.email = 'Enter a valid email address.';
  if (form.password.length < 6) errors.password = 'Use at least 6 characters.';
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

export default function SignUpPage({ onSwitchToLogin }: SignUpPageProps) {
  const { signUp } = useAuth();
  const [form, setForm] = useState<SignUpFormState>(EMPTY_FORM);
  const [errors, setErrors] = useState<SignUpFormErrors>({});
  const [serverError, setServerError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const updateField = <K extends keyof SignUpFormState>(field: K, value: SignUpFormState[K]) => {
    setForm((prev) => ({ ...prev, [field]: value }));
    setErrors((prev) => ({ ...prev, [field]: undefined }));
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setServerError('');

    const nextErrors = validate(form);
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0 || !form.bloodGroup) return;

    setIsSubmitting(true);
    try {
      await signUp({ ...form, bloodGroup: form.bloodGroup });
    } catch (caught) {
      setServerError(caught instanceof Error ? caught.message : 'Something went wrong. Please try again.');
      setIsSubmitting(false);
    }
  };

  const inputClass = (field: keyof SignUpFormState, withIcon = true) =>
    `input-field ${withIcon ? 'pl-11' : ''} ${errors[field] ? 'border-red-400 focus:border-red-500' : ''}`;

  return (
    <div className="flex min-h-[calc(100vh-73px)] items-center justify-center bg-gradient-to-br from-red-50 via-white to-white px-4 py-12">
      <div className="w-full max-w-lg animate-fade-up">
        <div className="mb-8 flex flex-col items-center text-center">
          <BrandLogo size="lg" />
          <h1 className="mt-6 text-2xl font-extrabold text-stone-900">Become a donor</h1>
          <p className="mt-2 text-sm text-stone-600">Create your account to start donating and helping patients.</p>
        </div>

        <form onSubmit={handleSubmit} noValidate className="card space-y-5 p-8 shadow-xl shadow-red-900/5">
          <div className="grid gap-5 sm:grid-cols-2">
            <div className="sm:col-span-2">
              <FormField label="Full name" error={errors.fullName}>
                <div className="relative">
                  <User className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-stone-400" />
                  <input
                    type="text"
                    autoComplete="name"
                    value={form.fullName}
                    onChange={(event) => updateField('fullName', event.target.value)}
                    placeholder="Rahul Sharma"
                    className={inputClass('fullName')}
                  />
                </div>
              </FormField>
            </div>

            <FormField label="Blood group" error={errors.bloodGroup}>
              <div className="relative">
                <Droplets className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-stone-400" />
                <select
                  value={form.bloodGroup}
                  onChange={(event) => updateField('bloodGroup', event.target.value as BloodGroup | '')}
                  className={`${inputClass('bloodGroup')} appearance-none`}
                >
                  <option value="">Select</option>
                  {BLOOD_GROUPS.map((group) => (
                    <option key={group} value={group}>
                      {group}
                    </option>
                  ))}
                </select>
              </div>
            </FormField>

            <FormField label="City" error={errors.city}>
              <div className="relative">
                <MapPin className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-stone-400" />
                <input
                  type="text"
                  value={form.city}
                  onChange={(event) => updateField('city', event.target.value)}
                  placeholder="Solapur"
                  className={inputClass('city')}
                />
              </div>
            </FormField>

            <div className="sm:col-span-2">
              <FormField label="Phone number" error={errors.phone}>
                <div className="relative">
                  <Phone className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-stone-400" />
                  <input
                    type="tel"
                    autoComplete="tel"
                    value={form.phone}
                    onChange={(event) => updateField('phone', event.target.value)}
                    placeholder="+91 98765 43210"
                    className={inputClass('phone')}
                  />
                </div>
              </FormField>
            </div>

            <div className="sm:col-span-2">
              <FormField label="Email" error={errors.email}>
                <div className="relative">
                  <Mail className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-stone-400" />
                  <input
                    type="email"
                    autoComplete="email"
                    value={form.email}
                    onChange={(event) => updateField('email', event.target.value)}
                    placeholder="you@example.com"
                    className={inputClass('email')}
                  />
                </div>
              </FormField>
            </div>

            <div className="sm:col-span-2">
              <FormField label="Password" error={errors.password}>
                <div className="relative">
                  <Lock className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-stone-400" />
                  <input
                    type="password"
                    autoComplete="new-password"
                    value={form.password}
                    onChange={(event) => updateField('password', event.target.value)}
                    placeholder="At least 6 characters"
                    className={inputClass('password')}
                  />
                </div>
              </FormField>
            </div>
          </div>

          {serverError && (
            <p role="alert" className="rounded-xl bg-red-50 px-4 py-3 text-sm font-medium text-red-700">
              {serverError}
            </p>
          )}

          <button type="submit" disabled={isSubmitting} className="btn-primary w-full">
            {isSubmitting ? (
              <>
                <Loader2 className="h-5 w-5 animate-spin" />
                Creating account...
              </>
            ) : (
              <>
                Create account
                <ArrowRight className="h-5 w-5" />
              </>
            )}
          </button>
        </form>

        <p className="mt-6 text-center text-sm text-stone-600">
          Already have an account?{' '}
          <button type="button" onClick={onSwitchToLogin} className="font-semibold text-red-600 hover:text-red-700 hover:underline">
            Log in
          </button>
        </p>
      </div>
    </div>
  );
}
