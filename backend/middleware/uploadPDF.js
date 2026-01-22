import multer from "multer";
import multerS3 from "multer-s3";
import s3 from "../config/s3.js";

const uploadPdf = multer({
    storage: multerS3({
        s3,
        bucket: process.env.AWS_BUCKET_NAME,
        contentType: multerS3.AUTO_CONTENT_TYPE,
        key: (req, file, cb) => {
            const fileName = `notes/${Date.now()}-${file.originalname}`;
            cb(null, fileName);
        },
    }),
    fileFilter: (req, file, cb) => {
        if (file.mimetype === "application/pdf") cb(null, true);
        else cb(new Error("Only PDF files allowed"), false);
    },
});

export default uploadPdf;
