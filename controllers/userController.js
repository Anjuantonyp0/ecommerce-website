const { User } = require("../models/userSchema");
const otpGenerator = require("otp-generator");
const nodemailer = require("nodemailer");
const { Category } = require("../models/categorySchema");
const { Address } = require("../models/addressSchema");
const { Product } = require("../models/productSchema");
const bcrypt = require('bcrypt');
const { updateQuantity } = require("./cartController");
const { Cart } = require("../models/cartSchema");
const { MongoCryptInvalidArgumentError } = require("mongodb");
const Coupon = require("../models/couponSchema");
const Wishlist = require("../models/wishlistSchema");
const { Banner } = require("../models/bannerSchema");




const getCategory = async (req, res) => {

    try {

        const categories = await Category.find({  });
        console.log('got the catogory')
        if (categories) {

            return categories;

        } else {

            console.log("category not available")
        }
    } catch (error) {

        console.log(error.message)

    }
}

// console.log(
// getCategory()

// )
// ---------------------------------------------------------------------------------------------------------------------------------------
// =========================================================== USER  SIDE===============================================================>
// ---------------------------------------------------------------------------------------------------------------------------------------



//---------------------------------------------- FIND AND UPDATE COUPONS THAT HAVE EXPIRED--------------------------------------------->
 
  const checkAndUpdateExpiredCoupons = async () => {
    try {
        const currentDate = new Date();
        const coupons = await Coupon.find({ expirationDate: { $lte: currentDate }, expired: false });
  
        if (coupons.length > 0) {
            const expiredCoupons = await Coupon.updateMany(
                { _id: { $in: coupons.map(coupon => coupon._id) } },
                { $set: { expired: true } }
            );
  
            if (expiredCoupons) {
                console.log("Coupons expired:", expiredCoupons.nModified);
            }
        } else {
            console.log("No coupons found that have expired.");
        }
    } catch (error) {
        console.error("Error checking and updating expired coupons:", error);
    }
  };


//--------------------------------------------------------- RENDERING SIGNUP PAGE-------------------------------------------------------=>

module.exports.signupPage = (req, res) => {

    try {

        let userAlertmsg;

        if (req.query.message) {

            userAlertmsg = req.query.message;

        }

        res.render('user/signup', { userAlertmsg })

    } catch (error) {

        console.log(error.message)
    }
}


//--------------------------------------------------------- RENDERING OTP PAGE-------------------------------------------------------=>

module.exports.signup = async (req, res) => {

    try {

        const { name, email, phone, password } = req.body;


        //... check if the email already exist.....>

        const checkEmail = await User.findOne({ email: email });

        if (checkEmail) {

            return res.redirect("/?message=email already exists")

        } else {

            const generateOtp = () => {

                return otpGenerator.generate(6, { uppercase: false, specialChars: false });

            };

            const OTP = generateOtp();

            const user = new User({
                name: name,

                email: email,

                phone: phone,

                password: password,

                otp: OTP

            });

            const userData = await user.save();

            const sendVerifyMail = async (fullname, useremail, otp) => {
                try {
                    const transporter = nodemailer.createTransport({
                        host: 'smtp.gmail.com',
                        port: 587,
                        secure: false,
                        requireTLS: true,
                        auth: {
                            user: 'anjupulikkottil95@gmail.com',
                            pass: 'nrlc kyxb qpqu cgga',
                        },
                    });

                    const mailOptions = {
                        from: 'anjupulikkottil95@gmail.com',
                        to: email,
                        subject: 'For Verification Mail',
                        html: `<p> Hi ${fullname}, Your OTP: ${otp}</p>`
                    };

                    const info = await transporter.sendMail(mailOptions);
                    console.log('Email has been sent:', info.response);
                    console.log(otp);
                } catch (error) {
                    console.log(error.message);
                }
            };


            await sendVerifyMail(name, email, OTP);

            resend = req.query.resend;
            const userd = await User.findById(req.query._id)

            // Redirect to OTP page
            res.render('user/otpPage', { name, email, user: userData, _id: userData._id, resend });

        }

    } catch (error) {
        console.log(error.message);
        res.render('user/signup', { message: "An error occurred during registration" });
    }

}


//---------------------------------------------------------GET OTP PAGE-------------------------------------------------------=>

module.exports.otpPage = async (req, res) => {
    try {

        const name = req.query.name,
            resend = req.query.resend;
        const userId = req.query._id;
        const userData = await User.findById(userId)

        res.render("user/otpPage", { _id: userId, user: userData, resend, name });
    } catch (error) {
        console.error("Error while resending OTP:", error);
        res.status(500).json({ error: "An error occurred while rendering otp page." });
    }
}


//--------------------------------------------------------- OTP VERIFCATION-------------------------------------------------------=>

module.exports.verifyOtp = async (req, res) => {
    try {

        const userId = req.params.userId;
        const user = await User.findOne({ _id: userId });
        if (user.otp === req.body.otp) {
            const updateInfo = await User.updateOne({ _id: userId }, { $set: { verify: true } });
            res.redirect('/login')
        } else {
            res.redirect('/')
        }

    } catch (error) {
        console.log("Verify-otp try catch error !!");
        console.log(error.message)
    }
};



//--------------------------------------------------------- RENDERING LOGIN PAGE-------------------------------------------------------=>

module.exports.loginPage = (req, res) => {
    try {

        res.render('user/loginPage')

    } catch (error) {
        console.log(error.message)
    }
}



//--------------------------------------------------------- VERIFY LOGIN --------------------------------------------------------------=>
module.exports.loginVerify = async (req, res) => {
    const username = req.body.username;
    const password = req.body.password.toString();
    console.log(username,password)
    const user = await User.findOne({ email: req.body.email, password: req.body.password });

    console.log(user)
    try {
        if (user && user.verify) {
            req.session.user = user
            console.log(req.session)
            res.redirect('/home');
        } else {
            res.redirect('/login')
        }
    } catch (error) {
        console.log(error.message)
    }
}



//--------------------------------------------------------- RENDERING HOME PAGE-------------------------------------------------------=>

module.exports.home = async (req, res) => {

    try {
        let user = req.session.user;
        const category = await getCategory();
        const banner = await Banner.find({});``

        const products = await Product.find().limit(8);
        console.log("This is the cat daata ====>>>",category)
        res.render('user/homePage', {products: products, banners: banner, user: user, category })
        
    } catch (error) {
        console.log(error.message)
    }
}


//--------------------------------------------------------- RENDERING SHOP PAGE-------------------------------------------------------=>

module.exports.shop = async (req, res) => {

    try {
        let user = req.session.user;
        const category = await getCategory();
        const product = await Product.find()
        res.render('user/shop', { user: user, category, product })
    } catch (error) {
        console.log(error.message)
    }
}


//--------------------------------------------------------- RENDERING PROFILE PAGE-------------------------------------------------------=>

module.exports.profile = async (req, res) => {
    try {
        const id = req.session.user;
        const category = await Category.find({ active: true });

        // const address = await address.findOne({userId});
        console.log(id)
        const user = await User.findById(id).populate('address');
        var address = await Address.findOne({ userId: id });
        console.log(user)
        if (!user) {
            console.error("User not found");
            return res.status(404).send("User not found")
        }
        res.render('user/profile', { user: user, category: category, address: address });


    } catch (error) {
        console.error('error in profile controller:', error.message);
        res.status(500).send('internal server Error')

    }
}


//--------------------------------------------------------- RENDERING EDIT PROFILE PAGE-------------------------------------------------------=>

module.exports.editProfile = async (req, res) => {
    try {
        const id = req.session.user._id;
        const category = await Category.find({ active: true });

        if (!id) {
            res.status(400).send("invalid user id")
        }
        const user = await User.findById(id).exec()
        if (!user) {
            res.status(404).send("user not found")
        }
            res.render('user/editProfilePage',{user: user, category:category})
        

    } catch (error) {
        console.log(error.message)
    }
}


//--------------------------------------------------------- UPDATE AND REDIRECT INTO PROFILE PAGE---------------------------------------=>

module.exports.updateProfile = async (req, res) => {
    try {
        const id = req.session.user._id;
        if (!id) {
            return res.status(400).send("invalid userid")
        }
        const user = await User.findById(id)
        if (!user) {
            return res.status(404).send("user not found")

        }
        const newData = await User.updateOne({ _id: id },
            {
                name: req.body.name,
                email: req.body.email,
                phone: req.body.phone
            })
        console.log(newData)
        res.redirect("/profile")
    } catch (error) {
        console.log(error.message)
    }
}


//--------------------------------------------------------- ADD ADDRESS AND REDIRECT TO PROFILE-------------------------------------------------------=>

module.exports.addAddress = async (req, res) => {
    try {
        // Assuming you have a middleware to parse the request body, like body-parser or express.json
        const { name, houseName, postOffice, district, pin } = req.body;
        const userId = req.session.user._id;

        const address = await Address.findOne({ userId: userId })

        if (address) {

            const addressAdd = {
                name: req.body.name,
                houseName: req.body.houseName,
                postOffice: req.body.postOffice,
                district: req.body.district,
                pin: req.body.pin
            }

            address.addresses.push(addressAdd);

            const save = await address.save();
            if (save) {
                console.log("address pushed sucessfully");
                res.redirect('/profile'); // Redirect to the user profile page or any other desired page

            } else {
                console.log('error pushing address')
            }
        }
        else {
            const newAddress = new Address({
                userId: userId,
                addresses: [{
                    name: req.body.name,
                    houseName: req.body.houseName,
                    postOffice: req.body.postOffice,
                    district: req.body.district,
                    pin: req.body.pin
                }]

            });

            const saveAddress = await newAddress.save();
        }

    } catch (error) {
        console.error(error);
        res.status(500).send('Internal Server Error');
    }
};


//--------------------------------------------------------- RENDERING ADD ADDRESS PAGE---------------------------------------------------=>

module.exports.addressAdd = async (req, res) => {
    const category = await Category.find({ active: true });

    res.render('user/addAddress',{category});
}


//--------------------------------------------------------- RENDERING EDIT ADDRESS PAGE-------------------------------------------------------=>

module.exports.editAddressPage = async (req, res) => {
    try {
        const addressId = req.params.id;
        const userId = req.session.user._id;
        const addressDb = await Address.findOne({ userId: userId });

        const address = addressDb.addresses.id(addressId);



        res.render('user/editAddressPage', { address })

    } catch (error) {
        console.error(error.message)
        res.status(500).send('internal Srver Error')
    }
}


//---------------------------------------------------------UPDATE ADDRESS AND REDIRECT INTO PROFILE-------------------------------------=>

module.exports.updateAddress = async (req, res) => {
    try {
        const id = req.session.user._id;

        const userAddress = await Address.findOne({ userId: id });
        const addressId = req.params.id

        if (userAddress) {
            //update the existing address information

            const editAddress = await Address.updateOne({ "addresses._id": addressId }, {
                $set: {
                    "addresses.$.name": req.body.name,
                    "addresses.$.houseName": req.body.houseName,
                    "addresses.$.postOffice": req.body.postOffice,
                    "addresses.$.district": req.body.district,
                    "addresses.$.pin": req.body.pin
                }
            })
            //Redirect to a page indicating succesful updtae or render the address page
            if (editAddress) {
                res.redirect('/profile');
            } else {
                console.log('error editing &  saving address');
            }
        }
    } catch (error) {
        console.error(error.message);
        res.status(500).send("internal server error")
    }
}


//--------------------------------------------------------- DELETE AND REDIRECT TO PROFILE----------------------------------------------=>

module.exports.deleteAddress = async (req,res) =>{
    
    try{
        const addressId = req.params.id;
        const deleteAddress =  await Address.findOneAndUpdate({ userId: req.session.user._id },
            { $pull: { addresses: { _id: addressId } } })
console.log(addressId);
console.log(deleteAddress);
console.log(req.session.user._id);


if(!deleteAddress){
            return res.status(400).json({message:'Address not found'});

        }else{
        res.redirect('/profile')
        }
    }catch(error){
        console.log(error);
        return res.status(500).json({message:'internal server error'})
    }
}



//--------------------------------------------------------- RENDERING CHANGE PASSWORD PAGE-------------------------------------------------------=>

module.exports.changePasswordPage = async (req, res) => {
    try {
        const id = req.session.user._id;
        const category = await Category.find({ active: true });

        if (!id) {
            res.status(400).send("invalid user id")
        }
        const user = await User.findById(id).exec()
        if (!user) {
            res.status(404).send("user not found")
        }
        res.render("user/changePassword", { user: user, category: category })
    }
    catch (error) {
        console.log(error.message)
    }
}


//--------------------------------------------------------- CHANGE PASSWORD AND REDIRECT TO PROFILE-------------------------------------=>

module.exports.changePassword = async (req, res) => {
    try {
        const id = req.session.user._id;
        console.log('id', id);
        const user = await User.findById(id);

        if (!user) {
            return res.status(404).send('User not found');
        }

        // Check if the new password and confirm new password match
        const newPassword = req.body.new_password;
        const confirmNewPassword = req.body.confirm_new_password;

        if (newPassword !== confirmNewPassword) {
            return res.status(400).send('New password and confirm new password do not match');
        }

        // Hash the new password
        // const hashedNewPassword = await bcrypt.hash(newPassword, 10);

        // Update the user's password in the database
        user.password = newPassword;
        // await User.findByIdAndUpdate(user,{$set:{password:hashedNewPassword}})
        await user.save();

        res.redirect('/profile'); // Redirect to the user's profile or any other page after successful password change
    } catch (error) {
        console.error(error.message);
        res.status(500).send('Internal Server Error');
    }
};


//--------------------------------------------------------- RENDERING VIEW ORDER DETAILES----------------------------------------------=>

module.exports.vieworderdetails = async (req, res) => {
    try {
        //constorderId = req.params.orderid;

        const category = await Category.find({ active: true });
        const userId = req.session.user_id;
        const order = await Order.find().populate('items.product');
        console.log(order);

        if (!order) {
            console.log("no order is available....")
        }

        console.log(order.items)
        // Render the order details page with the retrieved order
        res.render('user/vieworders', { order: order, user: userId, category: category });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
};


//--------------------------------------------------------- CHECKOUT------------------------------------------------------------------=>

// module.exports.checkoutp = async (req, res) => {
//     try {
//         const userId = req.session.user._id;
//         const cart = await Cart.findOne({ userId }).populate('items.product');
//         let totalAmount = 0;
//         const orderDetails = {
//             userId: userId,
//             items: [],
//             totalPrice: 0,
//         };
//         for (const cartItem of cart.items) {
//             const product = cartItem.product;
//             const quantity = cartItem.quantity;

//             // Assuming there is a 'price' property in the Product model
//             const productPrice = product.price;

//             // Calculate subtotal for each item
//             const subtotal = productPrice * quantity;

//             // Update total amount and add item to order details
//             totalAmount += subtotal;
//             orderDetails.items.push({
//                 product: product._id,
//                 quantity: quantity,
//                 subtotal: subtotal,
//             });
//         }

//         // Update the total price in the order details
//         orderDetails.totalPrice = totalAmount;

//         // You can save the order details to a separate Order model or process it as needed
//         // ...

//         // Clear the user's cart after placing the order
//         await Cart.findOneAndUpdate({ userId }, { $set: { items: [], totalPrice: 0 } });

//         // Send a response to the client
//         res.status(200).json({ message: 'Order placed successfully', orderDetails });
//     } catch (error) {
//         console.error(error);
//         res.status(500).json({ message: 'Server error' });
//     }
// }



//--------------------------------------------------------- REDIRECT TO LOGOUT-------------------------------------------------------=>

module.exports.logout = (req, res) => {
    try {
        req.session.user = null
        res.redirect('/login')
    } catch (error) {
        console.log(error.message)
    }
}




