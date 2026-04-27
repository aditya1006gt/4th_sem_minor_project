const fs = require("fs");
const path = require("path");
const multer = require("multer");

const ensureDir = (dirPath) => {
  fs.mkdirSync(dirPath, { recursive: true });
};

const uploadsRoot = path.join(__dirname, "../../uploads");
const notesDir = path.join(uploadsRoot, "notes");
const postersDir = path.join(uploadsRoot, "posters");

ensureDir(notesDir);
ensureDir(postersDir);

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    if (file.fieldname === "noteFile") {
      return cb(null, notesDir);
    }

    if (file.fieldname === "poster") {
      return cb(null, postersDir);
    }

    return cb(new Error("Unsupported upload field"));
  },
  filename: (req, file, cb) => {
    const extension = path.extname(file.originalname);
    const baseName = path.basename(file.originalname, extension).replace(/\s+/g, "-").toLowerCase();
    cb(null, `${Date.now()}-${baseName}${extension}`);
  }
});

const noteFileFilter = (req, file, cb) => {
  const allowedMimeTypes = [
    "application/pdf",
    "image/jpeg",
    "image/png",
    "image/webp"
  ];

  if (!allowedMimeTypes.includes(file.mimetype)) {
    return cb(new Error("Only PDF, JPG, PNG, and WEBP note files are allowed"));
  }

  cb(null, true);
};

const posterFileFilter = (req, file, cb) => {
  const allowedMimeTypes = ["image/jpeg", "image/png", "image/webp"];

  if (!allowedMimeTypes.includes(file.mimetype)) {
    return cb(new Error("Only JPG, PNG, and WEBP posters are allowed"));
  }

  cb(null, true);
};

const noteUpload = multer({
  storage,
  fileFilter: noteFileFilter,
  limits: {
    fileSize: 10 * 1024 * 1024
  }
});

const posterUpload = multer({
  storage,
  fileFilter: posterFileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024
  }
});

module.exports = {
  uploadNote: noteUpload.single("noteFile"),
  uploadPoster: posterUpload.single("poster")
};
