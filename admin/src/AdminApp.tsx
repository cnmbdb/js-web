import { type FormEvent, useEffect, useState } from 'react'
import type { Session } from '@supabase/supabase-js'
import { Database, LoaderCircle, LockKeyhole } from 'lucide-react'

import { AdminDashboard } from './AdminDashboard'
import { supabase } from './supabase'

type AuthMode = 'login' | 'signup'

export function AdminApp() {
  const [session, setSession] = useState<Session | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isAuthorized, setIsAuthorized] = useState(false)
  const [authError, setAuthError] = useState('')

  useEffect(() => {
    let active = true

    const authorize = async (nextSession: Session | null) => {
      if (!active) return
      setSession(nextSession)
      setAuthError('')

      if (!nextSession) {
        setIsAuthorized(false)
        setIsLoading(false)
        return
      }

      setIsLoading(true)
      const { data: membership, error: membershipError } = await supabase
        .from('site_admins')
        .select('user_id')
        .eq('user_id', nextSession.user.id)
        .maybeSingle()
      if (!active) return

      if (membershipError) {
        setAuthError(membershipError.message)
        setIsAuthorized(false)
        setIsLoading(false)
        return
      }

      if (membership) {
        setIsAuthorized(true)
        setIsLoading(false)
        return
      }

      const { data: claimed, error: claimError } = await supabase.rpc('claim_site_admin')
      if (!active) return
      setAuthError(claimError?.message || '')
      setIsAuthorized(!claimError && claimed === true)
      setIsLoading(false)
    }

    supabase.auth.getSession().then(({ data }) => authorize(data.session))
    const { data: listener } = supabase.auth.onAuthStateChange((_event, nextSession) => {
      void authorize(nextSession)
    })

    return () => {
      active = false
      listener.subscription.unsubscribe()
    }
  }, [])

  if (isLoading) {
    return (
      <main className="auth-shell">
        <section className="auth-panel auth-loading" aria-live="polite">
          <LoaderCircle className="spin" size={22} />
          <span>正在连接内容数据库</span>
        </section>
      </main>
    )
  }

  if (!session) {
    return <AdminLogin />
  }

  if (!isAuthorized) {
    return (
      <main className="auth-shell">
        <section className="auth-panel">
          <div className="auth-mark"><LockKeyhole size={22} /></div>
          <span className="auth-eyebrow">ACCESS DENIED</span>
          <h1>当前账号没有发布权限</h1>
          <p>{authError || '此站点已有管理员，请使用管理员账号登录。'}</p>
          <button className="primary-button auth-submit" onClick={() => supabase.auth.signOut()} type="button">
            退出登录
          </button>
        </section>
      </main>
    )
  }

  return (
    <AdminDashboard
      onSignOut={() => supabase.auth.signOut()}
      userEmail={session.user.email || '管理员'}
      userId={session.user.id}
    />
  )
}

function AdminLogin() {
  const [mode, setMode] = useState<AuthMode>('login')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [message, setMessage] = useState('')
  const [errorMessage, setErrorMessage] = useState('')

  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setIsSubmitting(true)
    setMessage('')
    setErrorMessage('')

    const result = mode === 'login'
      ? await supabase.auth.signInWithPassword({ email, password })
      : await supabase.auth.signUp({ email, password })

    if (result.error) {
      setErrorMessage(result.error.message)
    } else if (mode === 'signup' && !result.data.session) {
      setMessage('注册成功，请到邮箱完成验证后再登录。')
    }

    setIsSubmitting(false)
  }

  return (
    <main className="auth-shell">
      <section className="auth-panel">
        <div className="auth-mark"><Database size={22} /></div>
        <span className="auth-eyebrow">SUXIN SITE ADMIN</span>
        <h1>{mode === 'login' ? '登录内容后台' : '创建首个管理员'}</h1>
        <p>{mode === 'login' ? '登录后可编辑并发布全站内容。' : '仅数据库中的第一个注册账号可认领管理员权限。'}</p>

        <form className="auth-form" onSubmit={submit}>
          <label>
            <span>邮箱</span>
            <input autoComplete="email" onChange={(event) => setEmail(event.target.value)} required type="email" value={email} />
          </label>
          <label>
            <span>密码</span>
            <input autoComplete={mode === 'login' ? 'current-password' : 'new-password'} minLength={8} onChange={(event) => setPassword(event.target.value)} required type="password" value={password} />
          </label>

          {errorMessage ? <p className="auth-message error" role="alert">{errorMessage}</p> : null}
          {message ? <p className="auth-message" role="status">{message}</p> : null}

          <button className="primary-button auth-submit" disabled={isSubmitting} type="submit">
            {isSubmitting ? <LoaderCircle className="spin" size={16} /> : null}
            {mode === 'login' ? '登录' : '注册并认领'}
          </button>
        </form>

        <button
          className="auth-mode"
          onClick={() => {
            setMode((current) => current === 'login' ? 'signup' : 'login')
            setErrorMessage('')
            setMessage('')
          }}
          type="button"
        >
          {mode === 'login' ? '首次使用？创建管理员' : '已有账号？返回登录'}
        </button>
      </section>
    </main>
  )
}
