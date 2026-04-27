import { useEffect, useState } from "react";
import axiosClient from "../api/axiosClient";
import PageHeader from "../components/PageHeader";

const initialPostForm = {
  title: "",
  body: ""
};

const ForumPage = () => {
  const [posts, setPosts] = useState([]);
  const [sortBy, setSortBy] = useState("recent");
  const [postForm, setPostForm] = useState(initialPostForm);
  const [commentDrafts, setCommentDrafts] = useState({});
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const fetchPosts = async (selectedSort = sortBy) => {
    setLoading(true);
    try {
      const response = await axiosClient.get("/forum", {
        params: { sortBy: selectedSort }
      });
      setPosts(response.data.posts);
    } catch (apiError) {
      setError(apiError.response?.data?.message || "Failed to fetch forum posts");
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
        eyebrow="Mini Reddit"
        title="Doubt Discussion Forum"
        description="Ask questions, discuss answers, and vote useful responses to the top."
        actions={
          <select value={sortBy} onChange={handleSortChange}>
            <option value="recent">Recent</option>
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
            Post Doubt
          </button>
        </form>
      </article>

      {message ? <p className="success-text">{message}</p> : null}
      {error ? <p className="error-text">{error}</p> : null}
      {loading ? <p className="muted">Loading discussions...</p> : null}

      <div className="list-grid">
        {posts.map((post) => (
          <article key={post._id} className="discussion-card">
            <div className="vote-column">
              <button type="button" className="vote-button" onClick={() => handlePostVote(post._id, "upvote")}>
                ▲
              </button>
              <strong>{post.score}</strong>
              <button
                type="button"
                className="vote-button"
                onClick={() => handlePostVote(post._id, "downvote")}
              >
                ▼
              </button>
            </div>

            <div className="discussion-content">
              <h3>{post.title}</h3>
              <p>{post.body}</p>
              <p className="muted">
                {post.anonymousName} - {post.commentCount} comments
              </p>
              <button type="button" className="text-button" onClick={() => sharePost(post._id)}>
                Share
              </button>

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
                      <span className="muted">
                        Score {comment.points}
                      </span>
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

export default ForumPage;
