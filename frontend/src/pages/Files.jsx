import { useRef, useState } from 'react'
import mammoth from 'mammoth'
import {
  File,
  FileText,
  Image,
  Music,
  Video,
  Upload,
  FolderOpen,
  X,
  Bot,
  Send,
  Sparkles,
} from 'lucide-react'
import api from '../api/axios'
import './Files.css'

const getFileIcon = (file) => {
  const type = file.type || ''

  if (type.startsWith('image/')) {
    return <Image size={22} />
  }

  if (type.startsWith('video/')) {
    return <Video size={22} />
  }

  if (type.startsWith('audio/')) {
    return <Music size={22} />
  }

  if (
    type.includes('text') ||
    type.includes('pdf') ||
    type.includes('document') ||
    type.includes('word') ||
    type.includes('sheet') ||
    file.name?.toLowerCase().endsWith('.docx')
  ) {
    return <FileText size={22} />
  }

  return <File size={22} />
}

const formatFileSize = (bytes) => {
  if (bytes === 0) return '0 Bytes'

  const units = ['Bytes', 'KB', 'MB', 'GB']

  const index = Math.floor(
    Math.log(bytes) / Math.log(1024)
  )

  return `${(
    bytes / Math.pow(1024, index)
  ).toFixed(2)} ${units[index]}`
}

function Files({
  assistantName = 'JARVIS',
  conversationId = '',
}) {
  const fileInputRef = useRef(null)

  const [files, setFiles] = useState([])
  const [aiMessage, setAiMessage] = useState('')
  const [aiResponse, setAiResponse] = useState('')
  const [isSending, setIsSending] = useState(false)
  const [isReadingFile, setIsReadingFile] =
    useState(false)
  const [error, setError] = useState('')

  const handleChooseFiles = () => {
    fileInputRef.current?.click()
  }

  /*
   * Read selected files.
   *
   * Currently supported:
   * - DOCX -> text extraction using Mammoth
   * - TXT  -> direct text reading
   *
   * Other file types are selected and displayed,
   * but their contents are not extracted yet.
   */
  const handleFilesSelected = async (event) => {
    const selectedFiles = Array.from(
      event.target.files || []
    )

    if (selectedFiles.length === 0) return

    setIsReadingFile(true)
    setError('')

    const processedFiles = []

    for (const file of selectedFiles) {
      let extractedText = ''
      let extractionStatus = 'NOT_READ'

      try {
        const lowerName =
          file.name.toLowerCase()

        /*
         * DOCX READING
         */
        if (lowerName.endsWith('.docx')) {
          const arrayBuffer =
            await file.arrayBuffer()

          const result =
            await mammoth.extractRawText({
              arrayBuffer,
            })

          extractedText =
            result.value?.trim() || ''

          extractionStatus =
            extractedText
              ? 'READ'
              : 'EMPTY'
        }

        /*
         * TXT READING
         */
        else if (
          file.type === 'text/plain' ||
          lowerName.endsWith('.txt')
        ) {
          extractedText =
            await file.text()

          extractedText =
            extractedText.trim()

          extractionStatus =
            extractedText
              ? 'READ'
              : 'EMPTY'
        }

        /*
         * Other file types
         */
        else {
          extractionStatus = 'NOT_SUPPORTED'
        }
      } catch (fileError) {
        console.error(
          `Failed to read ${file.name}:`,
          fileError
        )

        extractionStatus = 'ERROR'
      }

      processedFiles.push({
        file,
        extractedText,
        extractionStatus,
      })
    }

    setFiles((previousFiles) => [
      ...previousFiles,
      ...processedFiles,
    ])

    setIsReadingFile(false)

    // Allow selecting the same file again later.
    event.target.value = ''
  }

  const handleRemoveFile = (indexToRemove) => {
    setFiles((previousFiles) =>
      previousFiles.filter(
        (_, index) => index !== indexToRemove
      )
    )
  }

  /*
   * Ask the user's preferred AI about the
   * selected files.
   *
   * IMPORTANT:
   * The actual extracted DOCX/TXT content is
   * included in the message sent to the backend.
   */
  const handleAskAI = async (
    messageToSend = aiMessage
  ) => {
    const trimmedMessage =
      messageToSend.trim()

    if (!trimmedMessage || isSending) return

    const token =
      localStorage.getItem('nexusToken')

    if (!token) {
      setError(
        `Please login again to use ${assistantName}.`
      )
      return
    }

    if (files.length === 0) {
      setError(
        'Please select a file first.'
      )
      return
    }

    try {
      setIsSending(true)
      setError('')

      let activeConversationId =
        conversationId

      /*
       * Create a conversation if the Files page
       * does not already have one.
       */
      if (!activeConversationId) {
        const conversationResponse =
          await api.post('/conversations', {
            title: 'Files Assistant',
          })

        activeConversationId =
          conversationResponse?.data?.data?.id
      }

      if (!activeConversationId) {
        throw new Error(
          'Conversation could not be created.'
        )
      }

      /*
       * Build the actual file context.
       *
       * This sends:
       * - file name
       * - file size
       * - extracted DOCX/TXT text
       *
       * Therefore the AI can actually read
       * the resume content.
       */
      const fileContext = files
        .map(({ file, extractedText }) => {
          if (extractedText) {
            return `
--- FILE: ${file.name} ---
${extractedText}
--- END FILE ---
`
          }

          return `
--- FILE: ${file.name} ---
File selected, but its content could not be extracted yet.
--- END FILE ---
`
        })
        .join('\n')

      /*
       * Final message sent to backend.
       */
      const finalMessage = `
User question:
${trimmedMessage}

The user selected the following files.
Use the file content below to answer the user's question.

${fileContext}
`

      const response = await api.post(
        '/chat',
        {
          conversationId:
            activeConversationId,

          message: finalMessage,

          assistantName,
        }
      )

      const data =
        response?.data?.data

      setAiResponse(
        data?.aiResponse ||
          `No response received from ${assistantName}.`
      )

      setAiMessage('')
    } catch (requestError) {
      console.error(
        'Files AI request failed:',
        requestError
      )

      setError(
        requestError.response?.data?.message ||
          `${assistantName} could not process that request.`
      )
    } finally {
      setIsSending(false)
    }
  }

  return (
    <section className="files-page">
      {/* =====================================================
          FILES HEADER
      ===================================================== */}

      <div className="files-header">
        <div>
          <span className="eyebrow">
            NEXUS FILE SYSTEM
          </span>

          <h1>Files</h1>

          <p>
            Select files from your computer and
            interact with {assistantName}.
          </p>
        </div>

        <button
          className="files-upload-button"
          onClick={handleChooseFiles}
          disabled={isReadingFile}
        >
          <Upload size={18} />

          {isReadingFile
            ? 'Reading...'
            : 'Select Files'}
        </button>
      </div>

      {/* =====================================================
          HIDDEN FILE INPUT
      ===================================================== */}

      <input
        ref={fileInputRef}
        type="file"
        multiple
        onChange={handleFilesSelected}
        style={{ display: 'none' }}
      />

      {/* =====================================================
          MAIN FILE + AI LAYOUT
      ===================================================== */}

      <div className="files-content-grid">
        {/* ===================================================
            FILE PANEL
        =================================================== */}

        <div className="files-main-panel">
          <div
            className="files-drop-zone"
            onClick={handleChooseFiles}
          >
            <div className="files-drop-icon">
              <FolderOpen size={32} />
            </div>

            <h2>
              Choose files from your computer
            </h2>

            <p>
              Click here to open your Windows
              file picker and select one or
              more files.
            </p>

            <button
              type="button"
              className="files-select-button"
              onClick={(event) => {
                event.stopPropagation()
                handleChooseFiles()
              }}
              disabled={isReadingFile}
            >
              <FolderOpen size={18} />

              {isReadingFile
                ? 'Reading File...'
                : 'Browse Files'}
            </button>
          </div>

          {/* =================================================
              SELECTED FILES
          ================================================= */}

          <div className="selected-files-section">
            <div className="selected-files-header">
              <div>
                <span className="files-section-label">
                  LOCAL FILES
                </span>

                <h2>Selected Files</h2>
              </div>

              <span className="file-count">
                {files.length}{' '}
                {files.length === 1
                  ? 'file'
                  : 'files'}
              </span>
            </div>

            {files.length === 0 ? (
              <div className="empty-files">
                <File size={30} />

                <h3>No files selected</h3>

                <p>
                  Choose files from your PC
                  to make them available to
                  this session.
                </p>
              </div>
            ) : (
              <div className="files-list">
                {files.map(
                  (
                    {
                      file,
                      extractedText,
                      extractionStatus,
                    },
                    index
                  ) => (
                    <div
                      className="file-item"
                      key={`${file.name}-${index}`}
                    >
                      <div className="file-icon">
                        {getFileIcon(file)}
                      </div>

                      <div className="file-details">
                        <strong>
                          {file.name}
                        </strong>

                        <small>
                          {formatFileSize(
                            file.size
                          )}

                          {' • '}

                          {file.type ||
                            'Unknown type'}

                          {' • '}

                          {extractionStatus ===
                          'READ'
                            ? 'CONTENT READ'
                            : extractionStatus ===
                                'NOT_SUPPORTED'
                              ? 'CONTENT NOT READ'
                              : extractionStatus ===
                                  'EMPTY'
                                ? 'EMPTY FILE'
                                : 'READING ISSUE'}
                        </small>
                      </div>

                      <button
                        className="file-remove-button"
                        onClick={() =>
                          handleRemoveFile(
                            index
                          )
                        }
                        title="Remove file"
                      >
                        <X size={18} />
                      </button>
                    </div>
                  )
                )}
              </div>
            )}
          </div>
        </div>

        {/* ===================================================
            AI FILE ASSISTANT PANEL
        =================================================== */}

        <aside className="files-ai-panel">
          <div className="files-ai-header">
            <div className="files-ai-icon">
              <Bot size={22} />
            </div>

            <div>
              <span>
                AI FILE ASSISTANT
              </span>

              <strong>
                {assistantName}
              </strong>
            </div>

            <span className="ai-online-dot" />
          </div>

          <div className="files-ai-body">
            {!aiResponse ? (
              <div className="files-ai-welcome">
                <Sparkles size={30} />

                <h3>
                  Ask {assistantName}
                </h3>

                <p>
                  Select a DOCX resume or
                  other supported file and
                  ask {assistantName} what you
                  want to know.
                </p>
              </div>
            ) : (
              <div className="files-ai-response">
                <div className="ai-response-label">
                  <Bot size={15} />

                  {assistantName}
                </div>

                <p>{aiResponse}</p>
              </div>
            )}
          </div>

          {error && (
            <div className="files-ai-error">
              {error}
            </div>
          )}

          {files.length > 0 && (
            <div className="files-ai-context">
              <span>
                FILE CONTEXT
              </span>

              <strong>
                {files.length}{' '}
                {files.length === 1
                  ? 'file'
                  : 'files'}{' '}
                selected
              </strong>
            </div>
          )}

          <div className="files-ai-composer">
            <input
              type="text"
              placeholder={`Ask ${assistantName} about your files...`}
              value={aiMessage}
              onChange={(event) =>
                setAiMessage(
                  event.target.value
                )
              }
              onKeyDown={(event) => {
                if (event.key === 'Enter') {
                  event.preventDefault()
                  handleAskAI()
                }
              }}
              disabled={
                isSending ||
                isReadingFile
              }
            />

            <button
              onClick={() =>
                handleAskAI()
              }
              disabled={
                isSending ||
                isReadingFile ||
                !aiMessage.trim() ||
                files.length === 0
              }
              title={`Ask ${assistantName}`}
            >
              <Send size={18} />
            </button>
          </div>
        </aside>
      </div>
    </section>
  )
}

export default Files