import { useState } from 'react'
import { Link } from 'react-router-dom'
import { DoodleBackground } from '../components/DoodleBackground'
import { useFocusStore } from '../store/useFocusStore'
import { toast } from 'react-hot-toast'

export const Groups = () => {
  const addGroup = useFocusStore((s) => s.addGroup)
  const groups = useFocusStore((s) => s.groups)
  const contents = useFocusStore((s) => s.contents)
  const joinGroup = useFocusStore((s) => s.joinGroup)
  const addResource = useFocusStore((s) => s.addResourceToGroup)
  const user = useFocusStore((s) => s.user)
  const isAuthenticated = useFocusStore((s) => s.isAuthenticated)

  const [groupName, setGroupName] = useState('')
  const [invite, setInvite] = useState('')
  const [selectedShare, setSelectedShare] = useState({ groupId: '', contentId: '' })

  const handleCreate = (e) => {
    e.preventDefault()
    if (!isAuthenticated) {
      toast.error('Sign up or login to create groups.')
      return
    }
    if (!groupName.trim()) return
    addGroup({ name: groupName, code: Math.random().toString(36).slice(2, 6).toUpperCase() })
    setGroupName('')
    toast.success('Group created. Share the code to invite!')
  }

  const handleJoin = (e) => {
    e.preventDefault()
    if (!isAuthenticated) {
      toast.error('Sign up or login to join groups.')
      return
    }
    const group = groups.find((g) => g.code === invite.trim().toUpperCase())
    if (!group) {
      toast.error('Group not found')
      return
    }
    joinGroup(group.id, user.name || 'You')
    setInvite('')
    toast.success('Joined group. Share resources to study together.')
  }

  const handleShare = (e) => {
    e.preventDefault()
    const { groupId, contentId } = selectedShare
    if (!groupId || !contentId) return
    const content = contents.find((c) => c.id === contentId)
    if (!content) return
    addResource(groupId, {
      ...content,
      kind: content.type,
      title: content.title,
      url: content.url,
    })
    toast.success('Shared to group')
    setSelectedShare({ groupId: '', contentId: '' })
  }

  return (
    <DoodleBackground>
      <div className="flex flex-col gap-6">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h2 className="text-3xl font-bold text-ink">Group learning</h2>
            <p className="text-ink/70">Create or join groups. Everyone can share PDFs and YouTube links inside FocusUp.</p>
          </div>
        </div>

        {!isAuthenticated && (
          <div className="rounded-3xl bg-clay/60 p-5 text-ink/80 shadow-soft">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm">Sign up or login to create and join groups.</p>
              </div>
              <Link to="/auth" className="rounded-full bg-ink px-4 py-2 text-sm font-semibold text-sand">Go to Auth</Link>
            </div>
          </div>
        )}

        <div className="grid gap-4 md:grid-cols-2">
          <form onSubmit={handleCreate} className="rounded-3xl bg-white/80 p-5 shadow-soft">
            <h3 className="text-lg font-semibold text-ink">Create group</h3>
            <input
              value={groupName}
              onChange={(e) => setGroupName(e.target.value)}
              placeholder="Group name"
              className="mt-3 w-full rounded-2xl border border-ink/10 px-3 py-2 text-sm"
              disabled={!isAuthenticated}
            />
            <button className={`mt-3 rounded-full px-4 py-2 text-sm font-semibold text-sand shadow-soft ${!isAuthenticated ? 'bg-ink/50 cursor-not-allowed' : 'bg-ink'}`} disabled={!isAuthenticated}>
              Create
            </button>
          </form>

          <form onSubmit={handleJoin} className="rounded-3xl bg-white/80 p-5 shadow-soft">
            <h3 className="text-lg font-semibold text-ink">Join by code</h3>
            <input
              value={invite}
              onChange={(e) => setInvite(e.target.value.toUpperCase())}
              placeholder="CODE"
              className="mt-3 w-full rounded-2xl border border-ink/10 px-3 py-2 text-sm uppercase"
              disabled={!isAuthenticated}
            />
            <button className={`mt-3 rounded-full px-4 py-2 text-sm font-semibold text-sand shadow-soft ${!isAuthenticated ? 'bg-ink/50 cursor-not-allowed' : 'bg-ink'}`} disabled={!isAuthenticated}>
              Join
            </button>
          </form>
        </div>

        <div className="rounded-3xl bg-white/80 p-5 shadow-soft">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <h3 className="text-lg font-semibold text-ink">Share resources to a group</h3>
              <p className="text-sm text-ink/70">Select one of your uploads and send it to a group.</p>
            </div>
          </div>
          <form onSubmit={handleShare} className="mt-3 grid gap-3 md:grid-cols-3">
            <select
              value={selectedShare.groupId}
              onChange={(e) => setSelectedShare((p) => ({ ...p, groupId: e.target.value }))}
              className="rounded-2xl border border-ink/10 px-3 py-2 text-sm"
            >
              <option value="">Choose group</option>
              {groups.map((g) => (
                <option key={g.id} value={g.id}>
                  {g.name} ({g.code})
                </option>
              ))}
            </select>
            <select
              value={selectedShare.contentId}
              onChange={(e) => setSelectedShare((p) => ({ ...p, contentId: e.target.value }))}
              className="rounded-2xl border border-ink/10 px-3 py-2 text-sm"
            >
              <option value="">Choose content</option>
              {contents.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.title}
                </option>
              ))}
            </select>
            <button className="rounded-full bg-ink px-4 py-2 text-sm font-semibold text-sand shadow-soft">
              Share
            </button>
          </form>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          {groups.length === 0 ? (
            <div className="rounded-3xl bg-clay/60 p-5 text-ink/70 shadow-soft">
              No groups yet. Create one and invite peers using the code.
            </div>
          ) : (
            groups.map((g) => (
              <div key={g.id} className="rounded-3xl bg-white/80 p-5 shadow-soft">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="text-lg font-semibold text-ink">{g.name}</h4>
                    <p className="text-xs text-ink/60">Code: {g.code}</p>
                    <p className="text-sm text-ink/70">Members: {g.members.length || 1} (you + peers)</p>
                  </div>
                  <span className="rounded-full bg-clay px-3 py-1 text-xs font-semibold text-ink">Leaderboard</span>
                </div>
                <div className="mt-3 space-y-2">
                  {(g.leaderboard || []).length === 0 ? (
                    <p className="text-sm text-ink/70">No scores yet. Finish a session to appear here.</p>
                  ) : (
                    g.leaderboard.map((row) => (
                      <div key={row.name} className="flex items-center justify-between rounded-xl bg-sand px-3 py-2 text-sm">
                        <span>{row.name}</span>
                        <span className="font-semibold">{row.score}</span>
                      </div>
                    ))
                  )}
                </div>
                <div className="mt-3 rounded-2xl bg-sand/60 p-3">
                  <p className="text-sm font-semibold text-ink">Shared resources</p>
                  {(g.resources || []).length === 0 ? (
                    <p className="text-xs text-ink/60">Nothing shared yet.</p>
                  ) : (
                    <ul className="mt-2 space-y-2 text-sm">
                      {g.resources.map((r) => (
                        <li key={r.id} className="rounded-xl bg-white px-3 py-2 shadow-sm">
                          {r.title}
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </DoodleBackground>
  )
}
