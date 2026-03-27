import { useState } from 'react'

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
    <div className="space-y-6">
      <section className="panel-card guest-hero p-6 md:p-8">
        <p className="text-xs uppercase tracking-[0.3em] text-[color:var(--muted)]">Contact Us</p>
        <h1 className="mt-2 text-3xl font-semibold neon-title md:text-4xl">Let us help you pick the right setup</h1>
        <p className="mt-3 max-w-2xl text-sm text-[color:var(--muted)] md:text-base">
          Reach out for battery recommendations, wholesaler onboarding, or product support. We usually reply within one business day.
        </p>
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
              <label htmlFor="topic" className="field-label">Topic</label>
              <select id="topic" name="topic" value={form.topic} onChange={onChange} className="neon-input">
                <option value="product">Product Advice</option>
                <option value="fitment">Vehicle Fitment</option>
                <option value="wholesale">Wholesale Partnership</option>
                <option value="support">General Support</option>
              </select>
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
        </form>

        <aside className="space-y-4">
          <article className="panel-card animate-fade-up p-5" style={{ animationDelay: '100ms' }}>
            <h2 className="text-xl font-semibold">Support Channels</h2>
            <ul className="mt-3 space-y-2 text-sm text-[color:var(--muted)]">
              <li>Email: support@lithovolt.com</li>
              <li>Sales: sales@lithovolt.com</li>
              <li>Phone: +61 3 9000 1200</li>
            </ul>
          </article>

          <article className="panel-card animate-fade-up p-5" style={{ animationDelay: '170ms' }}>
            <h2 className="text-xl font-semibold">Business Hours</h2>
            <p className="mt-2 text-sm text-[color:var(--muted)]">
              Monday - Friday, 9:00 AM - 6:00 PM AEST
            </p>
          </article>
        </aside>
      </section>
    </div>
  )
}
