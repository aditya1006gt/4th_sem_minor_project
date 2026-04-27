import { useEffect, useState } from "react";
import axiosClient from "../api/axiosClient";
import PageHeader from "../components/PageHeader";

const initialPostForm = {
  title: "",
  body: ""
};

const Community = () => {
  const [posts, setPosts] = useState([]);
  const [sortBy, setSortBy] = useState("recent");
  const [postForm, setPostForm] = useState(initialPostForm);
  const [commentDrafts, setCommentDrafts] = useState({});
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const fetchPosts = async (selectedSort = sortBy) => {
    setLoading(true);
    setError("");
    try {
      const response = await axiosClient.get("/forum", {
        params: { sortBy: selectedSort }
      });
      setPosts(response.data.posts);
    } catch (apiError) {
      setError(apiError.response?.data?.message || "Failed to fetch community posts");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPosts();
  }, []);

  const handleCreatePost = async (event) => {
    event.preventDefault();
    setError("");
    setMessage("");

    try {
      await axiosClient.post("/forum", postForm);
      setPostForm(initialPostForm);
      setMessage("Post created successfully.");
      await fetchPosts();
    } catch (apiError) {
      setError(apiError.response?.data?.message || "Failed to create post");
    }
  };

  const handlePostVote = async (postId, voteType) => {
    try {
      await axiosClient.patch(`/forum/${postId}/vote`, { voteType });
      await fetchPosts();
    } catch (apiError) {
      setError(apiError.response?.data?.message || "Failed to update vote");
    }
  };

  const deletePost = async (postId) => {
    const confirmed = window.confirm("Delete this post permanently?");
    if (!confirmed) {
      return;
    }

    try {
      await axiosClient.delete(`/forum/${postId}`);
      setMessage("Post deleted.");
      await fetchPosts();
    } catch (apiError) {
      setError(apiError.response?.data?.message || "Failed to delete post");
    }
  };

  const sharePost = async (postId) => {
    try {
      const response = await axiosClient.get(`/forum/${postId}/share`);
      const shareUrl = response.data.shareUrl;

      if (navigator.clipboard) {
        await navigator.clipboard.writeText(shareUrl);
        setMessage("Share link copied.");
        return;
      }

      setMessage(shareUrl);
    } catch (apiError) {
      setError(apiError.response?.data?.message || "Failed to create share link");
    }
  };

  const handleCommentVote = async (postId, commentId, voteType) => {
    try {
      await axiosClient.patch(`/forum/${postId}/comments/${commentId}/vote`, { voteType });
      await fetchPosts();
    } catch (apiError) {
      setError(apiError.response?.data?.message || "Failed to update comment vote");
    }
  };

  const deleteComment = async (postId, commentId) => {
    const confirmed = window.confirm("Delete this comment permanently?");
    if (!confirmed) {
      return;
    }

    try {
      await axiosClient.delete(`/forum/${postId}/comments/${commentId}`);
      setMessage("Comment deleted.");
      await fetchPosts();
    } catch (apiError) {
      setError(apiError.response?.data?.message || "Failed to delete comment");
    }
  };

  const handleCommentDraftChange = (postId, value) => {
    setCommentDrafts((current) => ({ ...current, [postId]: value }));
  };

  const submitComment = async (postId, parentCommentId = null) => {
    const key = parentCommentId ? `${postId}:${parentCommentId}` : postId;
    const body = commentDrafts[key];

    if (!body?.trim()) {
      return;
    }

    try {
      await axiosClient.post(`/forum/${postId}/comments`, { body, parentCommentId });
      setCommentDrafts((current) => ({ ...current, [key]: "" }));
      await fetchPosts();
    } catch (apiError) {
      setError(apiError.response?.data?.message || "Failed to add comment");
    }
  };

  const handleSortChange = async (event) => {
    const value = event.target.value;
    setSortBy(value);
    await fetchPosts(value);
  };

  return (
    <section>
      <PageHeader
        eyebrow="Anonymous Community"
        title="Community Chat"
        description="Post anonymously, vote on useful replies, and keep discussions moving."
        actions={
          <select value={sortBy} onChange={handleSortChange}>
            <option value="recent">Recent First</option>
            <option value="top">Top</option>
            <option value="oldest">Oldest</option>
          </select>
        }
      />

      <article className="panel">
        <h3>Create a Post</h3>
        <form className="stack-form" onSubmit={handleCreatePost}>
          <label>
            Title
            <input
              value={postForm.title}
              onChange={(event) =>
                setPostForm((current) => ({ ...current, title: event.target.value }))
              }
              required
            />
          </label>
          <label>
            Body
            <textarea
              rows="4"
              value={postForm.body}
              onChange={(event) =>
                setPostForm((current) => ({ ...current, body: event.target.value }))
              }
              required
            />
          </label>
          <button type="submit" className="primary-button">
            Post Anonymously
          </button>
        </form>
      </article>

      {message ? <p className="success-text">{message}</p> : null}
      {error ? <p className="error-text">{error}</p> : null}
      {loading ? <p className="muted">Loading community posts...</p> : null}
      <article className="list-card top-gap">
        <strong>Community Feed</strong>
        <span className="muted">{posts.length} posts</span>
      </article>

      <div className="list-grid">
        {!loading && posts.length === 0 ? (
          <article className="panel">
            <p className="muted">No posts yet. Start the first anonymous conversation.</p>
          </article>
        ) : null}
        {posts.map((post) => (
          <article key={post._id} className="discussion-card">
            <div className="vote-column">
              <button type="button" className="vote-button" onClick={() => handlePostVote(post._id, "upvote")}>
                Up
              </button>
              <strong>{post.score}</strong>
              <button
                type="button"
                className="vote-button"
                onClick={() => handlePostVote(post._id, "downvote")}
              >
                Down
              </button>
            </div>

            <div className="discussion-content">
              <h3>{post.title}</h3>
              <p>{post.body}</p>
              <p className="muted">
                {post.anonymousName} - {post.commentCount} comments -{" "}
                {new Date(post.createdAt).toLocaleDateString()}
              </p>
              <div className="comment-actions">
                <button type="button" className="text-button" onClick={() => sharePost(post._id)}>
                  Share
                </button>
                {post.canDelete ? (
                  <button type="button" className="text-button" onClick={() => deletePost(post._id)}>
                    Delete Post
                  </button>
                ) : null}
              </div>

              <div className="comment-box">
                <textarea
                  rows="2"
                  placeholder="Add a comment"
                  value={commentDrafts[post._id] || ""}
                  onChange={(event) => handleCommentDraftChange(post._id, event.target.value)}
                />
                <button type="button" className="secondary-button" onClick={() => submitComment(post._id)}>
                  Reply
                </button>
              </div>

              <div className="comment-list">
                {post.comments?.map((comment) => (
                  <div key={comment._id} className="comment-item">
                    <div className="comment-header">
                      <strong>{comment.anonymousName}</strong>
                      <span className="muted">Score {comment.points}</span>
                    </div>
                    <p>{comment.body}</p>
                    <div className="comment-actions">
                      <button
                        type="button"
                        className="text-button"
                        onClick={() => handleCommentVote(post._id, comment._id, "upvote")}
                      >
                        Upvote
                      </button>
                      <button
                        type="button"
                        className="text-button"
                        onClick={() => handleCommentVote(post._id, comment._id, "downvote")}
                      >
                        Downvote
                      </button>
                      {comment.canDelete ? (
                        <button
                          type="button"
                          className="text-button"
                          onClick={() => deleteComment(post._id, comment._id)}
                        >
                          Delete
                        </button>
                      ) : null}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
};

export default Community;
