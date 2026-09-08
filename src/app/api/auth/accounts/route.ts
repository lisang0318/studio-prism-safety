import { NextResponse } from 'next/server';
import { getAccountsDB, saveAccountsDB } from '@/lib/db';
import { UserAccount } from '@/types';

export async function GET() {
  const accounts = getAccountsDB();
  return NextResponse.json(accounts);
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { action, payload } = body;
    let accounts = getAccountsDB();

    if (action === 'add') {
      const newAccount: UserAccount = {
        ...payload,
        id: payload.username,
        createdAt: new Date().toISOString()
      };
      // Prevent duplicate username
      accounts = accounts.filter(a => a.username !== newAccount.username);
      accounts.push(newAccount);
      saveAccountsDB(accounts);
      return NextResponse.json({ success: true, account: newAccount });
    }

    if (action === 'update') {
      const { id, updates } = payload;
      const targetUsername = updates.username ? updates.username.trim().toLowerCase() : id;
      
      accounts = accounts.map(a => {
        if (a.id === id || a.username === id) {
          return {
            ...a,
            ...updates,
            id: targetUsername,
            username: targetUsername
          };
        }
        return a;
      });
      saveAccountsDB(accounts);
      return NextResponse.json({ success: true });
    }

    if (action === 'delete') {
      const { id } = payload;
      accounts = accounts.filter(a => a.id !== id && a.username !== id);
      saveAccountsDB(accounts);
      return NextResponse.json({ success: true });
    }

    return NextResponse.json({ success: false, error: 'Unknown action' }, { status: 400 });
  } catch (error) {
    console.error('Accounts API error:', error);
    return NextResponse.json({ success: false, error: 'Internal Server Error' }, { status: 500 });
  }
}
