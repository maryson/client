const axios = require('axios');
const express = require('express');
const mustache = require('mustache-express');
const bodyParser = require('body-parser');
const multer = require('multer');
const PDFdoc = require('pdfkit');
var nodemailer = require('nodemailer');
const storage = multer.diskStorage({
  destination : function(req, file, cb){
      cb(null, './uploads/');
  },
  filename : function(req, file, cb){
      cb(null, new Date().toISOString() + file.originalname);
  }
});
const upload = multer({storage : storage});

const app = express();
const fs = require('fs');
app.use(bodyParser.urlencoded({extended: true}));


app.engine('mustache', mustache());

app.set('view engine','mustache');
app.set('views',__dirname+'/views');


app.get('/', (req, res) => {
  res.redirect('/users/login');
    
});



app.get('/products/list', (req, res, next) => {
  
  axios({
      method:'get',
      url:'http://localhost:3000/products',
      responseType:'json'
    })
      .then(function(response) {
      //res.setHeader('Content-Type', 'application/json');
     // res.send(JSON.stringify(response.data));
        
     res.status(200).render('index', { "data" : response.data});
    }).catch(err => {
     
      if(err.errno === 'ECONNREFUSED')
      {
        console.log(err.errno);
        return res.send('cannot connect, check server');
      }
      else
      {
        res.redirect('/users/login');
      }
    
    
    });
});

app.get('/report',(req, res) => {
  axios({
    method:'get',
    url:'http://localhost:3000/report',
    responseType:'json'
  })
    .then(function(response) {
    
      
      
      if(response.data.length > 0)
      {
      var newref =response.data[Object.keys(response.data).length - 1].refno + 1;
      }
      else
      {
        var newref = 1000000;
      }
   res.status(200).render('report', { "data" : response.data, "newref" : newref});
  }).catch(err => {
   
    
    {
      console.log(err);
      return res.send('cannot connect, check server');
    }
   
  
  
  });

  
});


app.post('/report',(req, res) => {

  axios.post('http://localhost:3000/report', req.body)
  .then(function(response) {
  res.redirect('/report');
  
}).catch(err => {
 
    console.log(err);
});

});





app.get('/products/:productId',(req, res) =>{
  console.log(req.params.productId);

  axios.delete('http://localhost:3000/products/'+req.params.productId,{data:{foo:'b'}})
  .then(function(response) {
  
  res.redirect('/products/list');
}).catch(err => {
  if(err.errno === 'ECONNREFUSED')
  {
    console.log(err.errno);
    return res.send('cannot connect, check server');
  }
  else
  {
    console.log('you are not authorized');
    res.redirect('/users/login');
  }
});

});


app.get('/report/:reportId',(req, res) =>{
  console.log(req.params.reportId);

  axios.delete('http://localhost:3000/report/'+req.params.reportId)
  .then(function(response) {
  
  res.redirect('/report');
}).catch(err => {
  
  {
    console.log(err.errno);
    return res.send('cannot connect, check server');
  }
  
});

});



app.post('/user/login', (req, res, next) => {
  axios.post('http://localhost:3000/users/login', {
    email : req.body.email,
    password : req.body.password
}).then(function(response) {
  console.log(response.data);
  axios.defaults.headers.common['Authorization'] = "Bearer "+response.data.token;
  res.redirect('/products/list');
  /*
  axios({
    method:'get',
    url:'http://localhost:3000/products',
    responseType:'json'
  })
    .then(function(response2) {
    //res.setHeader('Content-Type', 'application/json');
   // res.send(JSON.stringify(response.data));
      
   res.render('index', { "data" : response2.data});
  }).catch(err => {
   
    
      console.log(err.response.data.message);
      res.render('login');
  
  
  
  });
  */
}).catch(err => console.log(err));
});



app.get('/users/login', (req, res) => {
  res.render('login');
});

app.get('/test', (req, res) => {
  res.render('test');
});

app.post('/users/signup', upload.single('profile'),(req, res) => {
  let data = new formData();
  console.log(req.file.path);
  data.append('profile', fs.createReadStream(req.file.path));
  //data.append('profile', fs.createReadStream(__dirname + '/btn_switch_off.png'));
  data.append( 'email' ,req.body.email);
  data.append( 'password' ,req.body.password);
    data.append(  'type', req.body.type);
  
    axios.post('http://localhost:3000/users/signup', data, {
    headers :{
      'Content-Type': `multipart/form-data; boundary=${data._boundary}`
    }}).then(function(response) {
  
  fs.unlink(req.file.path, function(){
    res.render('signup');
  });
  
}).catch(err => console.log(err));
});

app.get('/users/signup', (req, res) => {
  axios({
    method:'get',
    url:'http://localhost:3000/menu',
    responseType:'json'
  })
    .then(function(response) {
    //res.setHeader('Content-Type', 'application/json');
   // res.send(JSON.stringify(response.data));
      console.log(response.data);
   res.render('signup',{"menu":response.data});
  }).catch(err => {
   
    if(err.errno === 'ECONNREFUSED')
    {
      console.log(err.errno);
      return res.send('cannot connect, check server');
    }
    else
    {
      res.redirect('/users/login');
    }
  
  
  });
  
});


app.post('/products/new', (req, res) => {
  console.log(req.body);
  axios.post('http://localhost:3000/products', {
      name : req.body.name,
      price : req.body.price,
      country : req.body.country
  }).then(function(response) {
    res.redirect('/products/list');
    /*
    axios({
      method:'get',
      url:'http://localhost:3000/products',
      responseType:'json'
    })
      .then(function(response) {
      //res.setHeader('Content-Type', 'application/json');
     // res.send(JSON.stringify(response.data));
        console.log(response.data);
     res.render('index', { "data" : response.data});
    }).catch(err => console.log(err));
    */
  }).catch(err => {
   
      console.log(err);
  });
});

app.post('/products/update/:productId', (req, res) => {
  console.log(req.body);
  axios.patch('http://localhost:3000/products/'+req.params.productId, [
    {
      propName : 'name', value: req.body.name
    },
    {
      propName : 'price', value: req.body.price
    }
  ]).then(function(response) {
    res.redirect('/products/list');
    /*
    axios({
      method:'get',
      url:'http://localhost:3000/products',
      responseType:'json'
    })
      .then(function(response) {
      //res.setHeader('Content-Type', 'application/json');
     // res.send(JSON.stringify(response.data));
        console.log(response.data);
     res.render('index', { "data" : response.data});
    }).catch(err => console.log(err));
    */
  }).catch(err => {
   
      console.log(err);
  });
});

app.listen(1238, ()=> console.log('Listening on port 1238'));

/*
  axios.post('http://localhost:3000/products', {
      name : 'maryson',
      price : '123455'
  }).then(function(response) {
    console.log(response.data);
  }).catch(err => console.log(err));
  */