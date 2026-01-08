import { useState, useEffect } from 'react'
import { DoodleBackground } from '../components/DoodleBackground'
import { groupAPI } from '../services/api'
import { toast } from 'react-hot-toast'
import { Users, Copy, Plus, LogOut, Trash2 } from 'lucide-react'

export const Groups = () => {
  const [groups, setGroups] = useState([])
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [showJoinModal, setShowJoinModal] = useState(false)
  const [groupName, setGroupName] = useState('')
  const [groupCode, setGroupCode] = useState('')
  const [loading, setLoading] = useState(false)
  const [selectedGroupForDetails, setSelectedGroupForDetails] = useState(null)
  const [showGroupDetails, setShowGroupDetails] = useState(false)

  useEffect(() => {
    fetchUserGroups()
  }, [])

  const fetchUserGroups = async () => {
    setLoading(true)
    try {
      const response = await groupAPI.getUserGroups()
      if (response.success) {
        setGroups(response.groups || [])
      }
    } catch (error) {
      console.error('Fetch groups error:', error)
      toast.error('Failed to load groups')
    } finally {
      setLoading(false)
    }
  }

  const handleCreateGroup = async (e) => {
    e.preventDefault()
    if (!groupName.trim()) {
      toast.error('Please enter a group name')
      return
    }

    setLoading(true)
    try {
      const response = await groupAPI.createGroup({ name: groupName })
      if (response.success) {
        toast.success('Group created successfully!')
        setGroups([...groups, response.group])
        setGroupName('')
        setShowCreateModal(false)
      }
    } catch (error) {
      console.error('Create group error:', error)
      toast.error(error.message || 'Failed to create group')
    } finally {
      setLoading(false)
    }
  }

  const handleJoinGroup = async (e) => {
    e.preventDefault()
    if (!groupCode.trim()) {
      toast.error('Please enter a group code')
      return
    }

    setLoading(true)
    try {
      const response = await groupAPI.joinGroup({ code: groupCode })
      if (response.success) {
        toast.success('Joined group successfully!')
        setGroups([...groups, response.group])
        setGroupCode('')
        setShowJoinModal(false)
      }
    } catch (error) {
      console.error('Join group error:', error)
      toast.error(error.message || 'Failed to join group')
    } finally {
      setLoading(false)
    }
  }

  const handleLeaveGroup = async (groupId) => {
    if (!window.confirm('Are you sure you want to leave this group?')) return

    setLoading(true)
    try {
      const response = await groupAPI.leaveGroup(groupId)
      if (response.success) {
        toast.success('Left the group')
        setGroups(groups.filter(g => g._id !== groupId))
        setShowGroupDetails(false)
      }
    } catch (error) {
      console.error('Leave group error:', error)
      toast.error(error.message || 'Failed to leave group')
    } finally {
      setLoading(false)
    }
  }

  const handleDeleteGroup = async (groupId) => {
    if (!window.confirm('Are you sure you want to delete this group? This action cannot be undone.')) return

    setLoading(true)
    try {
      const response = await groupAPI.deleteGroup(groupId)
      if (response.success) {
        toast.success('Group deleted')
        setGroups(groups.filter(g => g._id !== groupId))
        setShowGroupDetails(false)
      }
    } catch (error) {
      console.error('Delete group error:', error)
      toast.error(error.message || 'Failed to delete group')
    } finally {
      setLoading(false)
    }
  }

  const copyToClipboard = (code) => {
    navigator.clipboard.writeText(code)
    toast.success('Group code copied!')
  }

  const openGroupDetails = async (group) => {
    setSelectedGroupForDetails(group)
    setShowGroupDetails(true)
  }

  return (
    <DoodleBackground>
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-4xl font-bold text-ink">My Groups</h2>
            <p className="mt-2 text-ink/70">Create groups or join existing ones to collaborate with others</p>
          </div>
          <div className="flex gap-3">
            <button
              onClick={() => setShowCreateModal(true)}
              className="rounded-full bg-gradient-to-r from-teal to-teal-dark px-6 py-3 font-semibold text-white hover:shadow-lg transition-all flex items-center gap-2"
            >
              <Plus size={20} /> Create Group
            </button>
            <button
              onClick={() => setShowJoinModal(true)}
              className="rounded-full border-2 border-teal px-6 py-3 font-semibold text-teal hover:bg-teal/5 transition-all flex items-center gap-2"
            >
              <Users size={20} /> Join Group
            </button>
          </div>
        </div>

        {/* Create Group Modal */}
        {showCreateModal && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-3xl p-8 max-w-md w-full shadow-xl">
              <h3 className="text-2xl font-bold text-ink mb-6">Create New Group</h3>
              <form onSubmit={handleCreateGroup} className="space-y-4">
                <div>
                  <label className="block text-sm font-semibold text-ink/70 mb-2">Group Name</label>
                  <input
                    type="text"
                    value={groupName}
                    onChange={(e) => setGroupName(e.target.value)}
                    placeholder="Enter group name..."
                    className="w-full px-4 py-3 rounded-2xl border border-ink/10 bg-white focus:border-teal focus:outline-none text-ink"
                  />
                </div>
                <div className="flex gap-3 pt-4">
                  <button
                    type="button"
                    onClick={() => setShowCreateModal(false)}
                    className="flex-1 rounded-full border border-ink/20 px-4 py-3 font-semibold text-ink hover:bg-ink/5 transition-all"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={loading}
                    className="flex-1 rounded-full bg-gradient-to-r from-teal to-teal-dark px-4 py-3 font-semibold text-white hover:shadow-lg transition-all disabled:opacity-50"
                  >
                    {loading ? 'Creating...' : 'Create'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Join Group Modal */}
        {showJoinModal && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-3xl p-8 max-w-md w-full shadow-xl">
              <h3 className="text-2xl font-bold text-ink mb-6">Join Group</h3>
              <form onSubmit={handleJoinGroup} className="space-y-4">
                <div>
                  <label className="block text-sm font-semibold text-ink/70 mb-2">Group Code</label>
                  <input
                    type="text"
                    value={groupCode}
                    onChange={(e) => setGroupCode(e.target.value.toUpperCase())}
                    placeholder="Enter group code..."
                    maxLength="8"
                    className="w-full px-4 py-3 rounded-2xl border border-ink/10 bg-white focus:border-teal focus:outline-none text-ink uppercase tracking-widest"
                  />
                </div>
                <div className="flex gap-3 pt-4">
                  <button
                    type="button"
                    onClick={() => setShowJoinModal(false)}
                    className="flex-1 rounded-full border border-ink/20 px-4 py-3 font-semibold text-ink hover:bg-ink/5 transition-all"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={loading}
                    className="flex-1 rounded-full bg-gradient-to-r from-teal to-teal-dark px-4 py-3 font-semibold text-white hover:shadow-lg transition-all disabled:opacity-50"
                  >
                    {loading ? 'Joining...' : 'Join'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Group Details Modal */}
        {showGroupDetails && selectedGroupForDetails && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-3xl p-8 max-w-2xl w-full shadow-xl max-h-96 overflow-y-auto">
              <div className="flex items-start justify-between mb-6">
                <div>
                  <h3 className="text-2xl font-bold text-ink">{selectedGroupForDetails.name}</h3>
                  <p className="text-sm text-ink/60 mt-1">Created {new Date(selectedGroupForDetails.createdAt).toLocaleDateString()}</p>
                </div>
                <button
                  onClick={() => setShowGroupDetails(false)}
                  className="text-ink/50 hover:text-ink text-2xl"
                >
                  ✕
                </button>
              </div>

              <div className="space-y-6">
                {/* Group Code */}
                <div className="rounded-2xl bg-sand/50 p-4">
                  <p className="text-sm text-ink/60 uppercase tracking-wider mb-2">Group Code</p>
                  <div className="flex items-center gap-2">
                    <code className="flex-1 font-bold text-ink text-lg tracking-widest">{selectedGroupForDetails.code}</code>
                    <button
                      onClick={() => copyToClipboard(selectedGroupForDetails.code)}
                      className="p-2 hover:bg-white rounded-lg transition-all"
                    >
                      <Copy size={18} className="text-teal" />
                    </button>
                  </div>
                </div>

                {/* Members */}
                <div>
                  <p className="text-sm text-ink/60 uppercase tracking-wider mb-3">Members ({selectedGroupForDetails.members?.length || 0})</p>
                  <div className="space-y-2 max-h-40 overflow-y-auto">
                    {selectedGroupForDetails.members && selectedGroupForDetails.members.length > 0 ? (
                      selectedGroupForDetails.members.map((member) => {
                        const userData = member.userId || member
                        return (
                          <div key={member._id || userData._id} className="flex items-center justify-between p-3 rounded-xl bg-ink/5">
                            <div>
                              <p className="font-semibold text-ink">{userData.name}</p>
                              <p className="text-sm text-ink/60">@{userData.username || userData.email}</p>
                            </div>
                            <div className="text-right">
                              <p className="font-bold text-teal">{userData.focusScore || 0}</p>
                              <p className="text-xs text-ink/60">Focus Score</p>
                            </div>
                          </div>
                        )
                      })
                    ) : (
                      <p className="text-ink/60">No members yet</p>
                    )}
                  </div>
                </div>

                {/* Actions */}
                <div className="flex gap-3 pt-4 border-t border-ink/10">
                  <button
                    onClick={() => handleLeaveGroup(selectedGroupForDetails._id)}
                    className="flex-1 rounded-full border border-red-400 px-4 py-2 font-semibold text-red-600 hover:bg-red-50 transition-all flex items-center justify-center gap-2"
                  >
                    <LogOut size={18} /> Leave Group
                  </button>
                  {selectedGroupForDetails.createdBy?._id === localStorage.getItem('userId') && (
                    <button
                      onClick={() => handleDeleteGroup(selectedGroupForDetails._id)}
                      className="flex-1 rounded-full border border-red-600 px-4 py-2 font-semibold text-white bg-red-600 hover:bg-red-700 transition-all flex items-center justify-center gap-2"
                    >
                      <Trash2 size={18} /> Delete
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Groups Grid */}
        {!loading && groups.length > 0 ? (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {groups.map((group) => (
              <div
                key={group._id}
                onClick={() => openGroupDetails(group)}
                className="rounded-3xl bg-white/80 p-6 shadow-soft hover:shadow-md transition-all cursor-pointer"
              >
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h3 className="text-xl font-bold text-ink">{group.name}</h3>
                    <p className="text-sm text-ink/60">Created {new Date(group.createdAt).toLocaleDateString()}</p>
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="rounded-2xl bg-sand/50 p-4">
                    <p className="text-sm text-ink/60 uppercase tracking-wider mb-1">Group Code</p>
                    <div className="flex items-center gap-2">
                      <code className="flex-1 font-bold text-ink text-lg tracking-widest">{group.code}</code>
                      <button
                        onClick={(e) => {
                          e.stopPropagation()
                          copyToClipboard(group.code)
                        }}
                        className="p-2 hover:bg-white rounded-lg transition-all"
                      >
                        <Copy size={18} className="text-teal" />
                      </button>
                    </div>
                  </div>

                  <div className="pt-2">
                    <p className="text-sm text-ink/60 uppercase tracking-wider">Members</p>
                    <p className="text-2xl font-bold text-ink">{group.members?.length || 0}</p>
                  </div>

                  {group.members && group.members.length > 0 && (
                    <div>
                      <p className="text-sm text-ink/60 uppercase tracking-wider mb-2">Recent Members</p>
                      <div className="space-y-2">
                        {group.members.slice(0, 3).map((member) => {
                          const userData = member.userId || member
                          return <p key={member._id || userData._id} className="text-sm text-ink">{userData.name}</p>
                        })}
                        {group.members.length > 3 && (
                          <p className="text-sm text-ink/60">+{group.members.length - 3} more</p>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        ) : !loading ? (
          <div className="rounded-3xl bg-gradient-to-br from-teal/10 to-blue/10 p-12 text-center shadow-soft">
            <div className="text-6xl mb-4">👥</div>
            <h3 className="text-2xl font-bold text-ink mb-2">No Groups Yet</h3>
            <p className="text-ink/70 max-w-md mx-auto">
              Create a new group or join an existing one to start collaborating with other users
            </p>
          </div>
        ) : null}
      </div>
    </DoodleBackground>
  )
}
