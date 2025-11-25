const express = require("express");
const router = express.Router();
const {
  createPost,
  getAllPosts,
  getPostById,
  updatePost,
  deletePost,
  likePost,
  savePost,
  getFeed,
  getLikes,
} = require("../controllers/postController");
const { protect } = require("../middleware/auth");
const upload = require("../middleware/upload");

// allow multiple images (max 10)
router.post("/", protect, upload("images", 10), createPost);

router.get("/", protect, getAllPosts);
router.get("/feed", protect, getFeed);
router.get("/:id", protect, getPostById);

// allow updating with multiple images
router.put("/:id", protect, upload("images", 10), updatePost);

router.delete("/:id", protect, deletePost);
router.post("/:id/like", protect, likePost);
router.post("/:id/save", protect, savePost);
router.get("/:id/likes", protect, getLikes);

module.exports = router;
