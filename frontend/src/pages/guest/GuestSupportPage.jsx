import { Link } from 'react-router-dom'

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
    <div className="space-y-6">
      <section className="panel-card guest-hero p-6 md:p-8">
        <p className="text-xs uppercase tracking-[0.3em] text-[color:var(--muted)]">Support Center</p>
        <h1 className="mt-2 text-3xl font-semibold neon-title md:text-4xl">Answers, onboarding, and assistance</h1>
        <p className="mt-3 max-w-2xl text-sm text-[color:var(--muted)] md:text-base">
          Find quick answers for fitment and account flows, then connect with the team when you need deeper help.
        </p>
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
