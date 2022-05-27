const express = require('express')
const http = require('http');
const url = require('url');
var axios = require('axios');
var qs = require('qs');
const { response } = require('express');
process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';


const app = express()
const port = 3000

app.use(express.static('./'))

app.get('/', (req, res) => {
  res.send('Hello World!')
})

app.get('/callback',(req,res) => {
  const queryObject = url.parse(req.url, true).query;
  
  console.log('oleee -> recived');
  var code = queryObject.code;
  console.log('code',code);
  
  var data = qs.stringify({
    'grant_type': 'authorization_code',
    'redirect_uri': 'http://localhost:3000',
    'code': code,
    'client_id': 'a',
    'client_secret': 'test' 
  });
  var config = {
    method: 'post',
    url: 'https://mesh.do:8060/oauth/v2/oauth-token',
    headers: { 
      'Authorization': 'Basic YTp0ZXN0', 
      'Content-Type': 'application/x-www-form-urlencoded'
    },
    data : data
  };

  axios(config)
  .then(function (response) {
    console.log(JSON.stringify(response.data));
    res.json(response.data);
  })
  .catch(function (error) {
    console.log(error);
  });
  

});

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`)
})

