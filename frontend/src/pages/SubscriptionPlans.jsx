import { useEffect, useState } from 'react'
import { api, getAccessToken } from '../api/client.js'

const PLANS = [
  {
    code: 'SILVER',
    name: 'Silver',
    description: 'For starters',
    priceInr: 199,
    period: 'month',
    features: ['Basic workout library', '1 AI workout plan', '30 days history'],
  },
  {
    code: 'GOLD',
    name: 'Gold',
    description: 'For regulars',
    priceInr: 499,
    period: 'month',
    features: ['Advanced content', '3 AI plans', 'Trainer chat', '6 months history'],
  },
  {
    code: 'PLATINUM',
    name: 'Platinum',
    description: 'For athletes',
    priceInr: 999,
    period: 'month',
    features: ['Unlimited AI plans', 'Priority trainer support', 'Full history'],
  },
]

function loadRazorpayScript() {
  return new Promise((resolve) => {
    if (window.Razorpay) return resolve(true)

    const existing = document.querySelector('script[data-razorpay="checkout"]')
    if (existing) {
      existing.addEventListener('load', () => resolve(true))
      existing.addEventListener('error', () => resolve(false))
      return
    }

    const script = document.createElement('script')
    script.src = 'https://checkout.razorpay.com/v1/checkout.js'
    script.async = true
    script.setAttribute('data-razorpay', 'checkout')
    script.onload = () => resolve(true)
    script.onerror = () => resolve(false)
    document.body.appendChild(script)
  })
}

export default function SubscriptionPlans() {
  const [plans] = useState(PLANS)
  const [busy, setBusy] = useState('')
  const [error, setError] = useState('')
  const [info, setInfo] = useState('')

  useEffect(() => {
    loadRazorpayScript()
  }, [])

  const ensureAuth = () => {
    if (!getAccessToken()) {
      setError('Please log in to start checkout')
      return false
    }
    return true
  }

  const handleRazorpay = async (planCode) => {
    setError('')
    setInfo('')
    if (!ensureAuth()) return

    const ok = await loadRazorpayScript()
    if (!ok) {
      setError('Failed to load Razorpay checkout. Please disable adblocker and try again.')
      return
    }

    try {
      setBusy(`${planCode}:razorpay`)
      const order = await api.post('/subscriptions/razorpay/create-order', { plan: planCode })

      if (!order?.orderId || !order?.keyId) {
        setError('Razorpay order creation failed.')
        return
      }

      const options = {
        key: order.keyId,
        amount: order.amount,
        currency: order.currency || 'INR',
        name: order.name || 'Fitness App',
        description: order.description || `Subscription - ${planCode}`,
        order_id: order.orderId,
        prefill: order.prefill || {},
        handler: async (response) => {
          try {
            await api.post('/subscriptions/razorpay/verify', {
              plan: planCode,
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
            })
            setInfo('✅ Payment successful (Razorpay). Subscription activated.')
          } catch (e) {
            setError(e?.message || 'Payment verification failed')
          }
        },
        modal: {
          ondismiss: () => setInfo('Payment popup closed.'),
        },
        theme: { color: '#38bdf8' },
      }

      const rz = new window.Razorpay(options)
      rz.on('payment.failed', (resp) => {
        setError(resp?.error?.description || 'Payment failed')
      })
      rz.open()
    } catch (err) {
      setError(err?.message || 'Failed to start Razorpay checkout')
    } finally {
      setBusy('')
    }
  }

  return (
    <div className="min-h-screen bg-slate-950 px-4 py-8 text-slate-50">
      <div className="mx-auto max-w-5xl">
        <header className="mb-8 flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-sky-400">
              Plans
            </p>
            <h1 className="mt-1 text-2xl font-semibold tracking-tight sm:text-3xl">
              Choose your performance tier
            </h1>
            <p className="mt-1 max-w-xl text-xs text-slate-400">
              Silver for starters, Gold for regulars, and Platinum for athletes needing intensive coaching.
            </p>
          </div>
        </header>

        {error && (
          <div className="mb-4 rounded-lg border border-red-500/40 bg-red-500/10 px-3 py-2 text-xs text-red-200">
            {error}
          </div>
        )}

        {info && (
          <div className="mb-4 rounded-lg border border-emerald-500/40 bg-emerald-500/10 px-3 py-2 text-xs text-emerald-200">
            {info}
          </div>
        )}

        <div className="grid gap-4 md:grid-cols-3">
          {plans.map((plan) => {
            const rzBusy = busy === `${plan.code}:razorpay`

            return (
              <div
                key={plan.code}
                className="flex flex-col rounded-2xl border border-slate-800 bg-slate-900/60 p-4 shadow-sm"
              >
                <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                  {plan.name}
                </p>
                <p className="mt-1 text-sm font-medium text-slate-100">{plan.description}</p>

                {/* ✅ Amount shown */}
                <div className="mt-3 flex items-end gap-2">
                  <span className="text-3xl font-semibold tracking-tight text-slate-50">
                    ₹{plan.priceInr}
                  </span>
                  <span className="pb-1 text-xs text-slate-400">/ {plan.period}</span>
                </div>

                <ul className="mt-3 flex-1 space-y-1.5 text-xs text-slate-400">
                  {plan.features?.map((f) => (
                    <li key={f} className="flex items-start gap-2">
                      <span className="mt-0.5 h-1.5 w-1.5 rounded-full bg-sky-400" />
                      <span>{f}</span>
                    </li>
                  ))}
                </ul>

                {/* ✅ Only Razorpay button */}
                <button
                  type="button"
                  disabled={rzBusy}
                  onClick={() => handleRazorpay(plan.code)}
                  className="mt-4 inline-flex w-full items-center justify-center rounded-full bg-sky-500 px-4 py-2 text-xs font-semibold text-slate-950 shadow-sm transition hover:bg-sky-400 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {rzBusy ? 'Opening Razorpay…' : 'Pay with Razorpay'}
                </button>

                <p className="mt-2 text-[10px] text-slate-500">
                  Razorpay flow: create order → checkout → verify signature → activate plan.
                </p>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
