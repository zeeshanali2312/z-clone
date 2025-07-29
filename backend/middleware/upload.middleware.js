import multer from "multer";

const storage = multer.memoryStorage();
const fileFilter = (req, file, cb) => {
  if (file.mimetype.startsWith("image/")) {
    cb(null, true);
  } else {
    cd(new Error("only image file is allowed", false));
  }
};
const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: { fieldSize: 5 * 1024 * 1024 }, // 5mb file
});

export default upload;
