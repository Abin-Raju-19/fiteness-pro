import { useState, useEffect, useRef } from 'react'
import { api } from '../api/client'
import { useAuth } from '../auth/AuthContext'

export default function Messages() {
  const { user } = useAuth()
  const [contacts, setContacts] = useState([])
  const [activeContact, setActiveContact] = useState(null)
  const [messages, setMessages] = useState([])
  const [newMessage, setNewMessage] = useState('')
  const [loading, setLoading] = useState(true)
  const messagesEndRef = useRef(null)

  const loadContacts = async () => {
    try {
      const data = await api.get('/messages/contacts')
      setContacts(data.contacts)
      if (data.contacts.length > 0 && !activeContact) {
        setActiveContact(data.contacts[0])
      }
    } catch (err) {
      console.error('Failed to load contacts', err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadContacts()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  useEffect(() => {
    if (activeContact) {
      loadMessages(activeContact._id)
      const interval = setInterval(() => loadMessages(activeContact._id), 3000)
      return () => clearInterval(interval)
    }
  }, [activeContact])

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  const loadMessages = async (contactId) => {
    try {
      const data = await api.get(`/messages/${contactId}`)
      setMessages(data.messages)
    } catch (err) {
      console.error('Failed to load messages', err)
    }
  }

  const sendMessage = async (e) => {
    e.preventDefault()
    if (!newMessage.trim() || !activeContact) return

    const content = newMessage
    setNewMessage('') // Optimistic clear

    try {
      await api.post('/messages', {
        recipientId: activeContact._id,
        content
      })
      loadMessages(activeContact._id)
    } catch (err) {
      console.error('Failed to send message', err)
      setNewMessage(content) // Restore on error
    }
  }

  if (loading) return <div className="p-8 text-center text-slate-400">Loading messages...</div>

  return (
    <div className="min-h-screen bg-slate-950 px-4 py-8 text-slate-50">
      <div className="mx-auto flex h-[80vh] max-w-5xl flex-col overflow-hidden rounded-2xl border border-slate-800 bg-slate-900/50 shadow-xl md:flex-row">
        {/* Sidebar */}
        <div className="w-full border-b border-slate-800 bg-slate-900/80 md:w-1/3 md:border-b-0 md:border-r">
          <div className="p-4">
            <h2 className="text-lg font-semibold">Messages</h2>
            <p className="text-xs text-slate-400">Chat with trainers & admins</p>
          </div>
          <div className="flex h-full flex-col overflow-y-auto pb-4">
            {contacts.length === 0 ? (
              <p className="p-4 text-xs text-slate-500">No contacts available.</p>
            ) : (
              contacts.map((contact) => (
                <button
                  key={contact._id}
                  onClick={() => setActiveContact(contact)}
                  className={`flex items-center gap-3 border-l-2 px-4 py-3 text-left transition hover:bg-slate-800 ${
                    activeContact?._id === contact._id
                      ? 'border-sky-500 bg-slate-800'
                      : 'border-transparent'
                  }`}
                >
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-slate-700 text-xs font-bold uppercase text-slate-300">
                    {contact.name.charAt(0)}
                  </div>
                  <div>
                    <p className="text-sm font-medium text-slate-200">{contact.name}</p>
                    <p className="text-[10px] uppercase tracking-wider text-slate-500">
                      {contact.role}
                    </p>
                  </div>
                </button>
              ))
            )}
          </div>
        </div>

        {/* Chat Area */}
        <div className="flex flex-1 flex-col bg-slate-950/30">
          {activeContact ? (
            <>
              <div className="border-b border-slate-800 bg-slate-900/50 p-4">
                <p className="text-sm font-medium text-slate-200">
                  Chatting with <span className="text-sky-400">{activeContact.name}</span>
                </p>
              </div>

              <div className="flex-1 overflow-y-auto p-4 space-y-4">
                {messages.length === 0 ? (
                  <p className="text-center text-xs text-slate-500 mt-10">
                    No messages yet. Say hello!
                  </p>
                ) : (
                  messages.map((msg) => {
                    const isMe = msg.sender === user.id
                    return (
                      <div
                        key={msg._id}
                        className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}
                      >
                        <div
                          className={`max-w-[70%] rounded-2xl px-4 py-2 text-sm ${
                            isMe
                              ? 'bg-sky-600 text-white rounded-tr-sm'
                              : 'bg-slate-800 text-slate-200 rounded-tl-sm'
                          }`}
                        >
                          <p>{msg.content}</p>
                          <p className={`mt-1 text-[10px] ${isMe ? 'text-sky-200' : 'text-slate-500'}`}>
                            {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </p>
                        </div>
                      </div>
                    )
                  })
                )}
                <div ref={messagesEndRef} />
              </div>

              <form onSubmit={sendMessage} className="border-t border-slate-800 bg-slate-900/50 p-4">
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    placeholder="Type your message..."
                    className="flex-1 rounded-full border border-slate-700 bg-slate-950 px-4 py-2 text-sm text-slate-100 placeholder-slate-500 focus:border-sky-500 focus:outline-none focus:ring-1 focus:ring-sky-500"
                  />
                  <button
                    type="submit"
                    disabled={!newMessage.trim()}
                    className="rounded-full bg-sky-500 px-4 py-2 text-sm font-semibold text-white transition hover:bg-sky-400 disabled:opacity-50"
                  >
                    Send
                  </button>
                </div>
              </form>
            </>
          ) : (
            <div className="flex flex-1 items-center justify-center text-slate-500">
              Select a contact to start chatting
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
