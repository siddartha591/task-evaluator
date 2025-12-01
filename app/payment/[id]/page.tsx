'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { useRouter, useParams } from 'next/navigation'
import Link from 'next/link'

export default function PaymentPage() {
  const params = useParams()
  const router = useRouter()
  const [evaluation, setEvaluation] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [processing, setProcessing] = useState(false)
  const [paymentMethod, setPaymentMethod] = useState('card')

  useEffect(() => {
    fetchEvaluation()
  }, [params.id])

  const fetchEvaluation = async () => {
    const { data } = await supabase
      .from('evaluations')
      .select('*, tasks(*)')
      .eq('id', params.id)
      .single()

    if (data) {
      setEvaluation(data)
    }
    setLoading(false)
  }

  const handlePayment = async (e: React.FormEvent) => {
    e.preventDefault()
    setProcessing(true)

    const { data: { user } } = await supabase.auth.getUser()

    // Create payment record
    const { data: payment } = await supabase
      .from('payments')
      .insert([
        {
          user_id: user?.id,
          evaluation_id: params.id,
          amount: 99.00,
          status: 'completed',
          payment_method: paymentMethod
        }
      ])
      .select()
      .single()

    // Unlock the evaluation
    await supabase
      .from('evaluations')
      .update({ is_unlocked: true })
      .eq('id', params.id)

    setProcessing(false)
    router.push(`/tasks/${evaluation.task_id}`)
  }

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center">Loading...</div>
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white shadow-sm">
        <div className="container mx-auto px-4 py-4">
          <Link href="/dashboard" className="text-blue-600 hover:underline">
            ← Back to Dashboard
          </Link>
        </div>
      </nav>

      <div className="container mx-auto px-4 py-8 max-w-2xl">
        <div className="bg-white rounded-lg shadow-lg p-8">
          <h1 className="text-3xl font-bold text-gray-800 mb-6">Unlock Full Report</h1>

          <div className="bg-blue-50 p-6 rounded-lg mb-6">
            <h2 className="text-xl font-semibold text-gray-800 mb-2">
              {evaluation?.tasks?.title}
            </h2>
            <p className="text-gray-600 mb-4">Get complete AI evaluation with:</p>
            <ul className="space-y-2">
              <li className="flex items-center text-gray-700">
                <span className="text-green-500 mr-2">✓</span>
                Detailed code analysis
              </li>
              <li className="flex items-center text-gray-700">
                <span className="text-green-500 mr-2">✓</span>
                Performance optimization tips
              </li>
              <li className="flex items-center text-gray-700">
                <span className="text-green-500 mr-2">✓</span>
                Best practices recommendations
              </li>
              <li className="flex items-center text-gray-700">
                <span className="text-green-500 mr-2">✓</span>
                Code quality improvements
              </li>
            </ul>
          </div>

          <form onSubmit={handlePayment} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Payment Method
              </label>
              <select
                value={paymentMethod}
                onChange={(e) => setPaymentMethod(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              >
                <option value="card">Credit/Debit Card</option>
                <option value="upi">UPI</option>
                <option value="netbanking">Net Banking</option>
              </select>
            </div>

            {paymentMethod === 'card' && (
              <>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Card Number
                  </label>
                  <input
                    type="text"
                    placeholder="1234 5678 9012 3456"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Expiry Date
                    </label>
                    <input
                      type="text"
                      placeholder="MM/YY"
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      CVV
                    </label>
                    <input
                      type="text"
                      placeholder="123"
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                      required
                    />
                  </div>
                </div>
              </>
            )}

            {paymentMethod === 'upi' && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  UPI ID
                </label>
                <input
                  type="text"
                  placeholder="yourname@upi"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>
            )}

            <div className="border-t pt-6">
              <div className="flex justify-between text-2xl font-bold text-gray-800 mb-6">
                <span>Total Amount:</span>
                <span className="text-blue-600">₹99</span>
              </div>

              <button
                type="submit"
                disabled={processing}
                className="w-full bg-gradient-to-r from-green-600 to-blue-600 text-white py-4 rounded-lg font-semibold text-lg hover:from-green-700 hover:to-blue-700 disabled:opacity-50 transition"
              >
                {processing ? '⏳ Processing Payment...' : '💳 Pay ₹99 & Unlock Report'}
              </button>
            </div>
          </form>

          <p className="text-center text-sm text-gray-500 mt-4">
            🔒 Secure payment • No hidden charges
          </p>
        </div>
      </div>
    </div>
  )
}
