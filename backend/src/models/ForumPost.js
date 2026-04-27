const mongoose = require("mongoose");

const forumCommentSchema = new mongoose.Schema(
  {
    body: {
      type: String,
      required: true,
      trim: true
    },
    authorId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true
    },
    anonymousName: {
      type: String,
      required: true,
      trim: true
    },
    parentCommentId: {
      type: mongoose.Schema.Types.ObjectId,
      default: null
    },
    upvotes: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User"
      }
    ],
    downvotes: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User"
      }
    ]
  },
  {
    timestamps: true
  }
);

const forumPostSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true
    },
    body: {
      type: String,
      required: true,
      trim: true
    },
    authorId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true
    },
    anonymousName: {
      type: String,
      required: true,
      trim: true
    },
    points: {
      type: Number,
      default: 0
    },
    upvotes: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User"
      }
    ],
    downvotes: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User"
      }
    ],
    comments: {
      type: [forumCommentSchema],
      default: []
    }
  },
  {
    timestamps: true
  }
);

const makeAnonymousName = () => `User${Math.floor(1000 + Math.random() * 9000)}`;

forumPostSchema.pre("validate", function fillAnonymousNames(next) {
  if (!this.anonymousName) {
    this.anonymousName = makeAnonymousName();
  }

  this.comments.forEach((comment) => {
    if (!comment.anonymousName) {
      comment.anonymousName = makeAnonymousName();
    }
  });

  this.points = this.upvotes.length - this.downvotes.length;
  next();
});

module.exports = mongoose.model("ForumPost", forumPostSchema);
