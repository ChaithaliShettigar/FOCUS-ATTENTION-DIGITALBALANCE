import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { Trash2 } from 'lucide-react'
import { toast } from 'react-hot-toast'
import { DoodleBackground } from '../components/DoodleBackground'
import { useFocusStore } from '../store/useFocusStore'

export const Learn = () => {
  const addContent = useFocusStore((s) => s.addContent)
  const contents = useFocusStore((s) => s.contents)
  const removeContent = useFocusStore((s) => s.removeContent)
  const startSession = useFocusStore((s) => s.startSession)
  const endSession = useFocusStore((s) => s.endSession)
  const setCurrentSession = useFocusStore((s) => s.setCurrentSession)
  const isAuthenticated = useFocusStore((s) => s.isAuthenticated)

  const [targetMinutes, setTargetMinutes] = useState(25)
  const [selectedContent, setSelectedContent] = useState(null)
  const [codeTitle, setCodeTitle] = useState('')
  const [codeNotes, setCodeNotes] = useState('')

  const handlePdf = (e) => {
    if (!isAuthenticated) {
      toast.error('Sign up or login to upload PDFs.')
      return
    }
    const file = e.target.files?.[0]
    if (!file) return
    const url = URL.createObjectURL(file)
    addContent({ title: file.name, type: 'pdf', url })
    toast.success('PDF added. Start learning with a timer!')
  }

  const handleYoutube = (e) => {
    e.preventDefault()
    if (!isAuthenticated) {
      toast.error('Sign up or login to add YouTube links.')
      return
    }
    const link = e.target.youtube.value.trim()
    if (!link) return
    addContent({ title: link, type: 'youtube', url: link })
    e.target.reset()
    toast.success('YouTube link saved. Set a timer before you watch.')
  }

  const handleCode = (e) => {
    e.preventDefault()
    if (!isAuthenticated) {
      toast.error('Sign up or login to save coding study cards.')
      return
    }
    if (!codeTitle.trim()) return
    addContent({ title: codeTitle, type: 'code', notes: codeNotes })
    setCodeTitle('')
    setCodeNotes('')
    toast.success('Code practice saved. Start with a timer to track focus.')
  }

  const startFocus = (content) => {
    if (!isAuthenticated) {
      toast.error('Sign up or login to start a focus session.')
      return
    }
    if (!targetMinutes || targetMinutes <= 0) {
      toast.error('Set a target time to start.')
      return
    }
    const id = startSession({ contentId: content.id, targetMinutes })
    setCurrentSession(id)
    setSelectedContent(content)
    toast.success('Timer started. Stay active to grow your focus score.')
  }

  const stopFocus = () => {
    const currentId = useFocusStore.getState().currentSessionId
    if (currentId) endSession(currentId, 'completed')
    setSelectedContent(null)
    toast('Session ended. Check analytics for insights.', { icon: '📊' })
  }

  const deleteMaterial = (content) => {
    const confirmed = window.confirm(`Remove "${content.title}" from your materials?`)
    if (!confirmed) return
    try {
      if (content.type === 'pdf' && typeof content.url === 'string' && content.url.startsWith('blob:')) {
        try { URL.revokeObjectURL(content.url) } catch {}
      }
      // If the item being deleted is currently opened, close it
      if (selectedContent && selectedContent.id === content.id) {
        setSelectedContent(null)
      }
      removeContent(content.id)
      toast.success('Removed from your materials.')
    } catch {
      toast.error('Could not remove this item.')
    }
  }

  const embedUrl = useMemo(() => {
    if (!selectedContent) return ''
    if (selectedContent.type === 'youtube') {
      const id = selectedContent.url.split('v=')[1]?.split('&')[0] || selectedContent.url.split('/').pop()
      return `https://www.youtube.com/embed/${id}`
    }
    return selectedContent.url
  }, [selectedContent])

  return (
    <DoodleBackground>
      <div className="flex flex-col gap-6">
        <div>
          <h2 className="text-3xl font-bold text-ink">Learning library</h2>
          <p className="text-ink/70">Upload your PDFs or add YouTube links. Focus sessions always need a target timer.</p>
        </div>

        {!isAuthenticated && (
          <div className="rounded-3xl bg-clay/60 p-5 text-ink/80 shadow-soft">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm">Sign up or login to add materials and start focus sessions.</p>
              </div>
              <Link to="/auth" className="rounded-full bg-ink px-4 py-2 text-sm font-semibold text-sand">Go to Auth</Link>
            </div>
          </div>
        )}
        <div className="grid gap-4 md:grid-cols-3">
          <div className="rounded-3xl bg-white/85 p-5 shadow-soft">
            <h3 className="text-lg font-semibold text-ink">Upload PDF</h3>
            <p className="text-sm text-ink/70">Files stay local to this browser session.</p>
            <input
              type="file"
              accept="application/pdf"
              onChange={handlePdf}
              className="mt-3 w-full rounded-2xl border border-ink/10 bg-white px-3 py-2 text-sm"
              disabled={!isAuthenticated}
            />
          </div>
          <form onSubmit={handleYoutube} className="rounded-3xl bg-white/85 p-5 shadow-soft">
            <h3 className="text-lg font-semibold text-ink">Add YouTube link</h3>
            <p className="text-sm text-ink/70">Videos open inside FocusUp so focus tracking works.</p>
            <div className="mt-3 flex flex-col gap-2">
              <input
                name="youtube"
                placeholder="https://youtube.com/watch?v=..."
                className="w-full rounded-2xl border border-ink/10 bg-white px-3 py-2 text-sm"
                disabled={!isAuthenticated}
              />
              <button className={`self-start rounded-full px-4 py-2 text-sm font-semibold text-sand shadow-soft ${!isAuthenticated ? 'bg-ink/50 cursor-not-allowed' : 'bg-ink'}`} disabled={!isAuthenticated}>
                Save link
              </button>
            </div>
          </form>
          <form onSubmit={handleCode} className="rounded-3xl bg-white/85 p-5 shadow-soft">
            <h3 className="text-lg font-semibold text-ink">Coding study</h3>
            <p className="text-sm text-ink/70">Track focused coding with notes or a snippet.</p>
            <div className="mt-3 flex flex-col gap-2">
              <input
                value={codeTitle}
                onChange={(e) => setCodeTitle(e.target.value)}
                placeholder="Topic or challenge"
                className="w-full rounded-2xl border border-ink/10 bg-white px-3 py-2 text-sm"
                disabled={!isAuthenticated}
              />
              <textarea
                value={codeNotes}
                onChange={(e) => setCodeNotes(e.target.value)}
                placeholder="Notes, snippet, or TODOs"
                className="h-24 w-full rounded-2xl border border-ink/10 bg-white px-3 py-2 text-sm font-mono"
                disabled={!isAuthenticated}
              />
              <button className={`self-start rounded-full px-4 py-2 text-sm font-semibold text-sand shadow-soft ${!isAuthenticated ? 'bg-ink/50 cursor-not-allowed' : 'bg-ink'}`} disabled={!isAuthenticated}>
                Save coding card
              </button>
            </div>
          </form>
        </div>

        <div className="rounded-3xl bg-white/80 p-5 shadow-soft">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <h3 className="text-lg font-semibold text-ink">Your materials</h3>
              <p className="text-sm text-ink/70">Everything starts empty. Add items above to begin.</p>
            </div>
            <div className="flex items-center gap-3">
              <label className="text-sm text-ink/70">Target (minutes)</label>
              <input
                type="number"
                min={5}
                value={targetMinutes}
                onChange={(e) => setTargetMinutes(Number(e.target.value))}
                className="w-24 rounded-2xl border border-ink/10 px-3 py-2 text-sm"
              />
            </div>
          </div>
          {contents.length === 0 ? (
            <div className="mt-4 rounded-2xl bg-clay/60 p-4 text-sm text-ink/70">
              No content yet. Upload a PDF or add a YouTube link to start your first focus session.
            </div>
          ) : (
            <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {contents.map((c) => (
                <div key={c.id} className="rounded-2xl border border-ink/10 bg-white p-4 shadow-sm">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="text-sm font-semibold text-ink">{c.title}</p>
                      <p className="text-xs text-ink/60">{c.type}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="rounded-full bg-clay px-3 py-1 text-xs font-semibold text-ink">Timer required</span>
                      <button
                        aria-label="Delete material"
                        title="Delete"
                        onClick={() => deleteMaterial(c)}
                        className="rounded-full border border-red-200 bg-red-50 p-2 text-red-700 hover:bg-red-100"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                  <button
                    onClick={() => startFocus(c)}
                    className={`mt-3 w-full rounded-full px-4 py-2 text-sm font-semibold text-sand shadow-soft ${!isAuthenticated ? 'bg-ink/50 cursor-not-allowed' : 'bg-ink'}`}
                    disabled={!isAuthenticated}
                  >
                    Open & start focus
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {selectedContent && (
          <div className="rounded-3xl bg-white/90 p-5 shadow-soft">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-ink/60">Learning now</p>
                <h3 className="text-xl font-semibold text-ink">{selectedContent.title}</h3>
              </div>
              <button
                onClick={stopFocus}
                className="rounded-full border border-ink/10 px-4 py-2 text-sm font-semibold text-ink"
              >
                End session
              </button>
            </div>
            <div className="mt-4 overflow-hidden rounded-2xl border border-ink/10 bg-sand shadow-inner">
              {selectedContent.type === 'youtube' ? (
                <iframe
                  title="YouTube"
                  src={embedUrl}
                  className="aspect-video w-full"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                />
              ) : selectedContent.type === 'code' ? (
                <textarea
                  value={selectedContent.notes || ''}
                  readOnly
                  className="h-[520px] w-full bg-ink/5 p-4 font-mono text-sm text-ink"
                  aria-label="Code notes"
                />
              ) : (
                <embed src={embedUrl} type="application/pdf" className="h-[520px] w-full" />
              )}
            </div>
          </div>
        )}
      </div>
    </DoodleBackground>
  )
}
