import Product from "../models/product.js";

// Create a new product
export const createProduct = async (req, res) => {
    try {
        const { title, description, price, category, stock } = req.body;

        // Validation
        if (!title || !price || !stock) {
            return res.status(400).json({
                message: "Title, price, and stock are required"
            });
        }

        const numPrice = Number(price);
        const numStock = Number(stock);

        if (isNaN(numPrice) || numPrice < 0) {
            return res.status(400).json({
                message: "Price must be a positive number"
            });
        }

        if (isNaN(numStock) || numStock < 0) {
            return res.status(400).json({
                message: "Stock must be a positive number"
            });
        }

        // Image path
        const image = req.file
            ? `/products/${req.file.filename}`
            : req.body.image || "";

        const product = await Product.create({
            title,
            description: description || "",
            price: numPrice,
            category: category || "",
            image,
            stock: numStock,
        });

        res.status(201).json({
            message: "Product created successfully",
            product,
        });
    } catch (error) {
        res.status(500).json({ message: "Server Error", error: error.message });
    }
};

// Get all products
export const getProducts = async (req, res) => {
    try {
        const { search, category, page = 1, limit = 12 } = req.query;

        let filter = {};

        if (search) {
            filter.title = { $regex: search, $options: 'i' };
        }

        if (category) {
            filter.category = category;
        }

        const pageNum = Math.max(1, parseInt(page));
        const limitNum = Math.max(1, Math.min(50, parseInt(limit))); // max 50 per page
        const skip = (pageNum - 1) * limitNum;

        // Run both queries in parallel
        const [products, total] = await Promise.all([
            Product.find(filter)
                .sort({ createdAt: -1 })
                .skip(skip)
                .limit(limitNum),
            Product.countDocuments(filter)
        ]);

        res.json({
            products,
            pagination: {
                currentPage: pageNum,
                totalPages: Math.ceil(total / limitNum),
                totalItems: total,
                itemsPerPage: limitNum,
                hasNextPage: pageNum * limitNum < total,
                hasPrevPage: pageNum > 1
            }
        });
    } catch (error) {
        res.status(500).json({ message: 'Server Error', error });
    }
};

//Update a product
export const updateProduct = async (req, res) => {
    try {
        const { title, description, price, category, stock } = req.body;

        const numPrice = price ? Number(price) : undefined;
        const numStock = stock ? Number(stock) : undefined;

        // Validation
        if (numPrice !== undefined && (isNaN(numPrice) || numPrice < 0)) {
            return res.status(400).json({
                message: "Price must be a positive number"
            });
        }

        if (numStock !== undefined && (isNaN(numStock) || numStock < 0)) {
            return res.status(400).json({
                message: "Stock must be a positive number"
            });
        }

        // Build update object
        const updateData = {};
        if (title) updateData.title = title;
        if (description !== undefined) updateData.description = description;
        if (category !== undefined) updateData.category = category;
        if (numPrice !== undefined) updateData.price = numPrice;
        if (numStock !== undefined) updateData.stock = numStock;

        // Image update
        if (req.file) {
            updateData.image = `/products/${req.file.filename}`;
        } else if (req.body.image) {
            updateData.image = req.body.image;
        }

        const updated = await Product.findByIdAndUpdate(
            req.params.id,
            updateData,
            { new: true }
        );

        if (!updated) {
            return res.status(404).json({ message: "Product not found" });
        }

        res.json({
            message: "Product updated successfully",
            updated,
        });
    } catch (error) {
        res.status(500).json({ message: "Server Error", error: error.message });
    }
};

// Delete a product
export const deleteProduct = async (req, res) => {
    try {
        await Product.findByIdAndDelete(req.params.id);
        res.json({ message: 'Product deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: 'Server Error', error });
    }
}