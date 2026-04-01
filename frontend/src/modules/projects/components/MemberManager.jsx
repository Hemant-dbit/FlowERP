import { useState } from 'react'

export default function MemberManager({ projectId, onAddMember, onRemoveMember, saving }) {
  const [addUserId, setAddUserId] = useState('')
  const [removeUserId, setRemoveUserId] = useState('')

  const handleAdd = async (event) => {
    event.preventDefault()
    const userId = Number(addUserId)
    if (!Number.isFinite(userId) || userId <= 0) {
      return
    }
    await onAddMember(userId)
    setAddUserId('')
  }

  const handleRemove = async (event) => {
    event.preventDefault()
    const userId = Number(removeUserId)
    if (!Number.isFinite(userId) || userId <= 0) {
      return
    }
    await onRemoveMember(userId)
    setRemoveUserId('')
  }

  return (
    <div className="member-manager">
      <h3>Manage Members (Project #{projectId})</h3>
      <div className="member-actions">
        <form onSubmit={handleAdd}>
          <label htmlFor="add-member-id">Add member by User ID</label>
          <div>
            <input
              id="add-member-id"
              type="number"
              min="1"
              value={addUserId}
              onChange={(event) => setAddUserId(event.target.value)}
              placeholder="User ID"
              required
            />
            <button type="submit" disabled={saving}>Add</button>
          </div>
        </form>

        <form onSubmit={handleRemove}>
          <label htmlFor="remove-member-id">Remove member by User ID</label>
          <div>
            <input
              id="remove-member-id"
              type="number"
              min="1"
              value={removeUserId}
              onChange={(event) => setRemoveUserId(event.target.value)}
              placeholder="User ID"
              required
            />
            <button type="submit" disabled={saving}>Remove</button>
          </div>
        </form>
      </div>
    </div>
  )
}
