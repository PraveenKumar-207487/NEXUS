import { useEffect, useRef, useState } from 'react'
import {
  Activity,
  Bell,
  CalendarClock,
  CheckCircle2,
  Clock3,
  Command,
  ExternalLink,
  Mic,
  MicOff,
  Send,
  Settings2,
  Square,
  Volume2,
  X,
  Zap,
} from 'lucide-react'
import './Automation.css'

function Automation({ onClose, assistantName }) {
  const [currentTime, setCurrentTime] = useState(new Date())

  const [command, setCommand] = useState('')
  const [isListening, setIsListening] = useState(false)
  const [isSpeaking, setIsSpeaking] = useState(false)

  const [lastCommand, setLastCommand] = useState('')
  const [response, setResponse] = useState(
    'Automation engine ready. Give me a command.'
  )

  const [executionStatus, setExecutionStatus] =
    useState('READY')

  const recognitionRef = useRef(null)
  const speechRef = useRef(null)

  /*
   * =====================================================
   * CLOCK
   * =====================================================
   */

  useEffect(() => {
    const timer = window.setInterval(() => {
      setCurrentTime(new Date())
    }, 1000)

    return () => window.clearInterval(timer)
  }, [])

  /*
   * =====================================================
   * CLEANUP
   * =====================================================
   */

  useEffect(() => {
    return () => {
      recognitionRef.current?.stop()

      if ('speechSynthesis' in window) {
        window.speechSynthesis.cancel()
      }
    }
  }, [])

  /*
   * =====================================================
   * TIME
   * =====================================================
   */

  const formattedTime = currentTime.toLocaleTimeString([], {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  })

  const shortTime = currentTime.toLocaleTimeString([], {
    hour: '2-digit',
    minute: '2-digit',
  })

  /*
   * =====================================================
   * OPEN WEBSITE IN NEW TAB
   *
   * IMPORTANT:
   *
   * NEXUS current tab remains untouched.
   *
   * Website always opens in a NEW browser tab.
   * =====================================================
   */

  const openWebsite = (url) => {
    const newTab = window.open(url, '_blank')

    if (newTab) {
      newTab.focus()
    } else {
      setResponse(
        'The browser blocked the new tab. Please allow pop-ups for NEXUS.'
      )
      setExecutionStatus('ERROR')
    }
  }

  /*
   * =====================================================
   * VOICE RESPONSE
   * =====================================================
   */

  const speak = (text) => {
    if (!text) return

    if (!('speechSynthesis' in window)) {
      return
    }

    window.speechSynthesis.cancel()

    const utterance =
      new SpeechSynthesisUtterance(text)

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
      voices[0]

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
    }

    utterance.onend = () => {
      setIsSpeaking(false)
      speechRef.current = null
    }

    utterance.onerror = () => {
      setIsSpeaking(false)
      speechRef.current = null
    }

    speechRef.current = utterance

    setIsSpeaking(true)

    window.speechSynthesis.speak(utterance)
  }

  /*
   * =====================================================
   * STOP SPEAKING
   * =====================================================
   */

  const stopSpeaking = () => {
    if (!('speechSynthesis' in window)) return

    window.speechSynthesis.cancel()

    speechRef.current = null
    setIsSpeaking(false)
  }

  /*
   * =====================================================
   * COMMAND RESPONSE
   * =====================================================
   */

  const setCommandResponse = (
    commandText,
    responseText,
    status = 'COMPLETED'
  ) => {
    setLastCommand(commandText)
    setResponse(responseText)
    setExecutionStatus(status)

    speak(responseText)
  }

  /*
   * =====================================================
   * COMMAND EXECUTION
   * =====================================================
   */

  const executeCommand = (rawCommand) => {
    const value = rawCommand.trim()

    if (!value) return

    if (isSpeaking) {
      stopSpeaking()
    }

    setCommand(value)
    setLastCommand(value)
    setExecutionStatus('PROCESSING')

    /*
     * Convert command to lowercase.
     *
     * This also removes:
     *
     * Hey JARVIS
     * Hey Nexus
     *
     * so commands like:
     *
     * "Hey JARVIS, open YouTube"
     *
     * work correctly.
     */

    let normalized = value
      .toLowerCase()
      .replace(/[!?.,]/g, ' ')
      .replace(/\s+/g, ' ')
      .trim()

    /*
     * Remove wake words.
     */

    normalized = normalized
      .replace(/^hey\s+jarvis\s+/, '')
      .replace(/^hey\s+nexus\s+/, '')
      .replace(/^jarvis\s+/, '')
      .replace(/^nexus\s+/, '')
      .trim()

    /*
     * =================================================
     * WEBSITE DEFINITIONS
     *
     * Add more websites here whenever required.
     * =================================================
     */

    const websites = [
      {
        names: ['youtube'],
        url: 'https://www.youtube.com',
        response: 'Opening YouTube in a new tab.',
      },

      {
        names: ['google'],
        url: 'https://www.google.com',
        response: 'Opening Google in a new tab.',
      },

      {
        names: ['gmail', 'google mail'],
        url: 'https://mail.google.com',
        response: 'Opening Gmail in a new tab.',
      },

      {
        names: ['chatgpt', 'chat gpt'],
        url: 'https://chatgpt.com',
        response: 'Opening ChatGPT in a new tab.',
      },

      {
        names: ['github', 'git hub'],
        url: 'https://github.com',
        response: 'Opening GitHub in a new tab.',
      },

      {
        names: ['linkedin', 'linked in'],
        url: 'https://www.linkedin.com',
        response: 'Opening LinkedIn in a new tab.',
      },

      {
        names: ['facebook', 'face book'],
        url: 'https://www.facebook.com',
        response: 'Opening Facebook in a new tab.',
      },

      {
        names: ['instagram', 'insta gram'],
        url: 'https://www.instagram.com',
        response: 'Opening Instagram in a new tab.',
      },

      {
        names: ['twitter', 'x'],
        url: 'https://x.com',
        response: 'Opening X in a new tab.',
      },

      {
        names: ['reddit'],
        url: 'https://www.reddit.com',
        response: 'Opening Reddit in a new tab.',
      },

      {
        names: ['whatsapp', 'whatsapp web'],
        url: 'https://web.whatsapp.com',
        response: 'Opening WhatsApp Web in a new tab.',
      },

      {
        names: ['amazon'],
        url: 'https://www.amazon.in',
        response: 'Opening Amazon in a new tab.',
      },

      {
        names: ['flipkart', 'flip cart'],
        url: 'https://www.flipkart.com',
        response: 'Opening Flipkart in a new tab.',
      },

      {
        names: ['netflix'],
        url: 'https://www.netflix.com',
        response: 'Opening Netflix in a new tab.',
      },

      {
        names: ['spotify'],
        url: 'https://open.spotify.com',
        response: 'Opening Spotify in a new tab.',
      },

      {
        names: ['prime video', 'amazon prime'],
        url: 'https://www.primevideo.com',
        response: 'Opening Prime Video in a new tab.',
      },

      {
        names: ['google drive', 'drive'],
        url: 'https://drive.google.com',
        response: 'Opening Google Drive in a new tab.',
      },

      {
        names: ['google docs', 'docs'],
        url: 'https://docs.google.com',
        response: 'Opening Google Docs in a new tab.',
      },

      {
        names: ['google sheets', 'sheets'],
        url: 'https://sheets.google.com',
        response: 'Opening Google Sheets in a new tab.',
      },

      {
        names: ['google maps', 'maps'],
        url: 'https://maps.google.com',
        response: 'Opening Google Maps in a new tab.',
      },

      {
        names: ['stackoverflow', 'stack overflow'],
        url: 'https://stackoverflow.com',
        response: 'Opening Stack Overflow in a new tab.',
      },

      {
        names: ['leetcode', 'leet code'],
        url: 'https://leetcode.com',
        response: 'Opening LeetCode in a new tab.',
      },

      {
        names: ['geeksforgeeks', 'geeks for geeks', 'gfg'],
        url: 'https://www.geeksforgeeks.org',
        response: 'Opening GeeksforGeeks in a new tab.',
      },

      {
        names: ['coursera'],
        url: 'https://www.coursera.org',
        response: 'Opening Coursera in a new tab.',
      },

      {
        names: ['udemy'],
        url: 'https://www.udemy.com',
        response: 'Opening Udemy in a new tab.',
      },

      {
        names: ['canva'],
        url: 'https://www.canva.com',
        response: 'Opening Canva in a new tab.',
      },

      {
        names: ['discord'],
        url: 'https://discord.com',
        response: 'Opening Discord in a new tab.',
      },

      {
        names: ['telegram'],
        url: 'https://web.telegram.org',
        response: 'Opening Telegram in a new tab.',
      },

      {
        names: ['twitch'],
        url: 'https://www.twitch.tv',
        response: 'Opening Twitch in a new tab.',
      },

      {
        names: ['perplexity'],
        url: 'https://www.perplexity.ai',
        response: 'Opening Perplexity in a new tab.',
      },

      {
        names: ['gemini', 'google gemini'],
        url: 'https://gemini.google.com',
        response: 'Opening Gemini in a new tab.',
      },
    ]

    /*
     * =================================================
     * OPEN WEBSITE
     * =================================================
     */

    const website = websites.find((site) =>
      site.names.some((name) => {
        return (
          normalized === name ||
          normalized === `open ${name}` ||
          normalized.includes(`open ${name}`)
        )
      })
    )

    if (website) {
      setCommandResponse(
        value,
        website.response
      )

      /*
       * IMPORTANT:
       *
       * This opens ONLY a NEW TAB.
       *
       * Current NEXUS tab stays open.
       */

      openWebsite(website.url)

      return
    }

    /*
     * =================================================
     * SHOW TIME
     * =================================================
     */

    if (
      normalized.includes('what time is it') ||
      normalized.includes('current time') ||
      normalized === 'time'
    ) {
      const timeText =
        currentTime.toLocaleTimeString([], {
          hour: '2-digit',
          minute: '2-digit',
        })

      setCommandResponse(
        value,
        `The current time is ${timeText}.`
      )

      return
    }

    /*
     * =================================================
     * AUTOMATION STATUS
     * =================================================
     */

    if (
      normalized.includes('automation status') ||
      normalized.includes('system status') ||
      normalized === 'status'
    ) {
      setCommandResponse(
        value,
        'Automation engine is online and ready.'
      )

      return
    }

    /*
     * =================================================
     * UNKNOWN COMMAND
     * =================================================
     */

    setCommandResponse(
      value,
      `I heard "${value}", but I do not know how to execute that command yet.`,
      'UNKNOWN'
    )
  }

  /*
   * =====================================================
   * TEXT COMMAND
   * =====================================================
   */

  const handleSubmit = (event) => {
    event?.preventDefault()

    if (!command.trim()) return

    executeCommand(command)
  }

  /*
   * =====================================================
   * VOICE COMMAND
   * =====================================================
   */

  const handleVoice = () => {
    /*
     * Stop listening
     */

    if (isListening) {
      recognitionRef.current?.stop()
      return
    }

    /*
     * Stop current speech
     */

    if (isSpeaking) {
      stopSpeaking()
      return
    }

    const SpeechRecognition =
      window.SpeechRecognition ||
      window.webkitSpeechRecognition

    if (!SpeechRecognition) {
      const errorMessage =
        'Voice input is not supported in this browser. Please use Chrome or Edge.'

      setResponse(errorMessage)
      setExecutionStatus('ERROR')
      speak(errorMessage)

      return
    }

    const recognition =
      new SpeechRecognition()

    recognition.lang = 'en-US'
    recognition.continuous = false
    recognition.interimResults = false
    recognition.maxAlternatives = 1

    recognition.onstart = () => {
      setIsListening(true)
      setExecutionStatus('LISTENING')
      setResponse(
        'Listening for your automation command...'
      )
    }

    recognition.onresult = (event) => {
      const transcript =
        event.results[0][0].transcript.trim()

      if (!transcript) return

      setCommand(transcript)
      setLastCommand(transcript)

      /*
       * Execute after recognition completes.
       */

      window.setTimeout(() => {
        executeCommand(transcript)
      }, 100)
    }

    recognition.onerror = (event) => {
      console.error(
        'Automation voice error:',
        event
      )

      setIsListening(false)

      let errorMessage =
        'Voice command could not be completed.'

      if (event.error === 'not-allowed') {
        errorMessage =
          'Microphone permission was denied. Please allow microphone access.'
      }

      if (event.error === 'no-speech') {
        errorMessage =
          'I did not hear anything. Please try again.'
      }

      if (event.error === 'audio-capture') {
        errorMessage =
          'No microphone was found.'
      }

      setResponse(errorMessage)
      setExecutionStatus('ERROR')
    }

    recognition.onend = () => {
      setIsListening(false)
    }

    recognitionRef.current = recognition

    try {
      recognition.start()
    } catch (error) {
      console.error(
        'Could not start recognition:',
        error
      )

      setIsListening(false)
      setExecutionStatus('ERROR')
      setResponse(
        'Voice recognition could not be started.'
      )
    }
  }

  /*
   * =====================================================
   * QUICK COMMAND
   * =====================================================
   */

  const runQuickCommand = (quickCommand) => {
    executeCommand(quickCommand)
  }

  /*
   * =====================================================
   * UI
   * =====================================================
   */

  return (
    <section className="automation-fullscreen">

      {/* =====================================================
          FUTURISTIC ARCHITECTURAL ENVIRONMENT
      ===================================================== */}

      <div className="automation-environment">

        <div className="environment-light environment-light-left" />
        <div className="environment-light environment-light-right" />
        <div className="environment-light environment-light-top" />

        <div className="architecture-back-wall">
          <div className="wall-panel wall-panel-one" />
          <div className="wall-panel wall-panel-two" />
          <div className="wall-panel wall-panel-three" />
          <div className="wall-panel wall-panel-four" />
        </div>

        <div className="environment-steel-beam beam-left" />
        <div className="environment-steel-beam beam-left-inner" />
        <div className="environment-steel-beam beam-right" />
        <div className="environment-steel-beam beam-right-inner" />

        <div className="upper-beam upper-beam-one" />
        <div className="upper-beam upper-beam-two" />
        <div className="upper-beam upper-beam-three" />

        <div className="environment-staircase">
          <div className="stair-step step-one" />
          <div className="stair-step step-two" />
          <div className="stair-step step-three" />
          <div className="stair-step step-four" />
          <div className="stair-step step-five" />
          <div className="stair-step step-six" />

          <div className="environment-glass-railing railing-one" />
          <div className="environment-glass-railing railing-two" />
        </div>

        <div className="glass-panel glass-panel-left" />
        <div className="glass-panel glass-panel-right" />

        <div className="environment-floor">
          <div className="floor-reflection" />
        </div>

        <div className="environment-haze" />
      </div>

      {/* =====================================================
          HOLOGRAPHIC BACKGROUND
      ===================================================== */}

      <div className="automation-architecture">
        <div className="core-architecture-wall core-wall-left" />
        <div className="core-architecture-wall core-wall-right" />

        <div className="core-floating-staircase">
          {Array.from({ length: 9 }).map(
            (_, index) => (
              <span key={index} />
            )
          )}
        </div>

        <div className="core-glass-railing core-railing-left" />
        <div className="core-glass-railing core-railing-right" />

        <div className="core-steel-beam core-beam-one" />
        <div className="core-steel-beam core-beam-two" />
        <div className="core-steel-beam core-beam-three" />
      </div>

      <div className="automation-grid" />

      {/* =====================================================
          PARTICLES
      ===================================================== */}

      <div className="automation-stars">
        {Array.from({ length: 45 }).map(
          (_, index) => (
            <span
              key={index}
              style={{
                left: `${(index * 37) % 100}%`,
                top: `${(index * 61) % 100}%`,
                animationDelay: `${
                  (index % 9) * 0.4
                }s`,
                animationDuration: `${
                  3 + (index % 5)
                }s`,
              }}
            />
          )
        )}
      </div>

      <div className="automation-glow glow-left" />
      <div className="automation-glow glow-right" />

      {/* =====================================================
          TOP BAR
      ===================================================== */}

      <header className="automation-topbar">

        <div className="automation-brand">
          <div className="automation-brand-icon">
            <Zap size={21} />
          </div>

          <div>
            <strong>
              {assistantName || 'NEXUS'}
            </strong>

            <span>
              AUTOMATION ENGINE
            </span>
          </div>
        </div>

        <div className="automation-top-status">
          <span className="status-pulse" />
          ENGINE ONLINE
        </div>

        <div className="automation-top-actions">
          <span>{formattedTime}</span>

          <button
            type="button"
            onClick={onClose}
            title="Close Automation"
            aria-label="Close Automation"
          >
            <X size={21} />
          </button>
        </div>
      </header>

      {/* =====================================================
          MAIN COMMAND CENTER
      ===================================================== */}

      <div className="automation-command-center">

        {/* ===================================================
            LEFT PANEL
        =================================================== */}

        <aside className="automation-side-panel left-panel">

          <div className="automation-panel-label">
            <Activity size={15} />
            SYSTEM STATUS
          </div>

          <div className="automation-stat">
            <span>ENGINE</span>
            <strong>ACTIVE</strong>
          </div>

          <div className="automation-stat">
            <span>SCHEDULER</span>
            <strong>RUNNING</strong>
          </div>

          <div className="automation-stat">
            <span>EXECUTION</span>
            <strong>{executionStatus}</strong>
          </div>

          <div className="automation-panel-divider" />

          <div className="automation-panel-label">
            <Clock3 size={15} />
            CURRENT TIME
          </div>

          <div className="automation-big-time">
            {shortTime}
          </div>

        </aside>

        {/* ===================================================
            CENTRAL CORE
        =================================================== */}

        <main className="automation-core-area">

          <div className="automation-core-label">
            <span />
            AUTOMATION COMMAND CENTER
            <span />
          </div>

          <div
            className={`automation-core-stage ${
              isListening
                ? 'voice-active'
                : ''
            } ${
              isSpeaking
                ? 'speaking-active'
                : ''
            }`}
          >

            <div className="energy-halo halo-one" />
            <div className="energy-halo halo-two" />
            <div className="energy-halo halo-three" />

            <div className="holo-orbit orbit-one" />
            <div className="holo-orbit orbit-two" />
            <div className="holo-orbit orbit-three" />
            <div className="holo-orbit orbit-four" />

            <div className="tilted-orbit tilted-one" />
            <div className="tilted-orbit tilted-two" />

            <div className="energy-strands">
              {Array.from({ length: 42 }).map(
                (_, index) => (
                  <i
                    key={index}
                    style={{
                      '--angle': `${index * 8.57}deg`,
                      '--length': `${
                        120 +
                        (index % 7) * 24
                      }px`,
                      '--delay': `${
                        (index % 12) * 0.08
                      }s`,
                    }}
                  />
                )
              )}
            </div>

            <div className="energy-particles">
              {Array.from({ length: 90 }).map(
                (_, index) => (
                  <i
                    key={index}
                    style={{
                      '--x': `${
                        ((index * 47) % 240) -
                        120
                      }px`,
                      '--y': `${
                        ((index * 73) % 240) -
                        120
                      }px`,
                      '--delay': `${
                        (index % 15) * 0.13
                      }s`,
                      '--size': `${
                        1 + (index % 3)
                      }px`,
                    }}
                  />
                )
              )}
            </div>

            <div className="holographic-sphere">

              <div className="sphere-wireframe wireframe-one" />
              <div className="sphere-wireframe wireframe-two" />
              <div className="sphere-wireframe wireframe-three" />

              <div className="sphere-grid" />

              <div className="sphere-energy-core">

                <div className="energy-core-light" />

                {isListening ? (
                  <Mic size={30} />
                ) : isSpeaking ? (
                  <Volume2 size={30} />
                ) : (
                  <Zap size={30} />
                )}

                <strong>
                  {assistantName || 'NEXUS'}
                </strong>

                <span>
                  {isListening
                    ? 'LISTENING'
                    : isSpeaking
                      ? 'SPEAKING'
                      : 'AUTOMATION'}
                </span>

              </div>
            </div>

            <div className="inner-energy-ring" />

            <div className="energy-node node-one" />
            <div className="energy-node node-two" />
            <div className="energy-node node-three" />
            <div className="energy-node node-four" />

            <div className="automation-core-caption">
              <span />

              {isListening
                ? 'LISTENING FOR COMMAND'
                : isSpeaking
                  ? 'JARVIS SPEAKING'
                  : 'AUTOMATION CORE ONLINE'}
            </div>

          </div>

          {/* =================================================
              COMMAND RESULT
          ================================================= */}

          <div className="automation-response-panel">

            <div className="response-heading">
              <div>
                <Command size={16} />
                COMMAND ACTIVITY
              </div>

              <span
                className={
                  executionStatus ===
                  'COMPLETED'
                    ? 'success'
                    : executionStatus ===
                        'UNKNOWN'
                      ? 'warning'
                      : ''
                }
              >
                {executionStatus}
              </span>
            </div>

            <div className="response-command">
              <small>COMMAND</small>

              <strong>
                {lastCommand ||
                  'Waiting for command...'}
              </strong>
            </div>

            <div className="response-answer">
              <small>
                {assistantName || 'JARVIS'}
              </small>

              <p>{response}</p>

              {executionStatus ===
                'COMPLETED' && (
                <CheckCircle2
                  size={17}
                />
              )}
            </div>

          </div>

          {/* =================================================
              COMMAND COMPOSER
          ================================================= */}

          <form
            className="automation-command-input"
            onSubmit={handleSubmit}
          >

            <button
              type="button"
              className={`automation-mic-button ${
                isListening
                  ? 'active'
                  : ''
              } ${
                isSpeaking
                  ? 'speaking'
                  : ''
              }`}
              onClick={handleVoice}
              title={
                isListening
                  ? 'Stop listening'
                  : isSpeaking
                    ? 'Stop speaking'
                    : 'Voice command'
              }
            >
              {isListening ? (
                <MicOff size={21} />
              ) : isSpeaking ? (
                <Volume2 size={21} />
              ) : (
                <Mic size={21} />
              )}
            </button>

            <input
              value={command}
              onChange={(event) =>
                setCommand(
                  event.target.value
                )
              }
              placeholder={
                isListening
                  ? 'Listening... say "Hey JARVIS, Open YouTube"'
                  : 'Type command... e.g. Hey JARVIS, Open YouTube'
              }
              disabled={isListening}
            />

            {isSpeaking ? (
              <button
                type="button"
                className="automation-send-button stop"
                onClick={stopSpeaking}
                title="Stop speaking"
              >
                <Square size={18} />
              </button>
            ) : (
              <button
                type="submit"
                className="automation-send-button"
                disabled={!command.trim()}
                title="Execute command"
              >
                <Send size={19} />
              </button>
            )}

          </form>

          {/* =================================================
              QUICK COMMANDS
          ================================================= */}

          <div className="automation-quick-commands">

            <span>QUICK COMMANDS</span>

            <button
              type="button"
              onClick={() =>
                runQuickCommand(
                  'Open YouTube'
                )
              }
            >
              <ExternalLink size={14} />
              Open YouTube
            </button>

            <button
              type="button"
              onClick={() =>
                runQuickCommand(
                  'Open Google'
                )
              }
            >
              <ExternalLink size={14} />
              Open Google
            </button>

            <button
              type="button"
              onClick={() =>
                runQuickCommand(
                  'Open Gmail'
                )
              }
            >
              <ExternalLink size={14} />
              Open Gmail
            </button>

            <button
              type="button"
              onClick={() =>
                runQuickCommand(
                  'What time is it'
                )
              }
            >
              <Clock3 size={14} />
              Current Time
            </button>

          </div>

        </main>

        {/* ===================================================
            RIGHT PANEL
        =================================================== */}

        <aside className="automation-side-panel right-panel">

          <div className="automation-panel-label">
            <Activity size={15} />
            AUTOMATION NETWORK
          </div>

          <div className="network-value">
            <strong>
              {lastCommand ? '1' : '0'}
            </strong>

            <span>
              ACTIVE TASKS
            </span>
          </div>

          <div className="network-value">
            <strong>0</strong>

            <span>
              SCHEDULED
            </span>
          </div>

          <div className="network-value">
            <strong>100%</strong>

            <span>
              ENGINE HEALTH
            </span>
          </div>

          <div className="automation-panel-divider" />

          <div className="automation-panel-label">
            <Bell size={15} />
            NEXT EXECUTION
          </div>

          <div className="next-execution">
            <span>
              READY FOR COMMAND
            </span>
          </div>

          <div className="automation-panel-divider" />

          <div className="automation-panel-label">
            <Volume2 size={15} />
            VOICE SYSTEM
          </div>

          <div className="voice-system-status">
            <span
              className={
                isListening
                  ? 'active'
                  : ''
              }
            />

            {isListening
              ? 'LISTENING'
              : isSpeaking
                ? 'SPEAKING'
                : 'READY'}
          </div>

        </aside>

      </div>

      {/* =====================================================
          BOTTOM BAR
      ===================================================== */}

      <footer className="automation-bottom-bar">

        <div>
          <span className="bottom-dot" />
          NEXUS CORE CONNECTED
        </div>

        <div>
          <CalendarClock size={14} />
          AUTOMATION ENGINE v1.0
        </div>

        <div>
          <Settings2 size={14} />
          SECURE EXECUTION
        </div>

      </footer>

    </section>
  )
}

export default Automation