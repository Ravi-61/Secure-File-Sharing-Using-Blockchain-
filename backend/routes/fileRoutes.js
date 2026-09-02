const express = require("express");
const multer = require("multer");
const {
  uploadFile,
  uploadToIPFSController,
  verifyFile,
  encryptDemo,
  encryptFileController,
  decryptFileController,
  getUserFilesController,
  toggleFavoriteController,
  moveToTrashController,
  restoreFromTrashController,
  deleteFileController,
  getFileTimelineController,
  previewFileController,
} = require("../controllers/fileController");
const { protect } = require("../middleware/authMiddleware");

const router = express.Router();

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads/");
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + "-" + file.originalname);
  },
});

const upload = multer({ storage });

// ===========================
// Preserved Legacy Routes
// ===========================
router.post("/upload", upload.single("file"), uploadFile);
router.post("/verify", upload.single("file"), verifyFile);
router.post("/encrypt-demo", encryptDemo);
router.post("/encrypt-file", upload.single("file"), encryptFileController);
router.post("/decrypt-file", upload.single("file"), decryptFileController);

// ===========================
// IPFS Upload (Authenticated)
// ===========================
router.post("/ipfs/upload", protect, upload.single("file"), uploadToIPFSController);

// ===========================
// Enterprise File Management
// ===========================
router.get("/user-files", protect, getUserFilesController);
router.patch("/:id/favorite", protect, toggleFavoriteController);
router.patch("/:id/trash", protect, moveToTrashController);
router.patch("/:id/restore", protect, restoreFromTrashController);
router.delete("/:id", protect, deleteFileController);
router.get("/:id/timeline", protect, getFileTimelineController);
router.get("/:id/preview", protect, previewFileController);

module.exports = router;
