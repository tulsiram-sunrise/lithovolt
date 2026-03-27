import { Link } from 'react-router-dom'
import PublicSectionHeader from '../../components/public/PublicSectionHeader'

const faqs = [
  {
    question: 'How do I find a battery for my vehicle?',
    answer: 'Use the Find by Vehicle page and enter your registration details. You can also browse battery models directly by code or series.',
  },
  {
    question: 'Can I register as a wholesaler?',
    answer: 'Yes. Existing customers can apply for wholesaler access, and admins can send invitation links for direct onboarding.',
  },
  {
    question: 'What if my battery model is not listed?',
    answer: 'Contact support with your vehicle details and our team will provide guidance and alternate fitment options.',
  },
  {
    question: 'How quickly does support respond?',
    answer: 'Most requests are handled within one business day. Priority fitment issues are addressed faster during business hours.',
  },
]

export default function GuestSupportPage() {
  return (
    <div className="space-y-6 md:space-y-7">
      <section className="panel-card guest-hero p-6 md:p-8">
        <PublicSectionHeader
          eyebrow="Support Center"
          title="Answers, onboarding, and assistance"
          description="Find quick answers for fitment and account flows, then connect with the team when you need deeper help."
          className="neon-title"
        />
      </section>

      <section className="grid gap-4 md:grid-cols-3">
        <article className="panel-card animate-fade-up p-4" style={{ animationDelay: '60ms' }}>
          <p className="text-xs uppercase tracking-[0.2em] text-[color:var(--muted)]">Support Track</p>
          <h2 className="mt-2 text-xl font-semibold">Pre-Sales Advice</h2>
          <p className="mt-2 text-sm text-[color:var(--muted)]">Help choosing between compatible options and performance tiers.</p>
        </article>
        <article className="panel-card animate-fade-up p-4" style={{ animationDelay: '120ms' }}>
          <p className="text-xs uppercase tracking-[0.2em] text-[color:var(--muted)]">Support Track</p>
          <h2 className="mt-2 text-xl font-semibold">Fitment Verification</h2>
          <p className="mt-2 text-sm text-[color:var(--muted)]">Validation for edge cases where multiple battery options apply.</p>
        </article>
        <article className="panel-card animate-fade-up p-4" style={{ animationDelay: '180ms' }}>
          <p className="text-xs uppercase tracking-[0.2em] text-[color:var(--muted)]">Support Track</p>
          <h2 className="mt-2 text-xl font-semibold">Trade Onboarding</h2>
          <p className="mt-2 text-sm text-[color:var(--muted)]">Wholesaler/account onboarding support and process guidance.</p>
        </article>
      </section>

      <section className="grid gap-4 md:grid-cols-2">
        {faqs.map((item, index) => (
          <article
            key={item.question}
            className="panel-card animate-fade-up p-5"
            style={{ animationDelay: `${70 + index * 70}ms` }}
          >
            <h2 className="text-lg font-semibold">{item.question}</h2>
            <p className="mt-2 text-sm text-[color:var(--muted)]">{item.answer}</p>
          </article>
        ))}
      </section>

      <section className="panel-card p-5 md:p-6">
        <h2 className="text-2xl font-semibold">Escalation path</h2>
        <ol className="mt-3 space-y-2 text-sm text-[color:var(--muted)]">
          <li className="rounded-lg border border-[color:var(--border)] bg-black/15 p-3">
            <p className="font-semibold text-[color:var(--text)]">1. Submit the details</p>
            <p className="mt-1">Provide battery model or vehicle information and your use-case.</p>
          </li>
          <li className="rounded-lg border border-[color:var(--border)] bg-black/15 p-3">
            <p className="font-semibold text-[color:var(--text)]">2. Initial guidance</p>
            <p className="mt-1">Support shares a recommendation or asks for any missing details.</p>
          </li>
          <li className="rounded-lg border border-[color:var(--border)] bg-black/15 p-3">
            <p className="font-semibold text-[color:var(--text)]">3. Technical review</p>
            <p className="mt-1">Complex fitment cases are escalated for deeper validation.</p>
          </li>
        </ol>
      </section>

      <section className="panel-card p-5 md:p-6">
        <h2 className="text-2xl font-semibold">Still need help?</h2>
        <p className="mt-2 text-sm text-[color:var(--muted)] md:text-base">
          Share your battery model, vehicle details, and use-case with support so we can respond with precise recommendations.
        </p>
        <div className="mt-4 flex flex-wrap gap-3">
          <Link to="/contact" className="neon-btn">Contact Support</Link>
          <Link to="/find-battery" className="neon-btn-secondary">Find by Vehicle</Link>
        </div>
      </section>
    </div>
  )
}
