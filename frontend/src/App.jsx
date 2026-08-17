import { useEffect, useRef, useState } from 'react'
import Login from './pages/Login'
import api from './api/axios'
import {
  Activity,
  Bot,
  BrainCircuit,
  ChevronRight,
  Cpu,
  Database,
  LockKeyhole,
  Menu,
  MessageSquare,
  Mic,
  Network,
  Plus,
  Power,
  Radio,
  Send,
  Settings,
  ShieldCheck,
  Sparkles,
  X,
  Zap,
} from 'lucide-react'
import './App.css'

const getGreeting = () => {
  const hour = new Date().getHours()

  if (hour < 12) return 'Good morning'
  if (hour < 18) return 'Good afternoon'
  return 'Good evening'
}

const systemStats = [
  { label: 'AI Core', value: '98%', icon: BrainCircuit },
  { label: 'Memory', value: '48%', icon: Database },
  { label: 'Network', value: 'Online', icon: Network },
]

function App() {
  const getStoredUserName = () =>
    localStorage.getItem('nexusName') || 'User'

  const getStoredAssistantName = () =>
    localStorage.getItem('nexusAssistantName') || 'JARVIS'

  const [message, setMessage] = useState('')
  const [messages, setMessages] = useState([])
  const [conversations, setConversations] = useState([])
  const [selectedConversationId, setSelectedConversationId] = useState(
    localStorage.getItem('nexusConversationId') || ''
  )
  const [activeView, setActiveView] = useState('command')
  const [userName, setUserName] = useState(getStoredUserName())
  const [assistantName, setAssistantName] = useState(getStoredAssistantName())
  const [isListening, setIsListening] = useState(false)
  const [isSending, setIsSending] = useState(false)
  const [voiceError, setVoiceError] = useState('')
  const [greeting, setGreeting] = useState(getGreeting)
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)

  const recognitionRef = useRef(null)

  const [authenticated, setAuthenticated] = useState(
    Boolean(localStorage.getItem('nexusToken'))
  )

  useEffect(() => {
    const timer = window.setInterval(() => {
      setGreeting(getGreeting())
    }, 60_000)

    return () => window.clearInterval(timer)
  }, [])

  useEffect(() => {
    return () => recognitionRef.current?.stop()
  }, [])

  const loadConversations = async () => {
    try {
      const response = await api.get('/conversations')
      const nextConversations = response?.data?.data || []

      setConversations(nextConversations)

      if (selectedConversationId) {
        const exists = nextConversations.some(
          (conversation) => conversation.id === selectedConversationId
        )

        if (!exists) {
          setSelectedConversationId('')
          localStorage.removeItem('nexusConversationId')
        }
      }
    } catch (error) {
      console.error('Failed to load conversations:', error)
    }
  }

  const loadConversationMessages = async (conversationId) => {
    if (!conversationId) {
      setMessages([])
      return
    }

    try {
      const response = await api.get(
        `/conversations/${conversationId}/messages`
      )

      const history = response?.data?.data || []

      setMessages(
        history.map((entry) => ({
          id: entry.id,
          role: entry.role,
          content: entry.content,
          createdAt: entry.createdAt,
        }))
      )
    } catch (error) {
      console.error('Failed to load messages:', error)
      setMessages([])
    }
  }

  useEffect(() => {
    if (!authenticated) return

    setUserName(getStoredUserName())
    setAssistantName(getStoredAssistantName())
    loadConversations()
  }, [authenticated])

  useEffect(() => {
    if (!authenticated) return

    if (!selectedConversationId) {
      setMessages([])
      return
    }

    localStorage.setItem('nexusConversationId', selectedConversationId)
    loadConversationMessages(selectedConversationId)
  }, [authenticated, selectedConversationId])

  const handleLogin = (userData = null) => {
    const loggedInName =
      userData?.name ||
      localStorage.getItem('nexusName') ||
      'User'

    const loggedInAssistant =
      userData?.assistantName ||
      localStorage.getItem('nexusAssistantName') ||
      'JARVIS'

    localStorage.setItem('nexusName', loggedInName)
    localStorage.setItem('nexusAssistantName', loggedInAssistant)

    // Do not reuse the previous account's active conversation.
    localStorage.removeItem('nexusConversationId')

    setUserName(loggedInName)
    setAssistantName(loggedInAssistant)
    setSelectedConversationId('')
    setMessages([])
    setConversations([])
    setActiveView('command')
    setAuthenticated(true)
  }

  const handleLogout = () => {
    recognitionRef.current?.stop()

    localStorage.removeItem('nexusToken')
    localStorage.removeItem('nexusEmail')
    localStorage.removeItem('nexusName')
    localStorage.removeItem('nexusRole')
    localStorage.removeItem('nexusAssistantName')
    localStorage.removeItem('nexusConversationId')

    setAuthenticated(false)
    setSelectedConversationId('')
    setMessages([])
    setConversations([])
    setUserName('User')
    setAssistantName('JARVIS')
    setVoiceError('')
    setMessage('')
    setActiveView('command')
  }

  const ensureConversation = async () => {
    const activeConversationId =
      selectedConversationId || localStorage.getItem('nexusConversationId')

    if (activeConversationId) {
      return activeConversationId
    }

    const response = await api.post('/conversations', {
      title: `Conversation - ${new Date().toLocaleDateString()}`,
    })

    const nextConversationId = response?.data?.data?.id

    if (!nextConversationId) {
      throw new Error('Conversation ID missing from response.')
    }

    setSelectedConversationId(nextConversationId)
    localStorage.setItem('nexusConversationId', nextConversationId)

    await loadConversations()

    return nextConversationId
  }

  const handleNewConversation = async () => {
    setMessages([])
    setSelectedConversationId('')
    localStorage.removeItem('nexusConversationId')

    try {
      const response = await api.post('/conversations', {
        title: 'New Conversation',
      })

      const nextConversationId = response?.data?.data?.id

      if (!nextConversationId) return

      setSelectedConversationId(nextConversationId)
      localStorage.setItem('nexusConversationId', nextConversationId)
      setActiveView('conversations')
      setIsMobileMenuOpen(false)

      await loadConversations()
    } catch (error) {
      console.error('Failed to create conversation:', error)
    }
  }

  const handleSelectConversation = async (conversation) => {
    setSelectedConversationId(conversation.id)
    localStorage.setItem('nexusConversationId', conversation.id)
    setActiveView('conversations')
    setIsMobileMenuOpen(false)

    await loadConversationMessages(conversation.id)
  }

  const handleSend = async (messageToSend = message) => {
    const trimmedMessage = messageToSend.trim()

    if (!trimmedMessage || isSending) return

    if (!localStorage.getItem('nexusToken')) {
      setAuthenticated(false)
      return
    }

    try {
      setIsSending(true)
      setVoiceError('')

      const conversationId = await ensureConversation()

      const response = await api.post('/chat', {
        conversationId,
        message: trimmedMessage,
        assistantName,
      })

      const chatData = response?.data?.data

      setMessages((previous) => [
        ...previous,
        {
          id: `${conversationId}-user-${Date.now()}`,
          role: 'USER',
          content: trimmedMessage,
        },
        {
          id: `${conversationId}-assistant-${Date.now() + 1}`,
          role: 'ASSISTANT',
          content: chatData?.aiResponse || 'No response received.',
        },
      ])

      setMessage('')

      await loadConversations()
    } catch (error) {
      console.error('Chat request failed:', error)

      setVoiceError(
        error.response?.data?.message ||
          'NEXUS could not complete that request. Please try again.'
      )
    } finally {
      setIsSending(false)
    }
  }

  const handleVoice = () => {
    if (isListening) {
      recognitionRef.current?.stop()
      return
    }

    const SpeechRecognition =
      window.SpeechRecognition || window.webkitSpeechRecognition

    if (!SpeechRecognition) {
      setVoiceError(
        'Voice input is not supported by this browser. Please use Chrome or Edge.'
      )
      return
    }

    setVoiceError('')

    const recognition = new SpeechRecognition()

    recognition.lang = 'en-US'
    recognition.continuous = false
    recognition.interimResults = false

    recognition.onstart = () => setIsListening(true)

    recognition.onresult = (event) => {
      const transcript = event.results[0][0].transcript.trim()

      if (!transcript) return

      setMessage(transcript)
      void handleSend(transcript)
    }

    recognition.onerror = (event) => {
      const errors = {
        'not-allowed':
          'Microphone permission was denied. Allow microphone access and try again.',
        'no-speech': 'No speech was detected. Please try again.',
        'audio-capture': 'No microphone was found or is unavailable.',
      }

      setVoiceError(
        errors[event.error] ||
          'Voice input could not be completed. Please try again.'
      )
    }

    recognition.onend = () => setIsListening(false)

    recognitionRef.current = recognition
    recognition.start()
  }

  const renderComposer = () => (
    <div className="command-composer-wrap">
      {voiceError && <p className="voice-error">{voiceError}</p>}

      <div className="command-composer">
        <button
          className={`mic-control ${isListening ? 'active' : ''}`}
          onClick={handleVoice}
          disabled={isSending}
          title={isListening ? 'Stop listening' : 'Voice command'}
        >
          <Mic size={22} />
        </button>

        <input
          type="text"
          placeholder={
            isListening
              ? 'Listening for your command...'
              : 'Type your command...'
          }
          value={message}
          onChange={(event) => setMessage(event.target.value)}
          onKeyDown={(event) => {
            if (event.key === 'Enter') {
              event.preventDefault()
              handleSend()
            }
          }}
        />

        <button
          className="send-control"
          onClick={() => handleSend()}
          disabled={isSending || !message.trim()}
          title={isSending ? 'Sending...' : 'Send command'}
        >
          <Send size={21} />
        </button>
      </div>
    </div>
  )

  if (!authenticated) {
    return <Login onLogin={handleLogin} />
  }

  return (
    <div className="nexus-shell">
      <div className="ambient-grid" />
      <div className="ambient-glow glow-one" />
      <div className="ambient-glow glow-two" />

      <aside className={`nexus-sidebar ${isMobileMenuOpen ? 'open' : ''}`}>
        <div className="sidebar-brand">
          <div className="brand-mark">
            <Bot size={25} />
          </div>

          <div>
            <strong>NEXUS</strong>
            <span>PERSONAL AI SYSTEM</span>
          </div>

          <button
            className="mobile-close"
            onClick={() => setIsMobileMenuOpen(false)}
          >
            <X size={21} />
          </button>
        </div>

        <button
          className="new-conversation-button"
          onClick={handleNewConversation}
        >
          <Plus size={18} />
          New Conversation
        </button>

        <div className="sidebar-label">WORKSPACE</div>

        <nav className="sidebar-navigation">
          <button
            className={activeView === 'command' ? 'active' : ''}
            onClick={() => {
              setActiveView('command')
              setIsMobileMenuOpen(false)
            }}
          >
            <Activity size={18} />
            Command Center
          </button>

          <button
            className={activeView === 'conversations' ? 'active' : ''}
            onClick={() => {
              setActiveView('conversations')
              setIsMobileMenuOpen(false)
            }}
          >
            <MessageSquare size={18} />
            Conversations
          </button>

          <button className="future-button" title="Coming soon">
            <Zap size={18} />
            Automation
          </button>
        </nav>

        <div className="sidebar-conversations">
          <div className="sidebar-label">
            RECENT CONVERSATIONS

            <button onClick={() => setActiveView('conversations')}>
              <ChevronRight size={16} />
            </button>
          </div>

          {conversations.slice(0, 4).map((conversation) => (
            <button
              className="recent-conversation"
              key={conversation.id}
              onClick={() => handleSelectConversation(conversation)}
            >
              <MessageSquare size={15} />

              <span>
                {conversation.title || 'Conversation'}
              </span>
            </button>
          ))}

          {conversations.length === 0 && (
            <p className="no-recent-conversations">
              No conversations yet.
            </p>
          )}
        </div>

        <div className="sidebar-core-status">
          <div className="online-status">
            <span />
            NEXUS CORE ONLINE
          </div>

          <div className="integrity-ring">
            <div>
              <strong>98%</strong>
              <small>Integrity</small>
            </div>
          </div>

          <div className="core-mini-stats">
            <span>
              AI ENGINE <strong>READY</strong>
            </span>

            <span>
              SECURITY <strong>ACTIVE</strong>
            </span>
          </div>
        </div>

        <div className="sidebar-footer-controls">
          <button title="Settings">
            <Settings size={18} />
          </button>

          <button onClick={handleLogout} title="Log out">
            <Power size={18} />
          </button>
        </div>
      </aside>

      {isMobileMenuOpen && (
        <button
          className="sidebar-overlay"
          onClick={() => setIsMobileMenuOpen(false)}
          aria-label="Close menu"
        />
      )}

      <main className="nexus-main">
        <header className="nexus-header">
          <button
            className="mobile-menu-button"
            onClick={() => setIsMobileMenuOpen(true)}
          >
            <Menu size={23} />
          </button>

          <div className="header-title">
            <span className="header-dot" />

            {activeView === 'command'
              ? 'COMMAND CENTER'
              : 'CONVERSATIONS'}
          </div>

          <div className="header-status">
            <span className="live-time">
              {new Date().toLocaleTimeString([], {
                hour: '2-digit',
                minute: '2-digit',
              })}
            </span>

            <Radio size={18} />
            <Settings size={18} />
          </div>
        </header>

        {activeView === 'command' ? (
          <section className="command-view">
            <div className="command-topline">
              <div>
                <span className="eyebrow">
                  NEXUS INTELLIGENCE SYSTEM
                </span>

                <h1>
                  {greeting}, <span>{userName}.</span>
                </h1>

                <p>
                  {assistantName} is ready for your next command.
                </p>
              </div>

              <div className="command-online-badge">
                <span />
                SYSTEM ONLINE
              </div>
            </div>

            <div className="command-dashboard">
              <div className="left-metric-stack">
                {systemStats.map(
                  ({ label, value, icon: Icon }) => (
                    <article
                      className="metric-card"
                      key={label}
                    >
                      <div className="metric-icon">
                        <Icon size={18} />
                      </div>

                      <div>
                        <small>{label}</small>
                        <strong>{value}</strong>
                      </div>
                    </article>
                  )
                )}
              </div>

              <div
                className={`nexus-core-stage ${
                  isListening ? 'listening' : ''
                }`}
              >
                <div className="core-data-line left-line" />
                <div className="core-data-line right-line" />

                <div className="orbit orbit-large" />
                <div className="orbit orbit-medium" />
                <div className="orbit orbit-small" />

                <div className="scan-beam" />

                <div className="nexus-core">
                  <div className="core-inner-grid" />

                  <div className="core-center-light" />

                  <strong>
                    {assistantName.charAt(0).toUpperCase()}
                  </strong>

                  <span>
                    {assistantName.toUpperCase()}
                  </span>
                </div>

                <div className="core-caption">
                  <span className="core-caption-dot" />

                  {isListening
                    ? 'VOICE LINK ACTIVE'
                    : `${assistantName.toUpperCase()} CORE STANDBY`}
                </div>
              </div>

              <div className="right-metric-stack">
                <article className="activity-card">
                  <div className="card-heading">
                    <Cpu size={17} />
                    ACTIVE PROCESSES
                  </div>

                  <strong>128</strong>

                  <span>AI modules available</span>
                </article>

                <article className="activity-card">
                  <div className="card-heading">
                    <Network size={17} />
                    DATA FLOW
                  </div>

                  <strong>2.7 TB/s</strong>

                  <span>Secure connection active</span>
                </article>

                <article className="activity-card">
                  <div className="card-heading">
                    <ShieldCheck size={17} />
                    SECURITY
                  </div>

                  <strong>PROTECTED</strong>

                  <span>All systems secure</span>
                </article>
              </div>
            </div>

            <div
              className={`voice-link-panel ${
                isListening ? 'active' : ''
              }`}
            >
              <div className="voice-link-icon">
                <Mic size={20} />
              </div>

              <div className="voice-link-content">
                <span>
                  {isListening
                    ? 'VOICE LINK ACTIVE'
                    : 'VOICE COMMAND LINK'}
                </span>

                <div className="voice-wave">
                  {Array.from({ length: 28 }).map(
                    (_, index) => (
                      <i
                        key={index}
                        style={{
                          height: `${7 + ((index * 11) % 15)}px`,
                          animationDelay: `${index * 0.04}s`,
                        }}
                      />
                    )
                  )}
                </div>
              </div>

              <small>
                {isListening
                  ? 'LISTENING...'
                  : 'VOICE READY'}
              </small>
            </div>

            {messages.length > 0 && (
              <div className="command-message-preview">
                {messages.slice(-2).map((entry) => (
                  <div
                    className={`preview-message ${entry.role.toLowerCase()}`}
                    key={entry.id}
                  >
                    <span>
                      {entry.role === 'USER'
                        ? 'YOU'
                        : assistantName.toUpperCase()}
                    </span>

                    <p>{entry.content}</p>
                  </div>
                ))}
              </div>
            )}

            {renderComposer()}

            <div className="command-suggestions">
              <span>QUICK COMMANDS</span>

              <button
                onClick={() =>
                  setMessage('What can you do?')
                }
              >
                <Sparkles size={14} />
                What can you do?
              </button>

              <button
                onClick={() =>
                  setMessage('Show my conversations')
                }
              >
                <MessageSquare size={14} />
                Show conversations
              </button>

              <button
                onClick={() =>
                  setMessage('System status')
                }
              >
                <Activity size={14} />
                System status
              </button>
            </div>
          </section>
        ) : (
          <section className="conversations-view">
            <div className="conversation-list-panel">
              <div className="conversation-panel-header">
                <div>
                  <span className="eyebrow">
                    NEXUS ARCHIVE
                  </span>

                  <h2>Conversations</h2>
                </div>

                <button
                  onClick={handleNewConversation}
                  title="New conversation"
                >
                  <Plus size={19} />
                </button>
              </div>

              <div className="conversation-list">
                {conversations.length === 0 ? (
                  <div className="empty-conversations">
                    <MessageSquare size={28} />
                    <p>No conversations yet.</p>
                  </div>
                ) : (
                  conversations.map((conversation) => (
                    <button
                      key={conversation.id}
                      className={`conversation-row ${
                        selectedConversationId ===
                        conversation.id
                          ? 'selected'
                          : ''
                      }`}
                      onClick={() =>
                        handleSelectConversation(
                          conversation
                        )
                      }
                    >
                      <MessageSquare size={17} />

                      <span>
                        <strong>
                          {conversation.title ||
                            'Conversation'}
                        </strong>

                        <small>
                          {conversation.createdAt
                            ? new Date(
                                conversation.createdAt
                              ).toLocaleDateString()
                            : 'Recent'}
                        </small>
                      </span>

                      <ChevronRight size={16} />
                    </button>
                  ))
                )}
              </div>
            </div>

            <div className="conversation-thread-panel">
              <div className="conversation-panel-header thread-header">
                <div>
                  <span className="eyebrow">
                    CONVERSATION THREAD
                  </span>

                  <h2>
                    {selectedConversationId
                      ? 'Continue your conversation'
                      : 'Select a conversation'}
                  </h2>
                </div>

                <div className="thread-status">
                  <span />
                  ENCRYPTED
                </div>
              </div>

              <div className="conversation-thread">
                {!selectedConversationId ? (
                  <div className="empty-thread">
                    <Bot size={38} />

                    <h3>
                      No conversation selected
                    </h3>

                    <p>
                      Select a saved conversation or
                      create a new one.
                    </p>
                  </div>
                ) : messages.length === 0 ? (
                  <div className="empty-thread">
                    <Sparkles size={38} />

                    <h3>
                      Start the conversation
                    </h3>

                    <p>
                      Send a command to begin talking
                      with {assistantName}.
                    </p>
                  </div>
                ) : (
                  messages.map((entry) => (
                    <article
                      key={entry.id}
                      className={`thread-message ${entry.role.toLowerCase()}`}
                    >
                      <div className="thread-message-label">
                        {entry.role === 'USER'
                          ? 'YOU'
                          : assistantName.toUpperCase()}
                      </div>

                      <p>{entry.content}</p>
                    </article>
                  ))
                )}
              </div>

              <div className="conversation-composer">
                {renderComposer()}
              </div>
            </div>
          </section>
        )}

        <footer className="nexus-footer">
          <span>NEXUS AI</span>
          <span>CORE ENGINE CONNECTED</span>
          <span>v1.0.0</span>
        </footer>
      </main>
    </div>
  )
}

export default App