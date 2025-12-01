import { NextResponse } from 'next/server'

export async function GET(request: Request) {
  // BUG: No error handling, wrong data structure
  const data = {
    users: [
      { id: 1, name: 'John' },
      { id: 2, name: 'Jane' }
    ]
  }

  // BUG: Accessing undefined property
  const firstUser = data.users[10].name

  // BUG: No status code
  return NextResponse.json(firstUser)
}
