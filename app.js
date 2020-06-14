const express = require('express')
const app = express()
const port = 3000
const exphbs  = require('express-handlebars');
const mongoose = require('mongoose');
const bodyParser = require('body-parser')
const session = require('express-session')
const MongoStore = require('connect-mongo')(session);
const methodOverride = require('method-override')
const fileUpload = require('express-fileupload')
const {truncate,paginate,generateDate} = require('./helpers/helpers')
app.use(session({
  secret: '5ee28c74aca09108242e0ae7',
  resave: false,
  saveUninitialized: true,
  store: new MongoStore({ mongooseConnection: mongoose.connection })


 
}))


mongoose.connect('mongodb://localhost/newblog', {
  useNewUrlParser: true,
  useUnifiedTopology: true
})

app.use(fileUpload())

// parse application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({ extended: false }))
 
// parse application/json
app.use(bodyParser.json())

const hsb = exphbs.create({
  helpers:{
    truncate,
    paginate,
    generateDate
    
  }
})

app.engine('handlebars', hsb.engine);
app.set('view engine', 'handlebars');

app.use(express.static('public'))

app.use(methodOverride('_method'))





app.use((req,res,next) => {
  if (req.session.userId) {
    res.locals = {
      displayLink:true,
      userName:req.session.userName 
    }
  }else {
    res.locals = {
      displayLink:false
    }
  }
  next()
})

app.use((req,res,next) => {
  res.locals.flashMessage =req.session.flashMesage
  delete req.session.flashMesage
  next()
})


const permission = (req,res,next) => {
  if (req.session.userId && req.session.isAdmin) {
    next()
  }
  else{
    res.redirect('/login')
  }
}


const front = require('./routes/front/main')
const back = require('./routes/back/admin')
app.use('/admin',permission)

app.use('/',front)
app.use('/admin',back)

app.listen(port, () => console.log(`Example app listening at http://localhost:${port}`))