const fastify = require('fastify')({ logger: true })
var os = require("os");
const dotenv = require('dotenv');
dotenv.config();

fastify.register(require('fastify-cors'), { 
  origin: '*'
});



fastify.get('/', async (request, reply) => {
    return { hello: 'world',from: os.hostname() }
});

fastify.get('/a', async(req,res) => {
  var url = `http://service-a.demo.svc.cluster.local:${process.env.SERVICE_A_SERVICE_PORT}`;
  console.log('calling url ',url);
  let response = await fetch(url);
  let j = await response.json();
  return {i_am: os.hostname(), response: j};
});

fastify.get('/c', async(req,res) => {
var url = `http://service-c.demo.svc.cluster.local:${process.env.SERVICE_C_SERVICE_PORT}`;
console.log('calling url ',url);
let response = await fetch(url);
let j = await response.json();
    return {i_am: os.hostname(), response: j};
  });

fastify.get('/bc', async(req,res) => {
  var url = `http://service-c.demo.svc.cluster.local:${process.env.SERVICE_C_SERVICE_PORT}`;
  console.log('calling url ',url);
  let response = await fetch(url);
  let j = await response.json();
  return {i_am: os.hostname(), response: j};
  });
  

const start = async () => {
    try {
      await fastify.listen(`${process.env.PORT}`,"0.0.0.0")
    } catch (err) {
      fastify.log.error(err)
      process.exit(1)
    }
  }
  start()
  
  