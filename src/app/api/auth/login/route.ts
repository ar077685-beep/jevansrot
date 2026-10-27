import { NextResponse } from 'next/server';
import { serverDb } from '../../../../server/db';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { email, password } = body;

    if (!email || !password) {
      return NextResponse.json({ success: false, message: 'Email and password are required' }, { status: 400 });
    }

    const authResult = serverDb.verifyAdmin(email, password);
    if (!authResult.valid || !authResult.user) {
      return NextResponse.json({ success: false, message: 'Invalid email or password' }, { status: 401 });
    }

    const response = NextResponse.json({
      success: true,
      user: authResult.user,
      message: 'Logged in successfully',
    });

    // Set HTTP session cookie for secure server-side authentication
    response.cookies.set('admin_session', JSON.stringify(authResult.user), {
      httpOnly: false, // Accessible to client auth helpers
      sameSite: 'lax',
      path: '/',
      maxAge: 60 * 60 * 24 * 7, // 7 days
    });

    return response;
  } catch (err: any) {
    return NextResponse.json({ success: false, message: err.message || 'Server error' }, { status: 500 });
  }
}
