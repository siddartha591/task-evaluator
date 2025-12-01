import { NextResponse } from 'next/server'

export async function GET(request: Request) {
  try {
    const data = {
      users: [
        { id: 1, name: 'John' },
        { id: 2, name: 'Jane' }
      ]
    }

    // Fixed: Proper array access with bounds checking
    const firstUser = data.users.length > 0 ? data.users[0] : null

    if (!firstUser) {
      return NextResponse.json(
        { error: 'No users found' },
        { status: 404 }
      )
    }

    return NextResponse.json(
      { success: true, user: firstUser },
      { status: 200 }
    )
  } catch (error) {
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
