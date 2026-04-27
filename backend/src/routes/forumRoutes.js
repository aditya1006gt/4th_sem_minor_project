const express = require("express");
const {
  createPost,
  getPosts,
  getPostById,
  addComment,
  votePost,
  voteComment,
  sharePost,
  deletePost,
  deleteComment
} = require("../controllers/forumController");
const { protect, authorize } = require("../middleware/authMiddleware");

const router = express.Router();

router.get("/", protect, getPosts);
router.get("/:postId/share", protect, sharePost);
router.get("/:postId", protect, getPostById);

router.post(
  "/",
  protect,
  authorize("student", "club_admin", "professor"),
  createPost
);

router.post(
  "/:postId/comments",
  protect,
  authorize("student", "club_admin", "professor"),
  addComment
);

router.patch(
  "/:postId/vote",
  protect,
  authorize("student", "club_admin", "professor"),
  votePost
);

router.patch(
  "/:postId/comments/:commentId/vote",
  protect,
  authorize("student", "club_admin", "professor"),
  voteComment
);

router.delete(
  "/:postId",
  protect,
  authorize("student", "club_admin", "professor"),
  deletePost
);

router.delete(
  "/:postId/comments/:commentId",
  protect,
  authorize("student", "club_admin", "professor"),
  deleteComment
);

module.exports = router;
