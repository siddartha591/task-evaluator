'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { useRouter, useParams } from 'next/navigation'
import Link from 'next/link'

interface Task {
  id: string
  title: string
  description: string
  code: string
  status: string
  created_at: string
}

interface Evaluation {
  id: string
  score: number
  strengths: string[]
  improvements: string[]
  is_unlocked: boolean
  full_report: string
}

export default function TaskDetail() {
  const params = useParams<{ id: string }>()
  const router = useRouter()

  const [task, setTask] = useState<Task | null>(null)
  const [evaluation, setEvaluation] = useState<Evaluation | null>(null)
  const [loading, setLoading] = useState(true)
  const [evaluating, setEvaluating] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    if (!params?.id) return
    fetchTask(params.id)
  }, [params?.id])

  const fetchTask = async (id: string) => {
    setLoading(true)

    const { data: taskData, error: taskError } = await supabase
      .from('tasks')
      .select('*')
      .eq('id', id)
      .single()

    if (taskError) {
      console.error(taskError)
      setLoading(false)
      return
    }

    setTask(taskData)

    const { data: evalData } = await supabase
      .from('evaluations')
      .select('*')
      .eq('task_id', id)
      .single()

    setEvaluation(evalData || null)
    setLoading(false)
  }

  // 🔥 REPLACED + FIXED handleEvaluate()
  const handleEvaluate = async () => {
    if (!task) return
    
    setEvaluating(true)
    setError('')

    try {
      // Get logged-in session
      const { data: { session } } = await supabase.auth.getSession()
      if (!session) {
        setError('Please login first.')
        router.push('/login')
        return
      }

      const response = await fetch('/api/evaluate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.access_token}`
        },
        body: JSON.stringify({
          taskId: task.id,
          description: task.description,
          code: task.code
        })
      })

      const data = await response.json()
      if (data.success) fetchTask(task.id)
      else setError(data.error || 'Evaluation failed')

    } catch (err) {
      console.error(err)
      setError('Network error. Try again.')
    }

    setEvaluating(false)
  }

  if (loading) return <div className="min-h-screen flex items-center justify-center text-gray-500">Loading...</div>
  if (!task) return <div className="min-h-screen flex items-center justify-center text-gray-500">Task not found</div>

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white shadow-sm">
        <div className="container mx-auto px-4 py-4">
          <Link href="/dashboard" className="text-blue-600 hover:underline">← Back to Dashboard</Link>
        </div>
      </nav>

      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <div className="bg-white rounded-lg shadow-lg p-8 mb-6">
          <h1 className="text-3xl font-bold text-gray-800 mb-4">{task.title}</h1>

          <div className="mb-6">
            <h2 className="text-lg font-semibold text-gray-700 mb-2">Description</h2>
            <p className="text-gray-600">{task.description}</p>
          </div>

          <div className="mb-6">
            <h2 className="text-lg font-semibold text-gray-700 mb-2">Code</h2>
            <pre className="bg-gray-900 text-green-400 p-4 rounded-lg overflow-x-auto">
              <code>{task.code}</code>
            </pre>
          </div>

          {error && <div className="mb-4 bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">{error}</div>}

          {!evaluation && (
            <button onClick={handleEvaluate} disabled={evaluating}
              className="w-full bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 disabled:opacity-50 transition">
              {evaluating ? '🤖 Evaluating...' : '🚀 Run AI Evaluation'}
            </button>
          )}
        </div>

        {evaluation && (
          <div className="bg-white rounded-lg shadow-lg p-8">
            <h2 className="text-2xl font-bold text-gray-800 mb-6">AI Evaluation Results</h2>

            <div className="mb-6">
              <div className="text-5xl font-bold text-blue-600 mb-2">{evaluation.score}/100</div>
              <p className="text-gray-600">Overall Score</p>
            </div>

            <div className="mb-6">
              <h3 className="text-lg font-semibold text-green-700 mb-2">Strengths</h3>
              <ul className="list-disc list-inside space-y-1">
                {evaluation.strengths?.length ? evaluation.strengths.map((s, i) =>
                  <li key={i} className="text-gray-700">{s}</li>
                ) : <li>No strengths detected</li>}
              </ul>
            </div>

            <div className="mb-6">
              <h3 className="text-lg font-semibold text-orange-700 mb-2">Areas for Improvement</h3>
              <ul className="list-disc list-inside space-y-1">
                {evaluation.improvements?.length ? evaluation.improvements.map((im, i) =>
                  <li key={i} className="text-gray-700">{im}</li>
                ) : <li>Try optimizing structure, readability and security</li>}
              </ul>
            </div>

            {!evaluation.is_unlocked ? (
              <Link href={`/payment/${evaluation.id}`}
                className="block w-full bg-purple-600 text-white py-3 text-center rounded-lg font-semibold hover:bg-purple-700">
                🔓 Unlock Full Report – ₹99
              </Link>
            ) : (
              <div className="bg-gray-50 p-6 rounded-lg">
                <h3 className="text-lg font-semibold text-gray-800 mb-3">📊 Full Report</h3>
                <p className="text-gray-700 whitespace-pre-wrap">{evaluation.full_report}</p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
