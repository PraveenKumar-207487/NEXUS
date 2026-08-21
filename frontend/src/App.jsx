import { useEffect, useRef, useState } from 'react'
import Login from './pages/Login'
import Files from './pages/Files'
import api from './api/axios'
import Automation from './pages/Automation'
import {
  Activity,
  Bot,
  BrainCircuit,
  ChevronRight,
  Cpu,
  Database,
  FileText,
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
  Square,
  Volume2,
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
  {
    label: 'AI Core',
    value: '98%',
    icon: BrainCircuit,
  },
  {
    label: 'Memory',
    value: '48%',
    icon: Database,
  },
  {
    label: 'Network',
    value: 'Online',
    icon: Network,
  },
]

function App() {
  const getStoredUserName = () =>
    localStorage.getItem('nexusName') || 'User'

  const getStoredAssistantName = () =>
    localStorage.getItem('nexusAssistantName') || 'JARVIS'

  const [message, setMessage] = useState('')
  const [messages, setMessages] = useState([])
  const [conversations, setConversations] = useState([])

  const [selectedConversationId, setSelectedConversationId] =
    useState(
      localStorage.getItem('nexusConversationId') || ''
    )

  const [activeView, setActiveView] = useState('command')

  const [userName, setUserName] =
    useState(getStoredUserName())

  const [assistantName, setAssistantName] =
    useState(getStoredAssistantName())

  const [isListening, setIsListening] = useState(false)
  const [isSending, setIsSending] = useState(false)
  const [isSpeaking, setIsSpeaking] = useState(false)
  const [voiceError, setVoiceError] = useState('')
  const [greeting, setGreeting] = useState(getGreeting)
  const [isMobileMenuOpen, setIsMobileMenuOpen] =
    useState(false)

  const recognitionRef = useRef(null)
  const speakRef = useRef(null)

  const [authenticated, setAuthenticated] = useState(
    Boolean(localStorage.getItem('nexusToken'))
  )

  /*
   * =========================================
   * LOAD BROWSER VOICES
   * =========================================
   */

  useEffect(() => {
    if (!('speechSynthesis' in window)) return

    window.speechSynthesis.getVoices()

    const handleVoicesChanged = () => {
      window.speechSynthesis.getVoices()
    }

    window.speechSynthesis.addEventListener(
      'voiceschanged',
      handleVoicesChanged
    )

    return () => {
      window.speechSynthesis.removeEventListener(
        'voiceschanged',
        handleVoicesChanged
      )
    }
  }, [])

  /*
   * =========================================
   * JARVIS SPEECH
   * =========================================
   */

  const speak = (text) => {
    if (!text) return

    if (!('speechSynthesis' in window)) {
      setVoiceError(
        'Speech output is not supported by this browser. Please use Chrome or Edge.'
      )

      setIsSpeaking(false)
      return
    }

    try {
      window.speechSynthesis.cancel()

      const voices =
        window.speechSynthesis.getVoices()

      const preferredVoice =
        voices.find(
          (voice) =>
            voice.lang === 'en-US' &&
            /Google US English|Microsoft|David|Mark|Guy/i.test(
              voice.name
            )
        ) ||
        voices.find(
          (voice) =>
            voice.lang.startsWith('en-US') &&
            !/female|zira|samantha|susan/i.test(
              voice.name
            )
        ) ||
        voices.find((voice) =>
          voice.lang.startsWith('en-US')
        ) ||
        voices.find((voice) =>
          voice.lang.startsWith('en')
        ) ||
        voices[0]

      const utterance =
        new SpeechSynthesisUtterance(text)

      if (preferredVoice) {
        utterance.voice = preferredVoice
        utterance.lang =
          preferredVoice.lang || 'en-US'
      } else {
        utterance.lang = 'en-US'
      }

      utterance.rate = 0.9
      utterance.pitch = 0.72
      utterance.volume = 1

      utterance.onstart = () => {
        setIsSpeaking(true)
        setVoiceError('')
      }

      utterance.onend = () => {
        setIsSpeaking(false)
        speakRef.current = null
      }

      utterance.onerror = (event) => {
        console.error(
          'Speech synthesis error:',
          event
        )

        setIsSpeaking(false)
        speakRef.current = null

        if (
          event.error !== 'canceled' &&
          event.error !== 'interrupted'
        ) {
          setVoiceError(
            'JARVIS could not complete the voice response.'
          )
        }
      }

      speakRef.current = utterance
      setIsSpeaking(true)

      window.speechSynthesis.speak(utterance)
    } catch (error) {
      console.error(
        'Speech synthesis failed:',
        error
      )

      setIsSpeaking(false)
      speakRef.current = null

      setVoiceError(
        'JARVIS voice output could not be started.'
      )
    }
  }

  /*
   * =========================================
   * STOP SPEAKING
   * =========================================
   */

  const handleStopSpeaking = () => {
    if (!('speechSynthesis' in window)) return

    window.speechSynthesis.cancel()

    speakRef.current = null
    setIsSpeaking(false)
  }

  /*
   * =========================================
   * UPDATE GREETING
   * =========================================
   */

  useEffect(() => {
    const timer = window.setInterval(() => {
      setGreeting(getGreeting())
    }, 60_000)

    return () => window.clearInterval(timer)
  }, [])

  /*
   * =========================================
   * CLEANUP
   * =========================================
   */

  useEffect(() => {
    return () => {
      recognitionRef.current?.stop()
      window.speechSynthesis?.cancel()
    }
  }, [])

  /*
   * =========================================
   * LOAD CONVERSATIONS
   * =========================================
   */

  const loadConversations = async () => {
    try {
      const response =
        await api.get('/conversations')

      const nextConversations =
        response?.data?.data || []

      setConversations(nextConversations)

      if (selectedConversationId) {
        const exists =
          nextConversations.some(
            (conversation) =>
              conversation.id ===
              selectedConversationId
          )

        if (!exists) {
          setSelectedConversationId('')

          localStorage.removeItem(
            'nexusConversationId'
          )
        }
      }
    } catch (error) {
      console.error(
        'Failed to load conversations:',
        error
      )
    }
  }

  /*
   * =========================================
   * LOAD CONVERSATION MESSAGES
   * =========================================
   */

  const loadConversationMessages = async (
    conversationId
  ) => {
    if (!conversationId) {
      setMessages([])
      return
    }

    try {
      const response =
        await api.get(
          `/conversations/${conversationId}/messages`
        )

      const history =
        response?.data?.data || []

      setMessages(
        history.map((entry) => ({
          id: entry.id,
          role: entry.role,
          content: entry.content,
          createdAt: entry.createdAt,
        }))
      )
    } catch (error) {
      console.error(
        'Failed to load messages:',
        error
      )

      setMessages([])
    }
  }

  /*
   * =========================================
   * LOAD USER DATA
   * =========================================
   */

  useEffect(() => {
    if (!authenticated) return

    setUserName(getStoredUserName())

    setAssistantName(
      getStoredAssistantName()
    )

    loadConversations()
  }, [authenticated])

  /*
   * =========================================
   * LOAD SELECTED CONVERSATION
   * =========================================
   */

  useEffect(() => {
    if (!authenticated) return

    if (!selectedConversationId) {
      setMessages([])
      return
    }

    localStorage.setItem(
      'nexusConversationId',
      selectedConversationId
    )

    loadConversationMessages(
      selectedConversationId
    )
  }, [
    authenticated,
    selectedConversationId,
  ])

  /*
   * =========================================
   * LOGIN
   * =========================================
   */

  const handleLogin = (userData = null) => {
    const loggedInName =
      userData?.name ||
      localStorage.getItem('nexusName') ||
      'User'

    const loggedInAssistant =
      userData?.assistantName ||
      localStorage.getItem(
        'nexusAssistantName'
      ) ||
      'JARVIS'

    localStorage.setItem(
      'nexusName',
      loggedInName
    )

    localStorage.setItem(
      'nexusAssistantName',
      loggedInAssistant
    )

    localStorage.removeItem(
      'nexusConversationId'
    )

    setUserName(loggedInName)
    setAssistantName(loggedInAssistant)
    setSelectedConversationId('')
    setMessages([])
    setConversations([])
    setActiveView('command')
    setAuthenticated(true)
  }

  /*
   * =========================================
   * LOGOUT
   * =========================================
   */

  const handleLogout = () => {
    recognitionRef.current?.stop()

    window.speechSynthesis?.cancel()

    localStorage.removeItem('nexusToken')
    localStorage.removeItem('nexusEmail')
    localStorage.removeItem('nexusName')
    localStorage.removeItem('nexusRole')
    localStorage.removeItem(
      'nexusAssistantName'
    )
    localStorage.removeItem(
      'nexusConversationId'
    )

    setAuthenticated(false)
    setSelectedConversationId('')
    setMessages([])
    setConversations([])
    setUserName('User')
    setAssistantName('JARVIS')
    setVoiceError('')
    setMessage('')
    setIsListening(false)
    setIsSpeaking(false)
    setActiveView('command')
  }

  /*
   * =========================================
   * ENSURE CONVERSATION
   * =========================================
   */

  const ensureConversation = async () => {
    const activeConversationId =
      selectedConversationId ||
      localStorage.getItem(
        'nexusConversationId'
      )

    if (activeConversationId) {
      return activeConversationId
    }

    const response =
      await api.post('/conversations', {
        title: `Conversation - ${new Date().toLocaleDateString()}`,
      })

    const nextConversationId =
      response?.data?.data?.id

    if (!nextConversationId) {
      throw new Error(
        'Conversation ID missing from response.'
      )
    }

    setSelectedConversationId(
      nextConversationId
    )

    localStorage.setItem(
      'nexusConversationId',
      nextConversationId
    )

    await loadConversations()

    return nextConversationId
  }

  /*
   * =========================================
   * CREATE NEW CONVERSATION
   * =========================================
   */

  const handleNewConversation = async () => {
    handleStopSpeaking()

    setMessages([])
    setSelectedConversationId('')

    localStorage.removeItem(
      'nexusConversationId'
    )

    try {
      const response =
        await api.post('/conversations', {
          title: 'New Conversation',
        })

      const nextConversationId =
        response?.data?.data?.id

      if (!nextConversationId) return

      setSelectedConversationId(
        nextConversationId
      )

      localStorage.setItem(
        'nexusConversationId',
        nextConversationId
      )

      setActiveView('conversations')
      setIsMobileMenuOpen(false)

      await loadConversations()
    } catch (error) {
      console.error(
        'Failed to create conversation:',
        error
      )
    }
  }

  /*
   * =========================================
   * SELECT CONVERSATION
   * =========================================
   */

  const handleSelectConversation = async (
    conversation
  ) => {
    handleStopSpeaking()

    setSelectedConversationId(
      conversation.id
    )

    localStorage.setItem(
      'nexusConversationId',
      conversation.id
    )

    setActiveView('conversations')
    setIsMobileMenuOpen(false)

    await loadConversationMessages(
      conversation.id
    )
  }

  /*
   * =========================================
   * SEND CHAT MESSAGE
   * =========================================
   */

  const handleSend = async (
    messageToSend = message
  ) => {
    const trimmedMessage =
      messageToSend.trim()

    if (!trimmedMessage || isSending) return

    if (!localStorage.getItem('nexusToken')) {
      setAuthenticated(false)
      return
    }

    if (isSpeaking) {
      handleStopSpeaking()
    }

    try {
      setIsSending(true)
      setVoiceError('')

      const conversationId =
        await ensureConversation()

      const response =
        await api.post('/chat', {
          conversationId,
          message: trimmedMessage,
          assistantName,
        })

      const chatData =
        response?.data?.data

      const aiResponse =
        chatData?.aiResponse ||
        'No response received.'

      const timestamp = Date.now()

      setMessages((previous) => [
        ...previous,
        {
          id: `${conversationId}-user-${timestamp}`,
          role: 'USER',
          content: trimmedMessage,
        },
        {
          id: `${conversationId}-assistant-${timestamp + 1}`,
          role: 'ASSISTANT',
          content: aiResponse,
        },
      ])

      setMessage('')

      speak(aiResponse)

      await loadConversations()
    } catch (error) {
      console.error(
        'Chat request failed:',
        error
      )

      setVoiceError(
        error.response?.data?.message ||
          'NEXUS could not complete that request. Please try again.'
      )
    } finally {
      setIsSending(false)
    }
  }

  /*
   * =========================================
   * NORMAL VOICE INPUT
   * =========================================
   */

  const handleVoice = () => {
    if (isSpeaking) {
      setVoiceError(
        'JARVIS is speaking. Stop the response before giving another voice command.'
      )

      return
    }

    if (isListening) {
      recognitionRef.current?.stop()
      return
    }

    const SpeechRecognition =
      window.SpeechRecognition ||
      window.webkitSpeechRecognition

    if (!SpeechRecognition) {
      setVoiceError(
        'Voice input is not supported by this browser. Please use Chrome or Edge.'
      )

      return
    }

    setVoiceError('')

    const recognition =
      new SpeechRecognition()

    recognition.lang = 'en-US'
    recognition.continuous = false
    recognition.interimResults = false

    recognition.onstart = () => {
      setIsListening(true)
      setVoiceError('')
    }

    recognition.onresult = (event) => {
      const transcript =
        event.results[0][0].transcript.trim()

      if (!transcript) return

      setMessage(transcript)

      void handleSend(transcript)
    }

    recognition.onerror = (event) => {
      const errors = {
        'not-allowed':
          'Microphone permission was denied. Allow microphone access and try again.',

        'no-speech':
          'No speech was detected. Please try again.',

        'audio-capture':
          'No microphone was found or is unavailable.',

        aborted:
          'Voice input was stopped.',
      }

      setVoiceError(
        errors[event.error] ||
          'Voice input could not be completed. Please try again.'
      )

      setIsListening(false)
    }

    recognition.onend = () => {
      setIsListening(false)
    }

    recognitionRef.current = recognition

    try {
      recognition.start()
    } catch (error) {
      console.error(
        'Voice recognition could not start:',
        error
      )

      setIsListening(false)

      setVoiceError(
        'Voice input could not be started. Please try again.'
      )
    }
  }

  /*
   * =========================================
   * AUTOMATION COMMAND RECOGNITION
   *
   * This is separate from normal chat voice.
   *
   * Example:
   * "Open YouTube"
   *     ↓
   * Direct browser action
   * =========================================
   */

  const handleAutomationCommand = (
    command
  ) => {
    const normalizedCommand =
      command.toLowerCase().trim()

    console.log(
      'Automation voice command:',
      normalizedCommand
    )

    setVoiceError('')

    /*
     * OPEN YOUTUBE
     */

    if (
      normalizedCommand.includes(
        'open youtube'
      ) ||
      normalizedCommand === 'youtube'
    ) {
      window.open(
        'https://www.youtube.com',
        '_blank',
        'noopener,noreferrer'
      )

      return
    }

    /*
     * OPEN GOOGLE
     */

    if (
      normalizedCommand.includes(
        'open google'
      ) ||
      normalizedCommand === 'google'
    ) {
      window.open(
        'https://www.google.com',
        '_blank',
        'noopener,noreferrer'
      )

      return
    }

    /*
     * OPEN GMAIL
     */

    if (
      normalizedCommand.includes(
        'open gmail'
      ) ||
      normalizedCommand.includes(
        'open mail'
      )
    ) {
      window.open(
        'https://mail.google.com',
        '_blank',
        'noopener,noreferrer'
      )

      return
    }

    /*
     * OPEN CHATGPT
     */

    if (
      normalizedCommand.includes(
        'open chatgpt'
      ) ||
      normalizedCommand.includes(
        'open chat gpt'
      )
    ) {
      window.open(
        'https://chatgpt.com',
        '_blank',
        'noopener,noreferrer'
      )

      return
    }

    /*
     * CLOSE AUTOMATION
     */

    if (
      normalizedCommand.includes(
        'close automation'
      ) ||
      normalizedCommand.includes(
        'exit automation'
      ) ||
      normalizedCommand.includes(
        'go back'
      )
    ) {
      setActiveView('command')
      return
    }

    /*
     * UNKNOWN COMMAND
     */

    setVoiceError(
      `Command not recognized: "${command}"`
    )
  }

  /*
   * =========================================
   * AUTOMATION VOICE INPUT
   *
   * This voice is used ONLY inside
   * Automation screen.
   * =========================================
   */

  const handleAutomationVoice = () => {
    if (isSpeaking) {
      handleStopSpeaking()
      return
    }

    if (isListening) {
      recognitionRef.current?.stop()
      return
    }

    const SpeechRecognition =
      window.SpeechRecognition ||
      window.webkitSpeechRecognition

    if (!SpeechRecognition) {
      setVoiceError(
        'Voice input is not supported by this browser. Please use Chrome or Edge.'
      )

      return
    }

    setVoiceError('')

    const recognition =
      new SpeechRecognition()

    recognition.lang = 'en-US'
    recognition.continuous = false
    recognition.interimResults = false

    recognition.onstart = () => {
      setIsListening(true)
      setVoiceError('')
    }

    recognition.onresult = (event) => {
      const transcript =
        event.results[0][0].transcript.trim()

      console.log(
        'Automation command received:',
        transcript
      )

      if (!transcript) return

      handleAutomationCommand(transcript)
    }

    recognition.onerror = (event) => {
      console.error(
        'Automation voice error:',
        event.error
      )

      const errors = {
        'not-allowed':
          'Microphone permission was denied. Allow microphone access and try again.',

        'no-speech':
          'No speech detected. Please try again.',

        'audio-capture':
          'No microphone was found or is unavailable.',

        aborted:
          'Voice command was stopped.',
      }

      setVoiceError(
        errors[event.error] ||
          'Voice command could not be completed. Please try again.'
      )

      setIsListening(false)
    }

    recognition.onend = () => {
      setIsListening(false)
      recognitionRef.current = null
    }

    recognitionRef.current = recognition

    try {
      recognition.start()
    } catch (error) {
      console.error(
        'Automation voice could not start:',
        error
      )

      setIsListening(false)
      recognitionRef.current = null

      setVoiceError(
        'Voice command could not be started. Please try again.'
      )
    }
  }

  /*
   * =========================================
   * SHARED COMMAND COMPOSER
   * =========================================
   */

  const renderComposer = () => (
    <div className="command-composer-wrap">
      {voiceError && (
        <p className="voice-error">
          {voiceError}
        </p>
      )}

      <div className="command-composer">
        <button
          className={`mic-control ${
            isListening ? 'active' : ''
          } ${
            isSpeaking ? 'disabled' : ''
          }`}
          onClick={handleVoice}
          disabled={
            isSending || isSpeaking
          }
          title={
            isSpeaking
              ? 'JARVIS is speaking'
              : isListening
                ? 'Stop listening'
                : 'Voice command'
          }
        >
          <Mic size={22} />
        </button>

        <input
          type="text"
          placeholder={
            isSpeaking
              ? `${assistantName} is speaking...`
              : isListening
                ? 'Listening for your command...'
                : 'Type your command...'
          }
          value={message}
          onChange={(event) =>
            setMessage(event.target.value)
          }
          disabled={isSpeaking}
          onKeyDown={(event) => {
            if (event.key === 'Enter') {
              event.preventDefault()
              handleSend()
            }
          }}
        />

        {isSpeaking ? (
          <button
            className="send-control"
            onClick={handleStopSpeaking}
            title="Stop JARVIS"
          >
            <Square size={18} />
          </button>
        ) : (
          <button
            className="send-control"
            onClick={() => handleSend()}
            disabled={
              isSending ||
              !message.trim()
            }
            title={
              isSending
                ? 'Sending...'
                : 'Send command'
            }
          >
            <Send size={21} />
          </button>
        )}
      </div>
    </div>
  )

  /*
   * =========================================
   * LOGIN SCREEN
   * =========================================
   */

  if (!authenticated) {
    return <Login onLogin={handleLogin} />
  }

  /*
   * =========================================
   * AUTOMATION FULLSCREEN
   *
   * Automation gets its own fullscreen shell.
   *
   * Voice button is added here.
   *
   * Example:
   *
   * User clicks mic
   *       ↓
   * "Open YouTube"
   *       ↓
   * Speech Recognition
   *       ↓
   * handleAutomationCommand()
   *       ↓
   * YouTube opens
   * =========================================
   */

  if (activeView === 'automation') {
    return (
      <div className="automation-fullscreen-wrapper">

        <Automation
          onClose={() =>
            setActiveView('command')
          }
          assistantName={assistantName}
        />

        {/* =====================================
            AUTOMATION VOICE CONTROL
        ====================================== */}

        <div className="automation-voice-control">

          {voiceError && (
            <div className="automation-voice-error">
              {voiceError}
            </div>
          )}

          <button
            className={`automation-mic-button ${
              isListening ? 'active' : ''
            }`}
            onClick={handleAutomationVoice}
            disabled={isSpeaking}
            title={
              isListening
                ? 'Stop listening'
                : 'Give automation command'
            }
          >
            <Mic size={25} />
          </button>

          <div className="automation-voice-info">
            <strong>
              {isListening
                ? 'LISTENING...'
                : 'VOICE AUTOMATION'}
            </strong>

            <span>
              {isListening
                ? 'Say a command'
                : 'Say "Open YouTube"'}
            </span>
          </div>

          {isListening && (
            <div className="automation-voice-status">
              <span />
              <span />
              <span />
            </div>
          )}

        </div>
      </div>
    )
  }

  /*
   * =========================================
   * NORMAL NEXUS APPLICATION
   * =========================================
   */

  return (
    <div className="nexus-shell">
      <div className="ambient-grid" />
      <div className="ambient-glow glow-one" />
      <div className="ambient-glow glow-two" />

      {/* =========================================
          SIDEBAR
      ========================================= */}

      <aside
        className={`nexus-sidebar ${
          isMobileMenuOpen ? 'open' : ''
        }`}
      >
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
            onClick={() =>
              setIsMobileMenuOpen(false)
            }
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

        <div className="sidebar-label">
          WORKSPACE
        </div>

        <nav className="sidebar-navigation">

          {/* COMMAND CENTER */}

          <button
            className={
              activeView === 'command'
                ? 'active'
                : ''
            }
            onClick={() => {
              setActiveView('command')
              setIsMobileMenuOpen(false)
            }}
          >
            <Activity size={18} />
            Command Center
          </button>

          {/* CONVERSATIONS */}

          <button
            className={
              activeView === 'conversations'
                ? 'active'
                : ''
            }
            onClick={() => {
              setActiveView('conversations')
              setIsMobileMenuOpen(false)
            }}
          >
            <MessageSquare size={18} />
            Conversations
          </button>

          {/* FILES */}

          <button
            className={
              activeView === 'files'
                ? 'active'
                : ''
            }
            onClick={() => {
              setActiveView('files')
              setIsMobileMenuOpen(false)
            }}
          >
            <FileText size={18} />
            Files
          </button>

          {/* AUTOMATION */}

          <button
            className={
              activeView === 'automation'
                ? 'active'
                : ''
            }
            onClick={() => {
              setActiveView('automation')
              setIsMobileMenuOpen(false)
              setVoiceError('')
            }}
          >
            <Zap size={18} />
            Automation
          </button>
        </nav>

        {/* =========================================
            RECENT CONVERSATIONS
        ========================================= */}

        <div className="sidebar-conversations">
          <div className="sidebar-label">
            RECENT CONVERSATIONS

            <button
              onClick={() =>
                setActiveView(
                  'conversations'
                )
              }
            >
              <ChevronRight size={16} />
            </button>
          </div>

          {conversations
            .slice(0, 4)
            .map((conversation) => (
              <button
                className="recent-conversation"
                key={conversation.id}
                onClick={() =>
                  handleSelectConversation(
                    conversation
                  )
                }
              >
                <MessageSquare size={15} />

                <span>
                  {conversation.title ||
                    'Conversation'}
                </span>
              </button>
            ))}

          {conversations.length === 0 && (
            <p className="no-recent-conversations">
              No conversations yet.
            </p>
          )}
        </div>

        {/* =========================================
            CORE STATUS
        ========================================= */}

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
              AI ENGINE{' '}
              <strong>READY</strong>
            </span>

            <span>
              SECURITY{' '}
              <strong>ACTIVE</strong>
            </span>
          </div>
        </div>

        {/* =========================================
            FOOTER CONTROLS
        ========================================= */}

        <div className="sidebar-footer-controls">
          <button title="Settings">
            <Settings size={18} />
          </button>

          <button
            onClick={handleLogout}
            title="Log out"
          >
            <Power size={18} />
          </button>
        </div>
      </aside>

      {/* =========================================
          MOBILE OVERLAY
      ========================================= */}

      {isMobileMenuOpen && (
        <button
          className="sidebar-overlay"
          onClick={() =>
            setIsMobileMenuOpen(false)
          }
          aria-label="Close menu"
        />
      )}

      <main className="nexus-main">

        {/* =========================================
            HEADER
        ========================================= */}

        <header className="nexus-header">
          <button
            className="mobile-menu-button"
            onClick={() =>
              setIsMobileMenuOpen(true)
            }
          >
            <Menu size={23} />
          </button>

          <div className="header-title">
            <span className="header-dot" />

            {activeView === 'command'
              ? 'COMMAND CENTER'
              : activeView === 'conversations'
                ? 'CONVERSATIONS'
                : 'FILES'}
          </div>

          <div className="header-status">
            <span className="live-time">
              {new Date().toLocaleTimeString(
                [],
                {
                  hour: '2-digit',
                  minute: '2-digit',
                }
              )}
            </span>

            <Radio size={18} />
            <Settings size={18} />
          </div>
        </header>

        {/* =========================================
            COMMAND CENTER
        ========================================= */}

        {activeView === 'command' ? (
          <section className="command-view">

            <div className="command-topline">
              <div>
                <span className="eyebrow">
                  NEXUS INTELLIGENCE SYSTEM
                </span>

                <h1>
                  {greeting},{' '}
                  <span>{userName}.</span>
                </h1>

                <p>
                  {assistantName} is ready
                  for your next command.
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
                  ({
                    label,
                    value,
                    icon: Icon,
                  }) => (
                    <article
                      className="metric-card"
                      key={label}
                    >
                      <div className="metric-icon">
                        <Icon size={18} />
                      </div>

                      <div>
                        <small>{label}</small>

                        <strong>
                          {value}
                        </strong>
                      </div>
                    </article>
                  )
                )}
              </div>

              <div
                className={`nexus-core-stage ${
                  isListening ||
                  isSpeaking
                    ? 'listening'
                    : ''
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
                    {assistantName
                      .charAt(0)
                      .toUpperCase()}
                  </strong>

                  <span>
                    {assistantName.toUpperCase()}
                  </span>
                </div>

                <div className="core-caption">
                  <span className="core-caption-dot" />

                  {isSpeaking
                    ? 'JARVIS SPEAKING'
                    : isListening
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

                  <span>
                    AI modules available
                  </span>
                </article>

                <article className="activity-card">
                  <div className="card-heading">
                    <Network size={17} />
                    DATA FLOW
                  </div>

                  <strong>
                    2.7 TB/s
                  </strong>

                  <span>
                    Secure connection
                    active
                  </span>
                </article>

                <article className="activity-card">
                  <div className="card-heading">
                    <ShieldCheck size={17} />
                    SECURITY
                  </div>

                  <strong>
                    PROTECTED
                  </strong>

                  <span>
                    All systems secure
                  </span>
                </article>

              </div>
            </div>

            {/* =========================================
                VOICE PANEL
            ========================================= */}

            <div
              className={`voice-link-panel ${
                isListening ||
                isSpeaking
                  ? 'active'
                  : ''
              } ${
                isSpeaking
                  ? 'speaking'
                  : ''
              }`}
            >
              <div className="voice-link-icon">
                {isSpeaking ? (
                  <Volume2 size={20} />
                ) : (
                  <Mic size={20} />
                )}
              </div>

              <div className="voice-link-content">
                <span>
                  {isSpeaking
                    ? 'JARVIS SPEAKING'
                    : isListening
                      ? 'VOICE LINK ACTIVE'
                      : 'VOICE COMMAND LINK'}
                </span>

                <div className="voice-wave">
                  {Array.from({
                    length: 28,
                  }).map(
                    (_, index) => (
                      <i
                        key={index}
                        style={{
                          height: `${
                            7 +
                            ((index *
                              11) %
                              15)
                          }px`,
                          animationDelay: `${
                            index *
                            0.04
                          }s`,
                        }}
                      />
                    )
                  )}
                </div>
              </div>

              <small>
                {isSpeaking
                  ? 'SPEAKING...'
                  : isListening
                    ? 'LISTENING...'
                    : 'VOICE READY'}
              </small>
            </div>

            {isSpeaking && (
              <button
                className="voice-stop-button"
                onClick={
                  handleStopSpeaking
                }
                title="Stop JARVIS"
              >
                <Square size={16} />
                STOP JARVIS
              </button>
            )}

            {/* =========================================
                MESSAGE PREVIEW
            ========================================= */}

            {messages.length > 0 && (
              <div className="command-message-preview">
                {messages
                  .slice(-2)
                  .map((entry) => (
                    <div
                      className={`preview-message ${entry.role.toLowerCase()}`}
                      key={entry.id}
                    >
                      <span>
                        {entry.role ===
                        'USER'
                          ? 'YOU'
                          : assistantName.toUpperCase()}
                      </span>

                      <p>
                        {entry.content}
                      </p>
                    </div>
                  ))}
              </div>
            )}

            {renderComposer()}

            {/* =========================================
                QUICK COMMANDS
            ========================================= */}

            <div className="command-suggestions">
              <span>
                QUICK COMMANDS
              </span>

              <button
                onClick={() =>
                  setMessage(
                    'What can you do?'
                  )
                }
              >
                <Sparkles size={14} />
                What can you do?
              </button>

              <button
                onClick={() =>
                  setMessage(
                    'Show my conversations'
                  )
                }
              >
                <MessageSquare size={14} />
                Show conversations
              </button>

              <button
                onClick={() =>
                  setMessage(
                    'System status'
                  )
                }
              >
                <Activity size={14} />
                System status
              </button>
            </div>
          </section>

        ) : activeView === 'conversations' ? (

          /* =========================================
             CONVERSATIONS
          ========================================= */

          <section className="conversations-view">

            <div className="conversation-list-panel">
              <div className="conversation-panel-header">
                <div>
                  <span className="eyebrow">
                    NEXUS ARCHIVE
                  </span>

                  <h2>
                    Conversations
                  </h2>
                </div>

                <button
                  onClick={
                    handleNewConversation
                  }
                  title="New conversation"
                >
                  <Plus size={19} />
                </button>
              </div>

              <div className="conversation-list">
                {conversations.length ===
                0 ? (
                  <div className="empty-conversations">
                    <MessageSquare
                      size={28}
                    />

                    <p>
                      No conversations
                      yet.
                    </p>
                  </div>
                ) : (
                  conversations.map(
                    (conversation) => (
                      <button
                        key={
                          conversation.id
                        }
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
                        <MessageSquare
                          size={17}
                        />

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

                        <ChevronRight
                          size={16}
                        />
                      </button>
                    )
                  )
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
                      No conversation
                      selected
                    </h3>

                    <p>
                      Select a saved
                      conversation or
                      create a new one.
                    </p>
                  </div>

                ) : messages.length ===
                  0 ? (

                  <div className="empty-thread">
                    <Sparkles
                      size={38}
                    />

                    <h3>
                      Start the
                      conversation
                    </h3>

                    <p>
                      Send a command to
                      begin talking with{' '}
                      {assistantName}.
                    </p>
                  </div>

                ) : (

                  messages.map(
                    (entry) => (
                      <article
                        key={entry.id}
                        className={`thread-message ${entry.role.toLowerCase()}`}
                      >
                        <div className="thread-message-label">
                          {entry.role ===
                          'USER'
                            ? 'YOU'
                            : assistantName.toUpperCase()}
                        </div>

                        <p>
                          {entry.content}
                        </p>
                      </article>
                    )
                  )
                )}

              </div>

              <div className="conversation-composer">
                {renderComposer()}
              </div>

            </div>
          </section>

        ) : (

          /* =========================================
             FILES
          ========================================= */

          <section className="files-view">
            <Files
              assistantName={assistantName}
              conversationId={selectedConversationId}
            />
          </section>
        )}

        {/* =========================================
            NORMAL NEXUS FOOTER
        ========================================= */}

        <footer className="nexus-footer">
          <span>NEXUS AI</span>

          <span>
            CORE ENGINE CONNECTED
          </span>

          <span>v1.0.0</span>
        </footer>

      </main>
    </div>
  )
}

export default App