import { LanguageSwitcher } from "@/components/language-switcher";
import { AppHeader, Icon, IconTile, ui } from "@/components/ui";
import { getCurrentDictionary } from "@/lib/i18n/server";
import Link from "next/link";

const previewResultMeta = [
  { icon: "document", accent: "blue" },
  { icon: "chart", accent: "emerald" },
  { icon: "shield", accent: "violet" },
] as const;

const implementedFeatureMeta = [
  { icon: "lock", accent: "blue" },
  { icon: "team", accent: "emerald" },
  { icon: "document", accent: "violet" },
  { icon: "shield", accent: "blue" },
  { icon: "search", accent: "emerald" },
  { icon: "question", accent: "violet" },
  { icon: "check", accent: "blue" },
  { icon: "network", accent: "emerald" },
] as const;

const repositoryUrl = "https://github.com/jiwonjae-svg/DocuMind";
const implementationUrl = `${repositoryUrl}/blob/main/README.md`;

export default async function Home() {
  const copy = await getCurrentDictionary();

  return (
    <main className={ui.page}>
      <AppHeader>
        <nav
          aria-label="Primary navigation"
          className="flex flex-wrap items-center justify-end gap-2 sm:gap-3"
        >
          <LanguageSwitcher />
          <Link href="/dashboard" className={ui.secondaryButton}>
            {copy.common.dashboard}
          </Link>
          <Link href="/signup" className={ui.secondaryButton}>
            {copy.common.signup}
          </Link>
          <Link href="/login" className={ui.primaryButton}>
            {copy.common.login}
          </Link>
        </nav>
      </AppHeader>

      <section className={ui.gradientBand}>
        <div
          className={`${ui.container} grid min-w-0 grid-cols-1 gap-10 py-10 sm:py-14 lg:grid-cols-[0.95fr_1.05fr] lg:py-16`}
        >
          <div className="flex flex-col justify-center">
            <p className={ui.eyebrow}>{copy.home.heroEyebrow}</p>
            <h1 className="mt-5 max-w-3xl text-4xl font-semibold tracking-normal text-[#080f2f] sm:text-6xl lg:text-7xl">
              DocuMind
            </h1>
            <p className="mt-6 max-w-2xl text-lg leading-8 text-slate-700">
              {copy.home.heroBody}
            </p>
            <p className="mt-5 max-w-2xl text-[15px] leading-7 text-slate-700">
              {copy.home.heroLocalized}
            </p>
            <div className="mt-7 flex flex-col gap-3 sm:flex-row">
              <Link
                href="/dashboard"
                className={`${ui.primaryButton} w-full sm:w-auto`}
              >
                <span className="grid h-6 w-6 place-items-center rounded-full border border-white/40">
                  <Icon name="compass" className="h-3.5 w-3.5" />
                </span>
                {copy.home.openDashboard}
              </Link>
              <a
                href={implementationUrl}
                target="_blank"
                rel="noreferrer noopener"
                aria-label={copy.home.viewImplementationAria}
                className={`${ui.secondaryButton} w-full sm:w-auto`}
              >
                <Icon name="view" className="h-5 w-5 text-blue-700" />
                {copy.home.viewImplementation}
              </a>
            </div>
            <div className="mt-5 max-w-2xl border-l-4 border-blue-600 bg-white/80 px-5 py-4 shadow-sm">
              <p className="text-sm font-semibold leading-6 text-[#10204b]">
                {copy.home.builtWith}
              </p>
              <p className="mt-1 text-sm leading-6 text-slate-600">
                {copy.home.builtWithAlt}
              </p>
            </div>
          </div>

          <aside className={`${ui.card} min-w-0 p-7`}>
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-sm font-semibold uppercase tracking-[0.12em] text-slate-500">
                  {copy.home.previewLabel}
                </p>
                <h2 className="mt-2 text-lg font-semibold text-[#080f2f]">
                  {copy.home.previewHeading}
                </h2>
              </div>
              <span className="rounded-md bg-emerald-100 px-3 py-2 text-sm font-semibold text-emerald-700">
                {copy.home.mvp}
              </span>
            </div>

            <div className="mt-8 flex h-14 items-center gap-4 rounded-lg border border-slate-300 bg-white px-5 text-slate-500 shadow-sm">
              <Icon name="search" className="h-5 w-5 shrink-0 text-slate-600" />
              <p className="min-w-0 flex-1 truncate text-base">
                {copy.home.previewPlaceholder}
              </p>
              <Icon
                name="settings"
                className="h-5 w-5 shrink-0 text-slate-600"
              />
            </div>

            <div className="mt-6 divide-y divide-slate-200 border-t border-slate-200">
              {copy.home.previewResults.map(([title, updatedAt], index) => {
                const result = previewResultMeta[index];

                return (
                  <div
                    key={title}
                    className="grid grid-cols-[64px_1fr_auto_auto] items-center gap-4 py-6 max-sm:grid-cols-[56px_1fr] max-sm:gap-y-2"
                  >
                    <IconTile accent={result.accent} icon={result.icon} />
                    <div className="min-w-0">
                      <h3 className="truncate text-base font-semibold text-[#0b1535]">
                        {title}
                      </h3>
                      <p className="mt-1 truncate text-sm text-slate-600">
                        {copy.home.previewSubtext}
                      </p>
                    </div>
                    <p className="text-sm font-medium text-slate-500 max-sm:col-start-2">
                      {updatedAt}
                    </p>
                    <Icon
                      name="arrow"
                      className="h-5 w-5 text-slate-600 max-sm:hidden"
                    />
                  </div>
                );
              })}
            </div>
          </aside>
        </div>
      </section>

      <section id="implemented" className={`${ui.container} py-12 sm:py-14`}>
        <div className="mb-7 max-w-3xl">
          <p className={ui.eyebrow}>{copy.home.implementedEyebrow}</p>
          <h2 className="mt-4 text-3xl font-semibold tracking-normal text-[#080f2f]">
            {copy.home.implementedTitle}
          </h2>
          <p className="mt-4 text-sm leading-6 text-slate-600">
            {copy.home.implementedBody}
          </p>
        </div>
        <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-4">
          {copy.home.features.map(([title, body], index) => {
            const feature = implementedFeatureMeta[index];

            return (
              <article key={title} className={`${ui.subtleCard} p-6`}>
                <IconTile accent={feature.accent} icon={feature.icon} />
                <h3 className="mt-5 text-lg font-semibold text-[#0b1535]">
                  {title}
                </h3>
                <p className="mt-3 text-sm leading-6 text-slate-600">
                  {body}
                </p>
              </article>
            );
          })}
        </div>
      </section>

      <section className="border-y border-slate-200/80 bg-white/70">
        <div
          className={`${ui.container} grid gap-8 py-10 lg:grid-cols-[0.65fr_1.35fr] lg:items-start`}
        >
          <div>
            <p className={ui.eyebrow}>{copy.home.plannedEyebrow}</p>
            <h2 className="mt-4 text-2xl font-semibold tracking-normal text-[#080f2f]">
              {copy.home.plannedTitle}
            </h2>
            <p className="mt-3 text-sm leading-6 text-slate-600">
              {copy.home.plannedBody}
            </p>
          </div>
          <ul className="grid gap-x-8 gap-y-3 sm:grid-cols-2">
            {copy.home.planned.map((feature) => (
              <li
                key={feature}
                className="flex items-start gap-3 border-b border-slate-200 pb-3 text-sm leading-6 text-slate-600"
              >
                <span
                  aria-hidden="true"
                  className="mt-2 h-2 w-2 shrink-0 rounded-full bg-slate-400"
                />
                {feature}
              </li>
            ))}
          </ul>
        </div>
      </section>

      <section>
        <div className={`${ui.container} py-12 sm:py-14`}>
          <div className="max-w-3xl">
            <p className={ui.eyebrow}>{copy.home.architectureEyebrow}</p>
            <h2 className="mt-4 text-3xl font-semibold tracking-normal text-[#080f2f]">
              {copy.home.architectureTitle}
            </h2>
            <p className="mt-4 text-sm leading-6 text-slate-600">
              {copy.home.architectureBody}
            </p>
          </div>
          <ol className="mt-8 grid border-l border-t border-slate-200 bg-white sm:grid-cols-2 lg:grid-cols-3">
            {copy.home.flow.map(([title, body], index) => (
              <li
                key={title}
                className="min-h-40 border-b border-r border-slate-200 p-6"
              >
                <div className="flex items-center gap-3">
                  <span className="font-mono text-xs font-semibold text-blue-700">
                    {String(index + 1).padStart(2, "0")}
                  </span>
                  <h3 className="text-base font-semibold text-[#0b1535]">
                    {title}
                  </h3>
                </div>
                <p className="mt-4 text-sm leading-6 text-slate-600">
                  {body}
                </p>
              </li>
            ))}
          </ol>
        </div>
      </section>

      <section className="border-t border-slate-200/80 bg-white/70">
        <div className={`${ui.container} py-12 sm:py-14`}>
          <div className="grid gap-6 lg:grid-cols-2">
            <article className={`${ui.card} p-7`}>
              <IconTile accent="emerald" icon="network" />
              <p className={`${ui.eyebrow} mt-5`}>
                {copy.home.whyAgentEyebrow}
              </p>
              <h2 className="mt-4 text-3xl font-semibold tracking-normal text-[#080f2f]">
                {copy.home.whyAgentTitle}
              </h2>
              <p className="mt-4 text-sm leading-6 text-slate-600">
                {copy.home.whyAgentBody}
              </p>
              <p className="mt-4 rounded-lg border border-emerald-100 bg-emerald-50 px-4 py-3 text-sm leading-6 text-emerald-800">
                {copy.home.whyAgentLocalized}
              </p>
            </article>

            <article className={`${ui.card} p-7`}>
              <IconTile accent="blue" icon="check" />
              <p className={`${ui.eyebrow} mt-5`}>
                {copy.home.useProductEyebrow}
              </p>
              <h2 className="mt-4 text-3xl font-semibold tracking-normal text-[#080f2f]">
                {copy.home.useProductTitle}
              </h2>
              <p className="mt-4 text-sm leading-6 text-slate-600">
                {copy.home.currentOnly}
              </p>
              <ol
                role="list"
                aria-label={copy.home.productStepsLabel}
                className="mt-5 grid list-none gap-3 p-0"
              >
                {copy.home.productSteps.map((step, index) => (
                  <li
                    key={step}
                    className="flex gap-3 text-sm leading-6 text-slate-700"
                  >
                    <span
                      aria-hidden="true"
                      className="grid h-7 w-7 shrink-0 place-items-center rounded-full bg-blue-50 text-xs font-bold text-blue-700"
                    >
                      {index + 1}
                    </span>
                    <span>{step}</span>
                  </li>
                ))}
              </ol>
              <Link
                href="/signup?callbackUrl=/dashboard"
                className={`${ui.primaryButton} mt-6 w-full sm:w-auto`}
              >
                <Icon name="compass" className="h-4 w-4" />
                {copy.home.startNow}
              </Link>
            </article>
          </div>
        </div>
      </section>
    </main>
  );
}
