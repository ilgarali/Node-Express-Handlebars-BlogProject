const express = require('express')
const router = express.Router()
const User = require('../../models/User')
const md5 = require('md5')
const Post = require('../../models/Post')
const Category = require('../../models/Category')
const Comment = require('../../models/Comment')


router.get('/', (req, res) => {
   const postPerPage = 4
   const page = req.query.page || 1
   const count = 3
   const random = Math.floor(Math.random() * count)
   Post.find({}).lean().sort({ $natural: -1 }).skip((postPerPage * page) - postPerPage)
      .limit(postPerPage).populate({ path: 'category', model: Category }).then(posts => {
         Post.countDocuments().then(postCount => {
            Category.aggregate([{
               $lookup: {
                  from: 'posts',
                  localField: '_id',
                  foreignField: 'category',
                  as: 'posts'
               }
            },
            {
               $project: {
                  _id: 1,
                  category: 1,
                  slug:1,
                  num_of_posts: { $size: '$posts' }
               }
            }

            ]).then((categories) => {
               Post.find({ featured: true }).lean().sort({ $natural: -1 }).populate({ path: 'category', model: Category })
                  .then(featured => {
                        Post.find().skip(random).limit(3).lean().populate({path:'user',model:User})
                        .then(randoms => {
                        
                           Post.find({}).skip(random).populate({path:'category',model:Category}).limit(1).lean().then(first => {
                             
                              
                              res.render('front/index',
                              {
                                 layout: 'main',
                                 posts, categories, featured,
                                 current: parseInt(page),
                                 pages: Math.ceil(postCount / postPerPage),
                                 randoms,first
      
                              })

                           })
                        
                        })
                     

                  })


            })

         })
      })

})


router.get('/category/:slug', (req, res) => {
   const count = 3
   const random = Math.floor(Math.random() * count)

   Category.findOne({slug:req.params.slug}).lean().then(category => {
      Post.find({'category':category._id}).lean().sort({$natural:-1}).populate({path:'category',model:Category}).then(posts => {
         Category.aggregate([{
            $lookup: {
               from: 'posts',
               localField: '_id',
               foreignField: 'category',
               as: 'posts'
            }
         },
         {
            $project: {
               _id: 1,
               category: 1,
               slug:1,
               num_of_posts: { $size: '$posts' }
            }
         }
   
         ]).then(categories => {
            Post.find({}).skip(random).limit(3).lean().then(randoms => {
               res.render('front/index',{category,posts,categories,randoms})
            })
            
         })
       
         
      })
   })
})


router.get('/post/:slug', (req, res) => {
   const count = 3
   const random = Math.floor(Math.random() * count)

   Post.findOne({ slug: req.params.slug }).lean().populate({ path: 'category', model: Category })
   .populate({path:'user',model:User})
   .then(post => {
      Category.aggregate([{
         $lookup: {
            from: 'posts',
            localField: '_id',
            foreignField: 'category',
            as: 'posts'
         }
      },
      {
         $project: {
            _id: 1,
            category: 1,
            slug:1,
            num_of_posts: { $size: '$posts' }
         }
      }

      ]).then(categories => {
         Post.find({}).skip(random).limit(3).lean().then(randoms => {
            Post.find({_id:{$gt: post._id}}).sort({_id:1}).limit(1)
            .populate({path:'category',model:Category})
            .lean().then(next => {
              
               Post.find({_id:{$lt: post._id}}).sort({_id:-1}).limit(1)
               .populate({path:'category',model:Category})
               .lean().then(prev => {
                  Comment.find({
                     post:post._id,
                     accepted:true
                  }).sort({$natural:-1}).lean().then(comments => {
                     
                     
                   
                     res.render('front/single', { layout: 'main', post, categories,randoms,next,prev,comments })
                     
                  })
               
                  
               })
            })
            
         })
      })

   })
})

router.get('/register', (req, res) => {
   res.render('front/register')
})

router.post('/register', (req, res) => {
   let hashed = md5(req.body.password)
   User.create({
      username: req.body.username,
      email: req.body.email,
      password: hashed
   }).then(() => {
      res.redirect('/')
   })
})

router.get('/login', (req, res) => {
   res.render('front/login')
})


router.post('/login', (req, res) => {
   const email = req.body.email
   const password = md5(req.body.password)
   User.findOne({ email: email }, (error, user) => {
      if (user) {
         if (user.password === password) {
            req.session.userId = user._id
            req.session.isAdmin = user.is_admin
            req.session.userName = user.username
            res.redirect('/')
         } else {
            res.redirect('/login')
         }
      } else {
         res.redirect('/register')
      }
   })
})


router.get('/logout', (req, res) => {
   req.session.destroy(() => {
      res.redirect('/login')
   })
})

router.post('/comment',(req,res) => {
   Comment.create(req.body).then((comment) => {
      
      backURL=req.header('Referer') || '/';
      req.session.flashMesage = {
         type:'alert alert-success',
         message:'We have received your comment successfully'
     }
       res.redirect(backURL);
   })
})



function escapeRegex(text) {
   return text.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, "\\$&");
};

router.get("/search", (req, res) => {
   const count = 3
   const random = Math.floor(Math.random() * count)
   if (req.query.look) {
       const regex = new RegExp(escapeRegex(req.query.look), 'gi');
       Post.find({ "title": regex }).populate({ path: 'author', model: User }).populate({path:'category',model:Category})
           .sort({ $natural: -1 }).lean().then((posts) => {
               Category.aggregate([{
                   $lookup: {
                       from: 'posts',
                       localField: '_id',
                       foreignField: 'category',
                       as: 'posts'
                   }
               },
               {
                   $project: {
                       _id: 1,
                       category: 1,
                       slug:1,
                       num_of_posts: { $size: '$posts' }
                   }
               }

               ]).then(categories => {
                  Post.find({}).skip(random).limit(3).lean().then(randoms => {
                     res.render('front/index', { posts, categories,randoms })
                  })
                   
               })

           })
   }
})




module.exports = router