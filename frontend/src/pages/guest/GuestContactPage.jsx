import { useState } from 'react'
import PublicSectionHeader from '../../components/public/PublicSectionHeader'
import SearchableSelect from '../../components/common/SearchableSelect'

const initialForm = {
  name: '',
  email: '',
  phone: '',
  topic: 'product',
  message: '',
}

export default function GuestContactPage() {
  const [form, setForm] = useState(initialForm)
  const [submitted, setSubmitted] = useState(false)

  const onChange = (event) => {
    const { name, value } = event.target
    setForm((prev) => ({ ...prev, [name]: value }))
  }

  const onSubmit = (event) => {
    event.preventDefault()
    setSubmitted(true)
    setTimeout(() => {
      setSubmitted(false)
      setForm(initialForm)
    }, 1800)
  }

  return (
    <div className="space-y-6 md:space-y-7">
      <section className="panel-card guest-hero p-6 md:p-8">
        <PublicSectionHeader
          eyebrow="Contact Us"
          title="Let us help you pick the right setup"
          description="Reach out for battery recommendations, wholesaler onboarding, or product support. We usually reply within one business day."
          className="neon-title"
        />
      </section>

      <section className="grid gap-4 md:grid-cols-3">
        <article className="panel-card animate-fade-up p-4" style={{ animationDelay: '50ms' }}>
          <p className="text-xs uppercase tracking-[0.2em] text-[color:var(--muted)]">Response SLA</p>
          <h2 className="mt-2 text-2xl font-semibold text-[color:var(--accent)]">1 Day</h2>
          <p className="mt-1 text-sm text-[color:var(--muted)]">Most queries answered within one business day.</p>
        </article>
        <article className="panel-card animate-fade-up p-4" style={{ animationDelay: '100ms' }}>
          <p className="text-xs uppercase tracking-[0.2em] text-[color:var(--muted)]">Priority Help</p>
          <h2 className="mt-2 text-2xl font-semibold text-[color:var(--accent)]">Fitment</h2>
          <p className="mt-1 text-sm text-[color:var(--muted)]">Fast support for time-sensitive compatibility cases.</p>
        </article>
        <article className="panel-card animate-fade-up p-4" style={{ animationDelay: '150ms' }}>
          <p className="text-xs uppercase tracking-[0.2em] text-[color:var(--muted)]">Partnerships</p>
          <h2 className="mt-2 text-2xl font-semibold text-[color:var(--accent)]">Trade</h2>
          <p className="mt-1 text-sm text-[color:var(--muted)]">Support for wholesale onboarding and account setup.</p>
        </article>
      </section>

      <section className="grid gap-5 lg:grid-cols-[1.2fr_0.8fr]">
        <form onSubmit={onSubmit} className="panel-card animate-fade-up space-y-4 p-5 md:p-6">
          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <label htmlFor="name" className="field-label">Full Name</label>
              <input id="name" name="name" value={form.name} onChange={onChange} className="neon-input" required />
            </div>
            <div>
              <label htmlFor="email" className="field-label">Email</label>
              <input id="email" name="email" type="email" value={form.email} onChange={onChange} className="neon-input" required />
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <label htmlFor="phone" className="field-label">Phone</label>
              <input id="phone" name="phone" value={form.phone} onChange={onChange} className="neon-input" />
            </div>
            <div>
              <SearchableSelect
                id="topic"
                label="Topic"
                value={form.topic}
                onChange={(next) => setForm((prev) => ({ ...prev, topic: next }))}
                options={[
                  { value: 'product', label: 'Product Advice' },
                  { value: 'fitment', label: 'Vehicle Fitment' },
                  { value: 'wholesale', label: 'Wholesale Partnership' },
                  { value: 'support', label: 'General Support' },
                ]}
              />
            </div>
          </div>

          <div>
            <label htmlFor="message" className="field-label">Message</label>
            <textarea
              id="message"
              name="message"
              value={form.message}
              onChange={onChange}
              className="neon-input min-h-28"
              placeholder="Tell us your vehicle model or requirement."
              required
            />
          </div>

          {submitted ? (
            <div className="rounded-xl border border-[color:var(--accent)] bg-[rgba(93,255,138,0.12)] px-4 py-3 text-sm text-[color:var(--text)]">
              Thanks. Your message has been queued for the support team.
            </div>
          ) : null}

          <button type="submit" className="neon-btn">Send Message</button>
          <p className="text-xs text-[color:var(--muted)]">By sending this form, you allow Lithovolt support to contact you about your request.</p>
        </form>

        <aside className="space-y-4">
          <article className="panel-card animate-fade-up p-5" style={{ animationDelay: '100ms' }}>
            <h2 className="text-xl font-semibold">Support Channels</h2>
            <ul className="mt-3 space-y-2 text-sm text-[color:var(--muted)]">
              <li>Email: support@lithovolt.com.au</li>
              <li>Sales: sales@lithovolt.com.au</li>
              <li>Phone: +61 3 9000 1200</li>
            </ul>
          </article>

          <article className="panel-card animate-fade-up p-5" style={{ animationDelay: '170ms' }}>
            <h2 className="text-xl font-semibold">Business Hours</h2>
            <p className="mt-2 text-sm text-[color:var(--muted)]">
              Monday - Friday, 9:00 AM - 6:00 PM AEST
            </p>
          </article>

          <article className="panel-card animate-fade-up p-5" style={{ animationDelay: '220ms' }}>
            <h2 className="text-xl font-semibold">Best Way to Reach Us</h2>
            <p className="mt-2 text-sm text-[color:var(--muted)]">
              Include vehicle make, model, year, and your intended usage. This helps us reply with accurate recommendations faster.
            </p>
          </article>
        </aside>
      </section>
    </div>
  )
}
