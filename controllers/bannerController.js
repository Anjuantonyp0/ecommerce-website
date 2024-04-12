const { Banner } = require("../models/bannerSchema");
const Category = require("../models/categorySchema");
const getCategory = async function () {
    try {
      const categories = await Category.find({});
      if (categories.length > 0) {
        return categories;
      } else {
        throw new Error("Couldn't find categories");
      }
    } catch (error) {
      console.log(error.message);
    }
  };


// -----------BANNER RENDERING ----------------->
module.exports.addBannerPage = async(req,res)=>{
    try {
        const banner = await Banner.find();
        // const headCategory = await getCategory();
        res.render('admin/add-banner', {banner: banner});
    } catch (error) {
        console.log(error.message);
        console.log('Try catch error in addBannerPage ');
    }
}


// -----------BANNER LIST RENDERING ----------------->
module.exports.bannerList = async(req,res)=>{
    try {
        const banner = await Banner.find();
        res.render('admin/banner-manage',{banners: banner});
    } catch (error) {
        console.log(error.message);
        console.log('Try catch error in bannerList ');
    }
}


// -----------ADD BANNER ----------------->
module.exports.addBanner = async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).send('Please upload an image');
                       }
        const { filename } = req.file; 
        const banner = new Banner({ image: filename,description: req.body.description || '' }); 
        const savedBanner = await banner.save();
        if (savedBanner) {
            return res.redirect('/admin/banner-mg');
         } else {
            console.log('Error saving new banner');
            return res.status(500).send('Error saving new banner');
           }
    } catch (error) {
        console.log("Try catch error in addBanner 🤷‍♂️📀🤷‍♀️");
        console.log(error.message);
    }
};


// -----------DELETE BANNER ----------------->
module.exports.deleteBanner = async(req,res)=>{
    try {
        const id = req.params.id;
        const bannerDelete = await Banner.deleteOne({_id: id});
        if(bannerDelete){
            res.redirect('/admin/banner-mg')
        }
    } catch (error) {
        console.log("Try catch error in deleteBanner 🤷‍♂️📀🤷‍♀️");
        console.log(error.message); 
    }
}

