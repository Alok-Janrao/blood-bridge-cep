import { ArrowRight, HeartHandshake, Search, Droplets, ShieldCheck } from 'lucide-react';
import BrandLogo from '@/components/BrandLogo';

interface LandingPageProps {
  onGetStarted: () => void;
}

const FEATURES = [
  {
    icon: Search,
    title: 'Find a donor fast',
    description: 'Search nearby donors by blood group and reach someone who can help in minutes.',
  },
  {
    icon: Droplets,
    title: 'Request blood in seconds',
    description: 'Post a request with urgency and hospital details so donors know where to go.',
  },
  {
    icon: HeartHandshake,
    title: 'Track your impact',
    description: 'See every donation you make and the number of lives your generosity has supported.',
  },
];

export default function LandingPage({ onGetStarted }: LandingPageProps) {
  return (
    <div className="flex flex-col">
      <section className="relative overflow-hidden bg-gradient-to-br from-red-50 via-white to-white">
        <div className="pointer-events-none absolute -right-32 -top-32 h-96 w-96 rounded-full bg-red-100/70 blur-3xl" />
        <div className="mx-auto grid max-w-6xl items-center gap-12 px-4 py-16 sm:px-6 md:py-24 lg:grid-cols-2">
          <div className="animate-fade-up">
            <span className="inline-flex items-center gap-2 rounded-full border border-red-100 bg-white px-3 py-1.5 text-xs font-semibold uppercase tracking-wider text-red-700 shadow-sm">
              <ShieldCheck className="h-3.5 w-3.5" />
              Trusted community of donors
            </span>
            <h1 className="mt-6 text-4xl font-extrabold leading-[1.1] tracking-tight text-stone-900 sm:text-5xl lg:text-6xl">
              Connecting donors <span className="text-red-600">with those in need</span>
            </h1>
            <p className="mt-6 max-w-xl text-base leading-relaxed text-stone-600 sm:text-lg">
              Blood Bridge links generous donors with hospitals and patients who need blood right now. Every donation
              can save up to three lives.
            </p>
            <div className="mt-10 flex flex-col gap-4 sm:flex-row sm:items-center">
              <button type="button" onClick={onGetStarted} className="btn-primary px-8 py-4 text-lg">
                Get Started
                <ArrowRight className="h-5 w-5" />
              </button>
              <p className="text-sm text-stone-500">Free to join. Takes less than a minute.</p>
            </div>
          </div>

          <div className="relative animate-fade-up [animation-delay:150ms]">
            <div className="absolute -inset-4 rounded-[2rem] bg-red-100/60" />
            <img
              src="https://images.pexels.com/photos/12227661/pexels-photo-12227661.jpeg?auto=compress&cs=tinysrgb&h=650&w=940"
              alt="Medical professional preparing a blood donation"
              className="relative h-[360px] w-full rounded-3xl object-cover shadow-2xl shadow-red-900/10 sm:h-[460px]"
            />
            <div className="absolute -bottom-6 left-6 flex items-center gap-3 rounded-2xl bg-white px-5 py-4 shadow-xl">
              <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-red-600 text-white">
                <Droplets className="h-5 w-5" />
              </span>
              <div>
                <p className="text-2xl font-extrabold leading-none text-stone-900">3 lives</p>
                <p className="mt-1 text-xs text-stone-500">saved by a single donation</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto w-full max-w-6xl px-4 py-20 sm:px-6">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="text-3xl font-extrabold tracking-tight text-stone-900 sm:text-4xl">
            Everything you need to save a life
          </h2>
          <p className="mt-4 text-stone-600">
            Simple tools for donors, patients, and families when every minute matters.
          </p>
        </div>

        <div className="mt-14 grid gap-6 md:grid-cols-3">
          {FEATURES.map((feature) => (
            <article
              key={feature.title}
              className="card group p-8 transition-all duration-300 hover:-translate-y-1 hover:border-red-100 hover:shadow-xl hover:shadow-red-900/5"
            >
              <span className="flex h-12 w-12 items-center justify-center rounded-xl bg-red-50 text-red-600 transition-colors duration-300 group-hover:bg-red-600 group-hover:text-white">
                <feature.icon className="h-6 w-6" />
              </span>
              <h3 className="mt-6 text-lg font-bold text-stone-900">{feature.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-stone-600">{feature.description}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="mx-auto mb-20 w-full max-w-6xl px-4 sm:px-6">
        <div className="flex flex-col items-center justify-between gap-6 rounded-3xl bg-red-600 px-8 py-10 text-center shadow-xl shadow-red-600/20 sm:flex-row sm:text-left">
          <div>
            <h2 className="text-2xl font-extrabold text-white sm:text-3xl">Ready to become a hero?</h2>
            <p className="mt-2 text-red-100">Join Blood Bridge and start helping people near you today.</p>
          </div>
          <button
            type="button"
            onClick={onGetStarted}
            className="inline-flex shrink-0 items-center gap-2 rounded-xl bg-white px-6 py-3 font-semibold text-red-700 transition-all duration-200 hover:-translate-y-0.5 hover:bg-red-50 focus:outline-none focus-visible:ring-4 focus-visible:ring-red-300"
          >
            Get Started
            <ArrowRight className="h-4 w-4" />
          </button>
        </div>
      </section>

      <footer className="border-t border-stone-100 py-8">
        <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-4 px-4 text-sm text-stone-500 sm:flex-row sm:px-6">
          <BrandLogo />
          <p>Connecting donors, saving lives.</p>
        </div>
      </footer>
    </div>
  );
}
