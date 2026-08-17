import { useState } from 'react'
import {
  Mail,
  Lock,
  LogIn,
  ShieldCheck,
  User,
  Bot,
  ArrowLeft,
  UserPlus,
} from 'lucide-react'
import api from '../api/axios'

function Login({ onLogin }) {
  const [isRegistering, setIsRegistering] = useState(false)

  const [name, setName] = useState('')
  const [assistantName, setAssistantName] = useState('')

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')

  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  const handleLogin = async (event) => {
    event.preventDefault()

    setError('')
    setSuccess('')

    const trimmedEmail = email.trim()
    const trimmedPassword = password.trim()

    if (!trimmedEmail || !trimmedPassword) {
      setError('Email and password are required.')
      return
    }

    try {
      setLoading(true)

      const response = await api.post('/users/login', {
        email: trimmedEmail,
        password: trimmedPassword,
      })

      const loginData = response?.data?.data

      if (!loginData?.token) {
        throw new Error(
          'Login response did not include a JWT token.'
        )
      }

      localStorage.setItem('nexusToken', loginData.token)

      localStorage.setItem(
        'nexusEmail',
        loginData.email || trimmedEmail
      )

      localStorage.setItem(
        'nexusName',
        loginData.name || 'User'
      )

      localStorage.setItem(
        'nexusRole',
        loginData.role || 'USER'
      )

      localStorage.setItem(
        'nexusAssistantName',
        loginData.assistantName || 'JARVIS'
      )

      // Prevent the previous account's active conversation
      // from being reused after another account logs in.
      localStorage.removeItem('nexusConversationId')

      onLogin(loginData)
    } catch (error) {
      console.error('Login failed:', error)

      if (error.response?.data?.message) {
        setError(error.response.data.message)
      } else if (error.message) {
        setError(error.message)
      } else {
        setError(
          'Unable to connect to NEXUS Core Engine.'
        )
      }
    } finally {
      setLoading(false)
    }
  }

  const handleRegister = async (event) => {
    event.preventDefault()

    setError('')
    setSuccess('')

    if (
      !name.trim() ||
      !assistantName.trim() ||
      !email.trim() ||
      !password.trim()
    ) {
      setError('All fields are required.')
      return
    }

    if (password.length < 8) {
      setError(
        'Password must contain at least 8 characters.'
      )
      return
    }

    try {
      setLoading(true)

      await api.post('/users/register', {
        name,
        assistantName,
        email,
        password,
      })

      setSuccess(
        'NEXUS profile created successfully. Initiating login protocol...'
      )

      setTimeout(() => {
        setIsRegistering(false)
        setSuccess('')
        setName('')
        setAssistantName('')
        setPassword('')
      }, 1800)
    } catch (error) {
      console.error('Registration failed:', error)

      if (error.response?.data?.message) {
        setError(error.response.data.message)
      } else {
        setError(
          'Unable to create your NEXUS profile.'
        )
      }
    } finally {
      setLoading(false)
    }
  }

  const switchMode = () => {
    setIsRegistering((previous) => !previous)
    setError('')
    setSuccess('')
    setPassword('')
  }

  return (
    <div className="login-page">
      {/* ================= BACKGROUND ================= */}

      <div className="login-grid"></div>
      <div className="login-glow"></div>

      <div className="hud-line hud-line-one"></div>
      <div className="hud-line hud-line-two"></div>

      {/* ================= MAIN ================= */}

      <div className="login-container">
        {/* SYSTEM LABEL */}

        <div className="system-label">
          <span className="system-dot"></span>
          NEXUS CORE ONLINE
        </div>

        {/* ================= REACTOR ================= */}

        <div className="login-core">
          <div className="core-orbit orbit-one"></div>
          <div className="core-orbit orbit-two"></div>
          <div className="core-orbit orbit-three"></div>

          <div className="core-energy energy-one"></div>
          <div className="core-energy energy-two"></div>

          <div className="login-ring ring-a"></div>
          <div className="login-ring ring-b"></div>

          <div className="login-core-center">
            <span>N</span>
          </div>

          <div className="core-scan"></div>
        </div>

        {/* ================= HEADING ================= */}

        <div className="login-heading">
          <span className="eyebrow">
            NEXUS INTELLIGENCE SYSTEM
          </span>

          <h1>
            {isRegistering
              ? 'Initialize your NEXUS'
              : 'Welcome back'}
          </h1>

          <p>
            {isRegistering
              ? 'Create your personal AI command system.'
              : 'Authenticate to access your command center.'}
          </p>
        </div>

        {/* ================= FORM ================= */}

        <form
          onSubmit={
            isRegistering
              ? handleRegister
              : handleLogin
          }
          className={`login-form ${
            isRegistering ? 'register-mode' : ''
          }`}
        >
          {/* NAME */}

          {isRegistering && (
            <div className="input-group animated-input">
              <User size={18} />

              <input
                type="text"
                placeholder="Your name"
                value={name}
                onChange={(event) =>
                  setName(event.target.value)
                }
                autoComplete="name"
              />
            </div>
          )}

          {/* ASSISTANT NAME */}

          {isRegistering && (
            <div className="input-group animated-input">
              <Bot size={18} />

              <input
                type="text"
                placeholder="Your AI assistant name"
                value={assistantName}
                onChange={(event) =>
                  setAssistantName(event.target.value)
                }
                autoComplete="off"
              />
            </div>
          )}

          {/* EMAIL */}

          <div className="input-group animated-input">
            <Mail size={18} />

            <input
              type="email"
              placeholder="Email address"
              value={email}
              onChange={(event) =>
                setEmail(event.target.value)
              }
              autoComplete="email"
            />
          </div>

          {/* PASSWORD */}

          <div className="input-group animated-input">
            <Lock size={18} />

            <input
              type="password"
              placeholder="Password"
              value={password}
              onChange={(event) =>
                setPassword(event.target.value)
              }
              autoComplete={
                isRegistering
                  ? 'new-password'
                  : 'current-password'
              }
            />
          </div>

          {/* ERROR */}

          {error && (
            <div className="login-error">
              <span>⚠</span>
              {error}
            </div>
          )}

          {/* SUCCESS */}

          {success && (
            <div className="login-success">
              <span>✓</span>
              {success}
            </div>
          )}

          {/* BUTTON */}

          <button
            type="submit"
            className="login-button"
            disabled={loading}
          >
            {loading ? (
              <>
                <span className="spinner"></span>

                {isRegistering
                  ? 'INITIALIZING...'
                  : 'AUTHENTICATING...'}
              </>
            ) : (
              <>
                {isRegistering ? (
                  <>
                    <UserPlus size={18} />
                    CREATE NEXUS
                  </>
                ) : (
                  <>
                    <LogIn size={18} />
                    ENTER NEXUS
                  </>
                )}
              </>
            )}
          </button>
        </form>

        {/* ================= MODE SWITCH ================= */}

        <button
          type="button"
          className="mode-switch"
          onClick={switchMode}
          disabled={loading}
        >
          {isRegistering ? (
            <>
              <ArrowLeft size={15} />
              Already have an account?{' '}
              <strong>Enter NEXUS</strong>
            </>
          ) : (
            <>
              New to NEXUS?{' '}
              <strong>Initialize your AI</strong>
            </>
          )}
        </button>

        {/* ================= SECURITY ================= */}

        <div className="security-note">
          <ShieldCheck size={15} />

          <span>
            SECURE JWT AUTHENTICATION
          </span>

          <span className="security-divider">
            //
          </span>

          <span>ENCRYPTED CORE</span>
        </div>

        {/* ================= FOOTER ================= */}

        <div className="login-footer">
          <span>SYS.NEXUS</span>

          <span className="footer-status">
            <span></span>
            ONLINE
          </span>

          <span>v1.0.0</span>
        </div>
      </div>
    </div>
  )
}

export default Login