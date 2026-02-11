import { useMemo, useState } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { warrantyAPI } from '../../services/api'
import { useToastStore } from '../../store/toastStore'

export default function SalesPage() {
  const [issueForm, setIssueForm] = useState({
    serial_number: '',
    consumer_email: '',
    consumer_phone: '',
    consumer_first_name: '',
    consumer_last_name: '',
    notes: '',
  })
  const [issueError, setIssueError] = useState('')
  const queryClient = useQueryClient()
  const addToast = useToastStore((state) => state.addToast)

  const { data: warrantiesData, isLoading } = useQuery({
    queryKey: ['wholesaler-warranties'],
    queryFn: () => warrantyAPI.getWarranties({ ordering: '-created_at' }),
    select: (response) => response.data,
  })

  const issueWarranty = useMutation({
    mutationFn: (payload) => warrantyAPI.issueWarranty(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['wholesaler-warranties'] })
      setIssueForm({
        serial_number: '',
        consumer_email: '',
        consumer_phone: '',
        consumer_first_name: '',
        consumer_last_name: '',
        notes: '',
      })
      setIssueError('')
      addToast({ type: 'success', title: 'Warranty issued', message: 'Certificate generated and sent to consumer.' })
    },
    onError: (error) => {
      addToast({ type: 'error', title: 'Warranty issue failed', message: error.response?.data?.detail || 'Unable to issue warranty.' })
    },
  })

  const warranties = useMemo(
    () => (Array.isArray(warrantiesData) ? warrantiesData : warrantiesData?.results || []),
    [warrantiesData]
  )

  const handleIssueSubmit = (event) => {
    event.preventDefault()
    if (!issueForm.consumer_email && !issueForm.consumer_phone) {
      setIssueError('Provide consumer email or phone before issuing.')
      return
    }
    setIssueError('')
    issueWarranty.mutate({
      serial_number: issueForm.serial_number,
      consumer_email: issueForm.consumer_email || undefined,
      consumer_phone: issueForm.consumer_phone || undefined,
      consumer_first_name: issueForm.consumer_first_name || undefined,
      consumer_last_name: issueForm.consumer_last_name || undefined,
      notes: issueForm.notes || undefined,
    })
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-semibold neon-title">Sales & Warranties</h1>
        <p className="text-[color:var(--muted)]">Issued warranties and sales history.</p>
      </div>

      <form onSubmit={handleIssueSubmit} className="panel-card p-6 space-y-4">
        <h2 className="text-lg font-semibold">Issue Warranty</h2>
        <div className="grid gap-4 md:grid-cols-2">
          <div>
            <label htmlFor="serial-number" className="field-label">Serial Number</label>
            <input
              id="serial-number"
              className="neon-input"
              value={issueForm.serial_number}
              onChange={(event) => setIssueForm((prev) => ({ ...prev, serial_number: event.target.value }))}
              required
            />
          </div>
          <div>
            <label htmlFor="consumer-email" className="field-label">Consumer Email</label>
            <input
              id="consumer-email"
              className="neon-input"
              type="email"
              value={issueForm.consumer_email}
              onChange={(event) => setIssueForm((prev) => ({ ...prev, consumer_email: event.target.value }))}
            />
          </div>
          <div>
            <label htmlFor="consumer-phone" className="field-label">Consumer Phone</label>
            <input
              id="consumer-phone"
              className="neon-input"
              value={issueForm.consumer_phone}
              onChange={(event) => setIssueForm((prev) => ({ ...prev, consumer_phone: event.target.value }))}
            />
          </div>
          <div>
            <label htmlFor="consumer-first-name" className="field-label">First Name</label>
            <input
              id="consumer-first-name"
              className="neon-input"
              value={issueForm.consumer_first_name}
              onChange={(event) => setIssueForm((prev) => ({ ...prev, consumer_first_name: event.target.value }))}
            />
          </div>
          <div>
            <label htmlFor="consumer-last-name" className="field-label">Last Name</label>
            <input
              id="consumer-last-name"
              className="neon-input"
              value={issueForm.consumer_last_name}
              onChange={(event) => setIssueForm((prev) => ({ ...prev, consumer_last_name: event.target.value }))}
            />
          </div>
        </div>
        <div>
          <label htmlFor="warranty-notes" className="field-label">Notes</label>
          <textarea
            id="warranty-notes"
            className="neon-input min-h-[90px]"
            value={issueForm.notes}
            onChange={(event) => setIssueForm((prev) => ({ ...prev, notes: event.target.value }))}
          />
        </div>
        {issueError ? <p className="text-sm text-red-400">{issueError}</p> : null}
        <div className="flex justify-end">
          <button className="neon-btn" type="submit" disabled={issueWarranty.isLoading}>
            {issueWarranty.isLoading ? 'Issuing...' : 'Issue Warranty'}
          </button>
        </div>
      </form>

      <div className="panel-card p-6">
        <table className="data-table">
          <thead>
            <tr>
              <th>Warranty</th>
              <th>Model</th>
              <th>Consumer</th>
              <th>Status</th>
              <th>Issued</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {(isLoading ? [] : warranties).map((warranty) => (
              <tr key={warranty.id}>
                <td>{warranty.warranty_number}</td>
                <td>{warranty.battery_model_name}</td>
                <td>{warranty.consumer_name || 'Unassigned'}</td>
                <td><span className="tag">{warranty.status}</span></td>
                <td>{new Date(warranty.issued_at).toLocaleDateString()}</td>
                <td>
                  <button
                    className="neon-btn-ghost"
                    onClick={async () => {
                      const response = await warrantyAPI.getCertificate(warranty.id)
                      const url = window.URL.createObjectURL(response.data)
                      const link = document.createElement('a')
                      link.href = url
                      link.download = `warranty_${warranty.warranty_number}.pdf`
                      link.click()
                      window.URL.revokeObjectURL(url)
                    }}
                  >
                    Certificate
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {isLoading ? <p className="mt-3 text-sm text-[color:var(--muted)]">Loading warranties...</p> : null}
        {!isLoading && warranties.length === 0 ? (
          <p className="mt-3 text-sm text-[color:var(--muted)]">No issued warranties yet.</p>
        ) : null}
      </div>
    </div>
  )
}
