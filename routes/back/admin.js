const express = require('express')
const router = express.Router()
const Category = require('../../models/Category')
const Post = require('../../models/Post')
const Comment = require('../../models/Comment')
const path = require('path')


router.get('/dashboard',(req,res) => {
    res.render('back/admin',{layout:'admin'})
})

router.get('/categories',(req,res) => {
    Category.find({}).lean().sort({$natural:-1}).then(categories => {
        res.render('back/category',{layout:'admin',categories})
    })
    
})

router.delete('/category/:id',(req,res) => {
    Category.remove({_id:req.params.id}).then(() => {
        req.session.flashMesage = {
            type:'alert alert-success',
            message:'You have deleted category successfully'
        }
        res.redirect('/admin/categories')
    })
})

router.post('/category',(req,res) => {
    
    let slug = req.body.category.toLowerCase().split(' ').join('-')
    Category.create({
        category:req.body.category,
        slug:slug
    }).then(() => {
        req.session.flashMesage = {
            type:'alert alert-success',
            message:'You have added category successfully'
        }
        res.redirect('/admin/categories')
    })
    
    
})

router.get('/posts',(req,res) => {
    const postPerPage = 3
    const page = req.query.page || 1
    Post.find({}).populate({path:'category',model:Category})
    .skip((postPerPage * page) - postPerPage)
        .limit(postPerPage)
    .sort({$natural:-1}).lean().then(posts => {
        Post.countDocuments().then(postCount => {
            Category.aggregate([{
                $lookup: {
                    from: 'posts',
                    localField:'_id',
                    foreignField:'category',
                    as:'posts'
                }            
            },
            {
                $project: {
                    _id:1,
                    category:1,
                    num_of_posts: {$size:'$posts'}
                }
            }
            
        ]).then((categories) => {
              
                
                res.render('back/posts',
                {layout:'admin',posts,categories,
                current:parseInt(page),
                pages:Math.ceil(postCount/postPerPage)
            
            })
            })
            
        })
    })
    
})

router.get('/post/new',(req,res) => {
    Category.find({}).lean().then(categories => {
        res.render('back/addpost',{layout:'admin',categories})
    })
   
})

router.post('/post/create',(req,res) => {
    let img = req.files.img
    let slug = req.body.title.toLowerCase().split(' ').join('-')
    let mimetype = req.files.img.mimetype
    let gettype =mimetype.split('/')
    
    

    img.mv(path.resolve(__dirname,'../../public/front/img/post',`${slug}.${gettype[1]}`))
    Post.create({
        title:req.body.title,
        slug:slug,
        img:`/front/img/post/${slug}.${gettype[1]}`,
        user:req.session.userId,
        category:req.body.category,
        content:req.body.content,
        featured:req.body.featured,
    }).then(() => {
        req.session.flashMesage = {
            type:'alert alert-success',
            message:'You have added post successfully'
        }
        res.redirect('/admin/posts')
    })
})


router.get('/post/edit/:id',(req,res) => {
    Post.findOne({_id:req.params.id}).populate({path:'category',model:Category}).lean().then((post) => {
        Category.find({}).lean().then((categories) => {
            res.render('back/edit',{layout:'admin',post,categories})
        })
    })
})

router.put('/post/update/:id',(req,res) => {

   Post.findOne({_id:req.params.id}).then(post => {
       if (req.files) {
        let img = req.files.img
        let slug = req.body.title.toLowerCase().split(' ').join('-')
        let mimetype = req.files.img.mimetype
        let gettype =mimetype.split('/')
        img.mv(path.resolve(__dirname,'../../public/front/img/post',`${slug}.${gettype[1]}`))
        post.title = req.body.title
        post.content = req.body.content
        post.img =`/front/img/post/${slug}.${gettype[1]}`
        post.category = req.body.category
        post.featured = req.body.featured
        post.save().then((post) => {
            res.redirect('/admin/posts')
        })
       }
       else {

        post.title = req.body.title
        post.content = req.body.content
        post.category = req.body.category
        post.featured = req.body.featured
        post.save().then((post) => {
            res.redirect('/admin/posts')
        })

       }
   })

    
})



router.delete('/post/:id',(req,res) => {
    Post.remove({_id:req.params.id}).then(() => {
        req.session.flashMesage = {
            type:'alert alert-success',
            message:'You have deleted posts successfully'
        }
        res.redirect('/admin/posts')
    })
})

router.get('/comments',(req,res) => {
    Comment.find({}).sort({$natural:-1}).populate({path:'post',model:Post}).lean().then(comments => {
        res.render('back/comments',{layout:'admin',comments})
    })
    
})


router.put('/comment/:id',(req,res) => {
    Comment.findOne({_id:req.params.id}).then(post => {
        post.accepted = req.body.accepted
        post.save().then((post) => {
            req.session.flashMesage = {
                type:'alert alert-success',
                message:'You have changed comment status successfully'
            }
            res.redirect('/admin/comments')
            
        })
    })
})

router.delete('/comment/delete/:id',(req,res) => {
    Comment.remove({_id:req.params.id}).then(() => {
        req.session.flashMesage = {
            type:'alert alert-success',
            message:'You have deleted comment successfully'
        }
        res.redirect('/admin/comments')
    })
})


module.exports = router