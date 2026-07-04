import express from 'express';
import upload from "../middleware/multer.js";
import {
    createProduct,
    getProducts,
    updateProduct,
    deleteProduct
} from "../controllers/productController.js";

const router = express.Router();
router.post("/add", upload.single("image"), createProduct);
router.get('/', getProducts);
router.put("/update/:id", upload.single("image"), updateProduct);
router.delete('/delete/:id', deleteProduct);

export default router;