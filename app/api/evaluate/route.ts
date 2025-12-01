import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import Groq from 'groq-sdk'

export async function POST(request: Request) {
  try {
    const { taskId, description, code } = await request.json()

    console.log('Evaluation started for task:', taskId)

    // Ensure API Key Exists
    if (!process.env.GROQ_API_KEY) {
      return NextResponse.json(
        {
          success: false,
          error: 'Groq API key missing. Add GROQ_API_KEY to .env.local'
        },
        { status: 500 }
      )
    }

    // Read Authorization Header
    const authHeader = request.headers.get('authorization')
    if (!authHeader) {
      return NextResponse.json(
        { success: false, error: 'Authorization missing' },
        { status: 401 }
      )
    }

    // Supabase Auth Validation
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        global: {
          headers: { Authorization: authHeader }
        }
      }
    )

    const {
      data: { user },
      error: authError
    } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json(
        { success: false, error: 'Login required' },
        { status: 401 }
      )
    }

    console.log('User authenticated:', user.id)

    const groq = new Groq({ apiKey: process.env.GROQ_API_KEY })

    console.log('Calling Groq API...')

    // 🔥 Updated Model Version ↓
    const completion = await groq.chat.completions.create({
      model: 'llama-3.3-70b-versatile',
      messages: [
        {
          role: 'system',
          content:
            'You are an expert coding evaluator. Always respond in pure JSON only.'
        },
        {
          role: 'user',
          content: `Evaluate this coding task and return JSON only.\n\nTask Description: ${description}\n\nSubmitted Code:\n${code}\n\nReturn EXACT format:\n{\n  "score": 85,\n  "strengths": ["s1","s2","s3"],\n  "improvements": ["i1","i2","i3"],\n  "fullReport": "detailed analysis..."\n}`
        }
      ],
      temperature: 0.7,
      max_tokens: 2000
    })

    const responseText = completion.choices[0].message.content || '{}'
    console.log('Groq Response:', responseText.slice(0, 200))

    // Parse JSON Output
    let evaluation
    try {
      const match = responseText.match(/\{[\s\S]*\}/)
      if (!match) throw new Error('No JSON found')
      evaluation = JSON.parse(match[0])
    } catch {
      evaluation = {
        score: 75,
        strengths: ['Good logic flow', 'Readable structure', 'Works as expected'],
        improvements: ['Add error handling', 'Optimize performance', 'Improve documentation'],
        fullReport: `Raw AI Output:\n\n${responseText}`
      }
    }

    console.log('Saving evaluation to Supabase...')

    // Store in Database
    const { data: evalData, error: dbError } = await supabase
      .from('evaluations')
      .insert([
        {
          task_id: taskId,
          user_id: user.id,
          score: evaluation.score,
          strengths: evaluation.strengths,
          improvements: evaluation.improvements,
          full_report: evaluation.fullReport,
          is_unlocked: false
        }
      ])
      .select()
      .single()

    if (dbError) {
      return NextResponse.json(
        { success: false, error: `DB Error → ${dbError.message}` },
        { status: 500 }
      )
    }

    // Update Task Status
    await supabase.from('tasks').update({ status: 'evaluated' }).eq('id', taskId)

    return NextResponse.json({ success: true, data: evalData })
  } catch (error: any) {
    console.error('Evaluation Failed:', error)
    return NextResponse.json(
      { success: false, error: error.message || 'Internal Error' },
      { status: 500 }
    )
  }
}
