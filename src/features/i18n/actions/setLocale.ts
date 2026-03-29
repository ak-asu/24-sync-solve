'use server'

import { cookies } from 'next/headers'
import { revalidatePath } from 'next/cache'
import { isLocale, LOCALE_COOKIE } from '@/lib/i18n/locales'

export async function setLocale(locale: string): Promise<void> {
  const valid = isLocale(locale) ? locale : 'en'
  const store = await cookies()
  store.set(LOCALE_COOKIE, valid, {
    path: '/',
    maxAge: 60 * 60 * 24 * 365,
    sameSite: 'lax',
  })
  revalidatePath('/', 'layout')
}
