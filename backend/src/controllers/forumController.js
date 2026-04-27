const ForumPost = require("../models/ForumPost");

const removeVote = (votes, userId) => votes.filter((id) => id.toString() !== userId.toString());
const makeAnonymousName = () => `User${Math.floor(1000 + Math.random() * 9000)}`;
const isProfessor = (user) => user?.role === "professor";
const isOwner = (ownerId, user) => ownerId?.toString() === user?._id?.toString();
const canDeletePost = (post, user) => isProfessor(user) || isOwner(post.authorId, user);
const canDeleteComment = (comment, post, user) =>
  isProfessor(user) || isOwner(post.authorId, user) || isOwner(comment.authorId, user);

const buildShareUrl = (req, postId) => {
  const clientUrl = process.env.CLIENT_URL?.replace(/\/$/, "");
  const fallbackUrl = `${req.protocol}://${req.get("host")}`;
  return `${clientUrl || fallbackUrl}/community?post=${postId}`;
};

const serializeComment = (comment, req, post) => ({
  _id: comment._id,
  body: comment.body,
  anonymousName: comment.anonymousName,
  parentCommentId: comment.parentCommentId,
  upvotes: comment.upvotes.length,
  downvotes: comment.downvotes.length,
  points: comment.upvotes.length - comment.downvotes.length,
  canDelete: canDeleteComment(comment, post, req.user),
  createdAt: comment.createdAt,
  updatedAt: comment.updatedAt
});

const serializePost = (post, req) => ({
  _id: post._id,
  title: post.title,
  body: post.body,
  anonymousName: post.anonymousName,
  points: post.points,
  score: post.points,
  upvotes: post.upvotes.length,
  downvotes: post.downvotes.length,
  comments: post.comments.map((comment) => serializeComment(comment, req, post)),
  commentCount: post.comments.length,
  canDelete: canDeletePost(post, req.user),
  shareUrl: buildShareUrl(req, post._id),
  createdAt: post.createdAt,
  updatedAt: post.updatedAt
});

const createPost = async (req, res) => {
  try {
    const { title, body } = req.body;

    const post = await ForumPost.create({
      title,
      body,
      authorId: req.user._id,
      anonymousName: makeAnonymousName()
    });

    return res.status(201).json({
      message: "Forum post created successfully",
      post: serializePost(post, req)
    });
  } catch (error) {
    return res.status(500).json({ message: "Failed to create forum post", error: error.message });
  }
};

const getPosts = async (req, res) => {
  try {
    const { sortBy = "recent" } = req.query;
    const sortOptions = {
      recent: { createdAt: -1 },
      oldest: { createdAt: 1 }
    };

    const posts = await ForumPost.find().sort(sortOptions[sortBy] || sortOptions.recent);

    const normalizedPosts = posts.map((post) => serializePost(post, req));

    if (sortBy === "top") {
      normalizedPosts.sort((a, b) => b.points - a.points);
    }

    return res.status(200).json({ posts: normalizedPosts });
  } catch (error) {
    return res.status(500).json({ message: "Failed to fetch forum posts", error: error.message });
  }
};

const getPostById = async (req, res) => {
  try {
    const post = await ForumPost.findById(req.params.postId);

    if (!post) {
      return res.status(404).json({ message: "Forum post not found" });
    }

    return res.status(200).json({
      post: serializePost(post, req)
    });
  } catch (error) {
    return res.status(500).json({ message: "Failed to fetch forum post", error: error.message });
  }
};

const addComment = async (req, res) => {
  try {
    const { body, parentCommentId = null } = req.body;
    const post = await ForumPost.findById(req.params.postId);

    if (!post) {
      return res.status(404).json({ message: "Forum post not found" });
    }

    if (parentCommentId) {
      const parentExists = post.comments.some(
        (comment) => comment._id.toString() === parentCommentId.toString()
      );

      if (!parentExists) {
        return res.status(400).json({ message: "Parent comment does not exist" });
      }
    }

    post.comments.push({
      body,
      authorId: req.user._id,
      anonymousName: makeAnonymousName(),
      parentCommentId
    });

    await post.save();

    return res.status(201).json({
      message: "Comment added successfully",
      comments: post.comments.map((comment) => serializeComment(comment, req, post))
    });
  } catch (error) {
    return res.status(500).json({ message: "Failed to add comment", error: error.message });
  }
};

const votePost = async (req, res) => {
  try {
    const { voteType } = req.body;
    const post = await ForumPost.findById(req.params.postId);

    if (!post) {
      return res.status(404).json({ message: "Forum post not found" });
    }

    if (!["upvote", "downvote"].includes(voteType)) {
      return res.status(400).json({ message: "voteType must be upvote or downvote" });
    }

    const userId = req.user._id;
    const hasUpvoted = post.upvotes.some((id) => id.toString() === userId.toString());
    const hasDownvoted = post.downvotes.some((id) => id.toString() === userId.toString());

    if (voteType === "upvote") {
      post.downvotes = removeVote(post.downvotes, userId);
      post.upvotes = hasUpvoted ? removeVote(post.upvotes, userId) : [...post.upvotes, userId];
    }

    if (voteType === "downvote") {
      post.upvotes = removeVote(post.upvotes, userId);
      post.downvotes = hasDownvoted
        ? removeVote(post.downvotes, userId)
        : [...post.downvotes, userId];
    }

    await post.save();

    return res.status(200).json({
      message: "Post vote updated successfully",
      upvotes: post.upvotes.length,
      downvotes: post.downvotes.length,
      points: post.points,
      score: post.points
    });
  } catch (error) {
    return res.status(500).json({ message: "Failed to vote on post", error: error.message });
  }
};

const voteComment = async (req, res) => {
  try {
    const { voteType } = req.body;
    const { postId, commentId } = req.params;
    const post = await ForumPost.findById(postId);

    if (!post) {
      return res.status(404).json({ message: "Forum post not found" });
    }

    const comment = post.comments.id(commentId);
    if (!comment) {
      return res.status(404).json({ message: "Comment not found" });
    }

    if (!["upvote", "downvote"].includes(voteType)) {
      return res.status(400).json({ message: "voteType must be upvote or downvote" });
    }

    const userId = req.user._id;
    const hasUpvoted = comment.upvotes.some((id) => id.toString() === userId.toString());
    const hasDownvoted = comment.downvotes.some((id) => id.toString() === userId.toString());

    if (voteType === "upvote") {
      comment.downvotes = removeVote(comment.downvotes, userId);
      comment.upvotes = hasUpvoted
        ? removeVote(comment.upvotes, userId)
        : [...comment.upvotes, userId];
    }

    if (voteType === "downvote") {
      comment.upvotes = removeVote(comment.upvotes, userId);
      comment.downvotes = hasDownvoted
        ? removeVote(comment.downvotes, userId)
        : [...comment.downvotes, userId];
    }

    await post.save();

    return res.status(200).json({
      message: "Comment vote updated successfully",
      upvotes: comment.upvotes.length,
      downvotes: comment.downvotes.length,
      score: comment.upvotes.length - comment.downvotes.length
    });
  } catch (error) {
    return res.status(500).json({ message: "Failed to vote on comment", error: error.message });
  }
};

const sharePost = async (req, res) => {
  try {
    const post = await ForumPost.findById(req.params.postId).select("_id");

    if (!post) {
      return res.status(404).json({ message: "Forum post not found" });
    }

    return res.status(200).json({ shareUrl: buildShareUrl(req, post._id) });
  } catch (error) {
    return res.status(500).json({ message: "Failed to create share link", error: error.message });
  }
};

const deletePost = async (req, res) => {
  try {
    const post = await ForumPost.findById(req.params.postId);

    if (!post) {
      return res.status(404).json({ message: "Forum post not found" });
    }

    if (!canDeletePost(post, req.user)) {
      return res.status(403).json({ message: "You are not allowed to delete this post" });
    }

    await post.deleteOne();

    return res.status(200).json({ message: "Post deleted successfully" });
  } catch (error) {
    return res.status(500).json({ message: "Failed to delete post", error: error.message });
  }
};

const deleteComment = async (req, res) => {
  try {
    const { postId, commentId } = req.params;
    const post = await ForumPost.findById(postId);

    if (!post) {
      return res.status(404).json({ message: "Forum post not found" });
    }

    const comment = post.comments.id(commentId);
    if (!comment) {
      return res.status(404).json({ message: "Comment not found" });
    }

    if (!canDeleteComment(comment, post, req.user)) {
      return res.status(403).json({ message: "You are not allowed to delete this comment" });
    }

    comment.deleteOne();
    await post.save();

    return res.status(200).json({ message: "Comment deleted successfully" });
  } catch (error) {
    return res.status(500).json({ message: "Failed to delete comment", error: error.message });
  }
};

module.exports = {
  createPost,
  getPosts,
  getPostById,
  addComment,
  votePost,
  voteComment,
  sharePost,
  deletePost,
  deleteComment
};
