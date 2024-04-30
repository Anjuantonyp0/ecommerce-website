const { Category } = require("../models/categorySchema");
const { Product } = require("../models/productSchema");
const { User } = require("../models/userSchema");
let editCat = ''

const getCategory = async (req, res) => {
  try {
    const categories = await Category.find({ active: true });
    if (categories.length > 0) {
      return categories;
    } else {
      console.log("category not available");
    }
  } catch (error) {
    console.log(error.message);
  }
};

// ---------------------------------------------------------------------------------------------------------------------------------------
// =========================================================== ADMIN  SIDE===============================================================>
// ---------------------------------------------------------------------------------------------------------------------------------------




// ------------------------------------------------------------PRODUCT MANAGEMENT IN ADMIN SIDE------------------------------------------>

  module.exports.productMg = async (req, res) => {
    try {
      const product = await Product.find().populate('category');
      console.log("Product: ", product);
      res.render("admin/product-mg", { product: product });
    } catch (error) {
      console.log(error.message);
    }
  },



// ------------------------------------------------------ADD PRODUCT AND REDIRECT TO PRODUCT MANAGEMENT -------------------------------->

  module.exports.addProduct = async (req, res) => {
    try {

      const image = req.files.map((file) => ({ url: file.filename }));

      const newProduct = new Product({
        name: req.body.name,
        price: req.body.price,
        category: req.body.category,
        stock: req.body.stock,
        description: req.body.description,
        image: image,
      });

      const saved = await newProduct.save();

      if (saved) {
        res.redirect("/admin/product-mg");
      } else {
        console.log("product adding failed...");
      }
    } catch (error) {
      console.log(error.message);
    }
  },


// --------------------------------------------------------CATEGORY MANAGEMENT IN ADMIN SIDE-------------------------------------------->

  module.exports.categoryMg = async (req, res) => {
    try {
      const category = await Category.find();
      res.render("admin/category-mg", { category: category, message: '' });
    } catch (error) {
      console.log(error.message);
    }
  },


// ----------------------------------------------CATEGORY UPDATE AND REDIRECT TO CATEGORY MANAGEMENT------------------------------------>

  module.exports.updateCategory =  async (req, res) => {
    try {
      const catId = req.params.id;
      const category = await Category.findOne({ _id: catId });
  
      const existCategory = await Category.findOne({ categoryName: req.body.categoryName });
      if (!existCategory) {
        const editCategory = await Category.findOneAndUpdate(
          { _id: catId },
          {
            $set: {
              categoryName: req.body.categoryName,
            },
          }
        );
        console.log(editCategory);
        res.redirect("/admin/category-mg");

      } else {
        editCat = 'category name already exists'
        res.render("admin/editCategoryPage", { category: category, editCat: editCat });
        console.log("category not edited");
      }


    } catch (error) {
      console.log(error.message);
    }
  },


  // ------------------------------------------------------------EDIT CATEGORY IN CATEGORY  MANAGEMENT --------------------------------->

  module.exports.editCategory = async (req, res) => {
    try {
      const id = req.params.id;


      const category = await Category.findOne({ _id: id });

      if (category) {
        editCat = ''
        res.render("admin/editCategoryPage", { category: category, editCat: editCat });
      } else {
        console.log("category not found !");
      }
    } catch (error) {
      console.log(error.message);
    }
  },


  // ------------------------------------------------------------ADD CATEGORY IN CATEGORY MANAGEMENT ----------------------------------->

  module.exports.addCategory =  async (req, res) => {
    try {
      const existingCategory = await Category.findOne({
        categoryName: req.body.category,
      });


      const category = await Category.find();

      if (existingCategory) {
        return res
          .status(400)
          .render("admin/category-mg", {
            message: "Category already exists",
            category,
          });
      }
      const saveCategory = new Category({
        categoryName: req.body.category,
      });

      const saved = await saveCategory.save();
      if (saved) {
        res.redirect("/admin/category-mg");
      } else {
        res.json("error saving category...");
      }
    } catch (error) {
      console.log(error.message);
    }
  },


  // ----------------------------------------------------------ADD PRODUCT PAGE IN PRODUCT MANAGEMENT----------------------------------->

  module.exports.addProductPage = async (req, res) => {
    try {
      const category = await Category.find({});
      res.render("admin/add-product-page", { category: category });
    } catch (error) {
      console.log(error.message);
    }
  },


  // ------------------------------------------------------------EDIT PRODUCT IN PRODUCT MANAGEMENT ------------------------------------->

  module.exports.EditProductPage = async (req, res) => {
    try {
      const id = req.params.id;
      if (!id) {
        res.status(400).send("Invalid product ID");
      }
      const category = await Category.find({});
      const product = await Product.findById(id).populate('category');
      if (!product) {
        res.status(404).send("Product not found");
      }
      res.render("admin/editProductPage", {
        title: "Edit User",
        product: product,
        admin: true,
        category,
      });
    } catch (error) {
      console.log(error.message);
    }
  },


  // ------------------------------------------------------------UPDATE PRODUCT AND REDIRECT PRODUCT MANAGEMENT -------------------------->

  module.exports.updateProduct = async (req, res) => {
    try {
      const { name, category, price, stock, description } = req.body;
      const images = req.files.map(file => ({ url: file.filename }));
  
      const existingProduct = await Product.findById(req.params.id);
      if (!existingProduct) {
        return res.status(404).send("Product not found");
      }
  
      existingProduct.name = name;
      existingProduct.category = category;
      existingProduct.price = price;
      existingProduct.stock = stock;
      existingProduct.description = description;
      existingProduct.image = images.length > 0 ? images : existingProduct.image;
  
      const updatedProduct = await existingProduct.save();
      res.redirect("/admin/product-mg");
    } catch (error) {
      console.log(error.message);
      res.status(500).send("Internal Server Error");
    }
  };
  

  // --------------------------------------------------------DELETE PRODUCT AND REDIRECT INTO PRODUCT MANAGEMENT ------------------------->

  module.exports.deleteProduct = async (req, res, next) => {
    try {
      const id = req.params.id;

      const product = await Product.findByIdAndDelete(id).exec();

      if (product && product.image1 && product.image2) {
        try {
          fs.unlinkSync("./uploads/" + product.image1);
          fs.unlinkSync("./uploads/" + product.image2);
        } catch (err) {
          console.error(err);
        }
      }

      res.redirect("/admin/product-mg");
    } catch (error) {
      console.log(error.message);
    }
  },


  // ----------------------------------------------------CATEGORY ACTIVATE AND REDIRECT INTO CATEGORY MANAGEMENT------------------------->

  module.exports.categoryActivate =  async (req, res) => {
    try {
      const id = req.params.id;

      const categoryactivate = await Category.findOneAndUpdate(
        { _id: id },
        {
          $set: {
            active: true,
          },
        }
      );

      if (categoryactivate) {
        res.redirect("/admin/category-mg");
      } else {
        console.log("category activation failed..");
      }
    } catch (error) {
      console.log(error.message);
    }
  },


  // -------------------------------------------------CATEGORY DEACTIVATE AND REDIRECT INTO CATEGORY MANAGEMENT-------------------------->

  module.exports.categoryDeactivate = async (req, res) => {
    try {
      const id = req.params.id;

      const categorydeactivate = await Category.findOneAndUpdate(
        { _id: id },
        {
          $set: {
            active: false,
          },
        }
      );

      if (categorydeactivate) {
        res.redirect("/admin/category-mg");
      } else {
        console.log("category deactivation failed..");
      }
    } catch (error) {
      console.log(error.message);
    }
  },


   // -------------------------------------------------CATEGORY DELETE AND REDIRECT INTO CATEGORY MANAGEMENT-------------------------->
 
  module.exports.categoryDelete = async (req, res) => {
    try {
      const id = req.params.id;
  
      const categoryactive = await Category.findOneAndUpdate(
        { _id: id },
        {
          $set: {
            isDeleted: true,
            active:false
          },
        }
      );
  
      if (categoryactive) {
        res.redirect("/admin/category-mg");
      } else {
        console.log("category activation failed..");
      }
    } catch (error) {
      console.log(error.message);
    }
  },


    // -------------------------------------------------ADD CATEGORY OFFER AND REDIRECT CATEGORY MANAGEMENT-------------------------->

  module.exports.addCategoryOffer =  async (req, res) => {
    try {
      const { category, offer } = req.body;
      console.log(req.body.category);
      const categoryExist = await Category.findOneAndUpdate(
        { _id: category }, 
        { $set: { offer: parseInt(offer) } },
        { new: true } 
      );
  
      if (categoryExist) {
        // Fetch products belonging to the specified category
        const products = await Product.find({ category: categoryExist._id }).populate("category");
      
        // Iterate through each product
        for (const product of products) {
          // Calculate the offer for each product
          const offerGot = product.price * categoryExist.offer / 100;
          
          // Update the original price and price of each product
          product.orginalPrice = product.price;
          product.price -= offerGot;
          
          // Save the updated product
          await product.save();
        }
      
        // Redirect after updating all products
        res.redirect('/admin/category-mg');
      } else {
        console.log("Category not found");
        // You may want to handle this case by sending an appropriate response
        res.status(404).send("Category not found");
      }
      
    } catch (error) {
      console.error("Error adding category offer:", error);
      // You may want to handle this error by sending an appropriate response
      res.status(500).send("Internal server error");
    }
  }
  
  


// ---------------------------------------------------------------------------------------------------------------------------------------
// =========================================================== USER  SIDE===============================================================>
// ---------------------------------------------------------------------------------------------------------------------------------------




// -------------------------------------------------RENDER PRODUCT LIST ----------------------------------------------------------------->

module.exports.categoryList = async (req, res) => {
  try {
    const id = req.query.id;
    const product = await Product.find({ category: id }).populate("category");
    const category = await getCategory();
    res.render("user/productList", { product: product, category });
  } catch (error) {
    console.log(error.message);
  }
};


// -------------------------------------------------RENDER PRODUCT DETAIL-------------------------------------------------------------->

module.exports.productDetail = async (req, res) => {
  try {
    const id = req.query.id;
    const product = await Product.findOne({ _id: id }).populate("category");
    const category = await getCategory();
    res.render("user/productDetail", { product: product, category, user: true });
  } catch (error) {
    console.log(error.message);
  }
};


// -------------------------------------------------FILTER PRODUCT FETCH---------------------------------------------------------------->

module.exports.filterProductAjax = async (req, res) => {
  try {

    const price = req.body.price;
    const id = req.body.categoryId;

    console.log(price + "            " + id);

    const product = await Product.find({})

    const productCat = await Product.find({ category: id }).populate("category");

    let products = [];



    if (price !== undefined && id === undefined) {
      if (price < 200) {
        products = product.filter((value) => value.price >= 100 && value.price <= 200);
      } else if (price < 300) {
        products = product.filter((value) => value.price >= 200 && value.price <= 300);
      } else if (price < 400) {
        products = product.filter((value) => value.price >= 300 && value.price <= 400);
      } else if (price < 500) {
        products = product.filter((value) => value.price >= 400 && value.price <= 500);
      } else if (price < 600) {
        products = product.filter((value) => value.price >= 500 && value.price <= 600);
      } else if (price < 700) {
        products = product.filter((value) => value.price >= 600 && value.price <= 700);
      } else if (price < 800) {
        products = product.filter((value) => value.price >= 700 && value.price <= 800);
      } else if (price < 900) {
        products = product.filter((value) => value.price >= 800 && value.price <= 900);
      }
      res.send({ products: products });
      console.log("h00000000000000000000000000000iiiiiiiiiiiiiiiiiiiiiiiii")
    } else if (price !== undefined && id !== undefined) {


      if (price < 200) {
        products = productCat.filter((value) => value.price >= 100 && value.price <= 200);
      } else if (price < 300) {
        products = productCat.filter((value) => value.price >= 200 && value.price <= 300);
      } else if (price < 400) {
        products = productCat.filter((value) => value.price >= 300 && value.price <= 400);
      } else if (price < 500) {
        products = productCat.filter((value) => value.price >= 400 && value.price <= 500);
      } else if (price < 600) {
        products = productCat.filter((value) => value.price >= 500 && value.price <= 600);
      } else if (price < 700) {
        products = productCat.filter((value) => value.price >= 600 && value.price <= 700);
      } else if (price < 800) {
        products = productCat.filter((value) => value.price >= 700 && value.price <= 800);
      } else if (price < 900) {
        products = productCat.filter((value) => value.price >= 800 && value.price <= 900);
      }
      console.log("heeeeeeeeeeeeeeeeyyyyyyyyyy")
      res.send({ products: products });


    } else if (price === undefined && id !== undefined) {

      products = productCat;
      console.log("helllllllllllllllllllllllloooooooooooooooooooo")
      res.send({ products: products });
    } else {
      products = product
      console.log("All productsssssssssss")
      res.send({ products: products });
    }


  } catch (error) {
    console.log(error.message);
    console.log('try cach error in filterProductAjax')
  }
};


// -------------------------------------------------PRODUCT SEARCH----------------------------------------------------------------------->

module.exports.productSearch = async (req, res) => {
  try {
    let payload = req.body.payload.trim();
    let search = await Product.find({
      name: { $regex: new RegExp("^" + payload + ".*", "i") },
    }).exec();

    search = search.slice(0, 10);

    console.log(search);
    res.send({ payload: search });
  } catch (error) {
    console.log("Try catch error in  productSearch ");
    console.log(error.message);
  }
};


// -------------------------------------------------PAGINATION IN PRODUCT----------------------------------------------------------------->

  module.exports.productPaginate =  async (req, res) => {
  try {
    const { page, pageSize } = req.body;
    console.log(page, pageSize)
    const skip = (page - 1) * pageSize;
    const totalPage = await Product.find().length
    const products = await Product.find()
      .skip(skip)
      .limit(pageSize);
    const pageCount = Math.floor( totalPage/5)
    res.json({ products,page:page+1,pageCount });
  } catch (error) {
    console.error('Error fetching paginated data:', error);
    res.status(500).json({ error: 'Internal Server Error'});
}
};


// -------------------------------------------------PRODUCT SORT------------------------------------------------------------------------->

module.exports.productSort= async (req, res) => {
  try {
    const sortOption = req.query.sort || 'name'; 

    let products = await Product.find().sort(sortOption).exec();

    products = products.slice(0, 10);

    res.send({ payload: products });
  } catch (error) {
    console.log("Error in productSort route");
    console.log(error.message);
    res.status(500).send({ error: 'Internal Server Error' });
  }
};

