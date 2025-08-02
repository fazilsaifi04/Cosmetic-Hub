const Category = require("../models/category.model");
const Product = require("../models/product.model");


async function createProduct(reqData) {

    // if (!reqData) {
    //     throw new Error("Request data is missing");
    // }

    // if (!reqData.topLevelcategory || !reqData.secondLevelCategory || !reqData.thirdLevelCategory) {
    //     throw new Error("Category information is incomplete");
    // }

    let topLevel = await Category.findOne({name:reqData.topLevelcategory});

    if(!topLevel){
        topLevel=new Category({
            name:reqData.topLevelcategory,
            level:1
        })
        await topLevel.save()
    }

    let secondLevel=await Category.findOne({
        name:reqData.secondLevelCategory,
        parentCategory: topLevel._id,
    })

    if(!secondLevel){
        secondLevel=new Category({
            name:reqData.secondLevelCategory,
            parentCategory:topLevel._id,
            level:2
        })

        await secondLevel.save()
    }

    let thirdLevel = await Category.findOne({
        name:reqData.thirdLevelCategory,
        parentCategory:secondLevel._id,
    })

    if(!thirdLevel){
        thirdLevel=new Category({
            name:reqData.thirdLevelCategory,
            parentCategory:secondLevel._id,
            level:3,
        })

        await thirdLevel.save()
    }

    const product = new Product({
        title: reqData.title,
        description: reqData.description,
        discountedPrice: reqData.discountedPrice,
        discountPersent: reqData.discountPersent,
        imageUrl: reqData.imageUrl,
        brand: reqData.brand,
        price: reqData.price,
        quantity: reqData.quantity,
        category: thirdLevel._id,  // Make sure thirdLevel._id is valid
    });

    console.log("product -- ",product)
    

    return await product.save();
}

async function deleteProduct(productId) {
    const product= await findProductById(productId);

    await Product.findByIdAndDelete(productId);
    return "Product deleted Successfully";
}


async function updateProduct(productId, reqData) {
    return await Product.findByIdAndUpdate(productId,reqData);
}

async function findProductById(id) {
    const product = await Product.findById(id).populate("category").exec();

    if(!product){
        throw new Error("Product not found with id"+ id);
        
    }

    return product;
}

async function getAllProducts(reqQuery) {
    let { category, minPrice, maxPrice, minDiscount, sort, stock, pageNumber, pageSize } = reqQuery;

    pageNumber = Math.max(parseInt(pageNumber) || 1, 1);
    pageSize = Math.max(parseInt(pageSize) || 10, 1);

    let query = Product.find().populate("category");

    if (category) {
        const existCategory = await Category.findOne({ name: new RegExp(`^${category}$`, 'i') });
        if (existCategory) {
            query = query.where("category").equals(existCategory._id);
        } else {
            return { content: [], currentPage: 1, totalPages: 0 };
        }
    }

    if (minPrice || maxPrice) {
        const min = minPrice || 0;
        const max = maxPrice || Number.MAX_VALUE;
        query = query.where('discountedPrice').gte(min).lte(max);
    }

    if (minDiscount) {
        query = query.where("discountPersent").gt(minDiscount);
    }

    if (stock) {
        if (stock === "in_stock") {
            query = query.where("quantity").gt(0);
        } else if (stock === "out_of_stock") {
            query = query.where("quantity").lte(0);
        }
    }

    if (sort) {
        const sortDirection = sort === "price_high" ? -1 : 1;
        query = query.sort({ discountedPrice: sortDirection });
    }

    const totalProducts = await Product.countDocuments(query);
    const skip = (pageNumber - 1) * pageSize;
    query = query.skip(skip).limit(pageSize);

    const products = await query.exec();
    const totalPages = Math.ceil(totalProducts / pageSize);

    return { content: products, currentPage: pageNumber, totalPages };
}

async function createMultipleProduct(products) {
    for(let product of products){
        await createProduct(product)
    }
}

module.exports={
    createProduct,
    deleteProduct,
    updateProduct,
    getAllProducts,
    findProductById,
    createMultipleProduct
}