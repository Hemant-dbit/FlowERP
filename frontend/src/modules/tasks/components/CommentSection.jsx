import { useState } from 'react';

export default function CommentSection({ comments = [], saving, onSubmitComment }) {
  const [commentText, setCommentText] = useState('');

  const handleSubmit = async (event) => {
    event.preventDefault();
    const text = commentText.trim();
    if (!text) return;

    const result = await onSubmitComment(text);
    if (result?.ok) {
      setCommentText('');
    }
  };

  return (
    <section className="comment-section">
      <h3>Comments</h3>

      <form className="comment-form" onSubmit={handleSubmit}>
        <textarea
          value={commentText}
          onChange={(event) => setCommentText(event.target.value)}
          placeholder="Add a comment"
          rows={3}
        />
        <button type="submit" disabled={saving}>
          {saving ? 'Posting...' : 'Post Comment'}
        </button>
      </form>

      <div className="comment-list">
        {comments.map((comment) => (
          <article key={comment.id} className="comment-item">
            <p className="comment-meta">
              {comment.author_detail?.username || `User #${comment.author || 'n/a'}`} ·{' '}
              {comment.created_at || ''}
            </p>
            <p>{comment.content}</p>
          </article>
        ))}

        {comments.length === 0 ? <p>No comments yet.</p> : null}
      </div>
    </section>
  );
}
