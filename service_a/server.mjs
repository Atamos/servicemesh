import { createRequire} from 'module'
import { ApolloServer , gql} from 'apollo-server-fastify';
import { ApolloServerPluginDrainHttpServer } from 'apollo-server-core';
import fastify from 'fastify';

console.log('start');

const require = createRequire(import.meta.url);
const opentelemetry = require('@opentelemetry/api');
var os = require("os");
const dotenv = require('dotenv');
dotenv.config();
const { buildSubgraphSchema } = require('@apollo/subgraph');

const openTelemetryPlugin = require('@autotelic/fastify-opentelemetry');

const { Resource } = require('@opentelemetry/resources');
const { SemanticResourceAttributes } = require('@opentelemetry/semantic-conventions');
const { SimpleSpanProcessor } = require('@opentelemetry/sdk-trace-base');
const { CollectorTraceExporter } = require('@opentelemetry/exporter-collector');
const { FastifyInstrumentation } = require('@opentelemetry/instrumentation-fastify');
const { HttpInstrumentation } = require('@opentelemetry/instrumentation-http');
const { registerInstrumentations } = require('@opentelemetry/instrumentation');
const { NodeTracerProvider } = require('@opentelemetry/sdk-trace-node');
const { Kafka } = require('kafkajs');
const { SchemaRegistry, SchemaType, readAVSCAsync } = require('@kafkajs/confluent-schema-registry')


const { diag, DiagConsoleLogger, DiagLogLevel } = opentelemetry;
diag.setLogger(new DiagConsoleLogger(), DiagLogLevel.INFO);

const provider = new NodeTracerProvider();
provider.register();

var a = new HttpInstrumentation();
var b = new FastifyInstrumentation();

console.log('register instrumentation');
registerInstrumentations({a,b});

const { context, trace } = opentelemetry;

function fastifyAppClosePlugin(app) {
  return {
    async serverWillStart() {
      return {
        async drainServer() {
          await app.close();
        },
      };
    },
  };
}


console.log('start apollo server');
async function startApolloServer(typeDefs, resolvers) {

  console.log('start apollo');
  const app = fastify({ logger: true });

  /*const kafka = new Kafka({
    clientId: 'my-app',
    brokers: ['kafka-service:9092'],
  });*/

  //var producer = kafka.producer();
  /*app.register(require('fastify-cors'), { 
    origin: '*'
  });*/
  app.register(openTelemetryPlugin, { wrapRoutes: true })
  
  const server = new ApolloServer({
    schema: buildSubgraphSchema({ typeDefs, resolvers }),

    csrfPrevention: true,
    plugins: [
      fastifyAppClosePlugin(app),
      ApolloServerPluginDrainHttpServer({ httpServer: app.server }),
    ],
  });



app.get('/konbawa/:name',async (request, reply) => {
  console.log(request.params);
    var data = {message: `welcome ${request.params.name}`};
    return data;
});

app.get('/echo',async (request, reply) => {
   var body = {};
   body.headers = request.headers;
   body.params = request.params;
   body.request_ip = request.ips;
   body.hostname = request.hostname;
   body.url = request.url;
    return body;
});



app.get('/', async (request, reply) => {
  const {
    activeSpan,
    tracer,
    // context,
    // extract,
    // inject,
  } = request.openTelemetry()
  // Spans started in a wrapped route will automatically be children of the activeSpan.
  const childSpan = tracer.startSpan(`${activeSpan.name} - child process`)
  var data = { hello: 'world',from: os.hostname() };
  childSpan.end()
  return data;
});

app.get('/b', async(req,res) => {
    var url = `http://service-b.demo.svc.cluster.local`;
    console.log('calling url ',url);
    let response = await fetch(url);
    let j = await response.json();
    return {i_am: os.hostname(), response: j};
});


/*await producer.send({
  topic: 'test-topic',
  messages: [
    { value: 'Hello KafkaJS user!' },
  ],
})*/

app.get('/c', async(req,res) => {
  var url = `http://service-c.demo.svc.cluster.local:${process.env.SERVICE_C_SERVICE_PORT}`;
  console.log('calling url ',url);
  let response = await fetch(url);
  let j = await response.json();
  return {i_am: os.hostname(), response: j};
});


app.get('/bc', async(req,res) => {
  var url = `http://service-b.demo.svc.cluster.local:${process.env.SERVICE_B_SERVICE_PORT}/c`;
  console.log('calling url ',url);
  let response = await fetch(url);
  let j = await response.json();
  return {i_am: os.hostname(), response: j};
});


app.get('/send/:topic', async(req,res) => {

  const registry = new SchemaRegistry({ host: 'http://ktool-schema-registry.demo.svc.cluster.local:8081' });

  const schema = `
  {
    "type": "record",
    "name": "RandomTest",
    "namespace": "examples",
    "fields": [{ "type": "string", "name": "fullName" }]
  }
`;


const { id } = await registry.register({ type: SchemaType.AVRO, schema })

console.log(id);

  const kafka = new Kafka({
    clientId: 'my-app',
    brokers: ['kafka-service.demo.svc.cluster.local:9092'],
  });
  const producer = kafka.producer();

  var topic = req.params.topic;
  let date = new Date();

  const payload = { fullName: 'Marco' };

  const outgoingMessage = {
    value: await registry.encode(id, payload)
  }

  await producer.connect();
  await producer.send({
    topic: 'test',
    messages: [
      outgoingMessage
    ],
  });

  await producer.disconnect();
  return {};
});

console.log('start server');
  await server.start();
  app.register(server.createHandler());
 // await producer.connect();
  await app.listen(process.env.PORT,'0.0.0.0');

  //await producer.disconnect()


  console.log(`🚀 Server ready at http://localhost:4000${server.graphqlPath}`);
  console.log(`🚀 Server ready at http://localhost:${process.env.PORT}`);
}

/*
const start = async () => {
    try {
      await fastify.listen(`${process.env.PORT}`,"0.0.0.0")
    } catch (err) {
      fastify.log.error(err)
      process.exit(1)
    }
  }
  start()
  
*/

const typeDefs = gql`
extend schema
  @link(url: "https://specs.apollo.dev/federation/v2.0",
        import: ["@key", "@shareable"])

  # Comments in GraphQL strings (such as this one) start with the hash (#) symbol.

  # This "Book" type defines the queryable fields for every book in our data source.
  type Book @key(fields: "id"){
    id: ID!
    title: String
    author: String
  }

  # The "Query" type is special: it lists all of the available queries that
  # clients can execute, along with the return type for each. In this
  # case, the "books" query returns an array of zero or more Books (defined above).
  type Query {
    books: [Book]
    
  }
`;

const books = [
  {
    id: 1,
    title: 'The Awakening',
    author: 'Kate Chopin',
  },
  {
    id: 2,
    title: 'City of Glass',
    author: 'Paul Auster',
  },
  {
    id: 3,
    title: 'IT',
    author: 'Stephen King',
  }
];

const resolvers = {
  Query: {
    books: () => books,
  },
};


startApolloServer(typeDefs,resolvers);