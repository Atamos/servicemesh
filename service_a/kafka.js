const { Kafka } = require('kafkajs')
const { SchemaRegistry, SchemaType, readAVSCAsync } = require('@kafkajs/confluent-schema-registry')

const registry = new SchemaRegistry({ host: 'http://ktool-schema-registry.demo.svc.cluster.local:8081' })


async function init(){

  const schema = `
  {
    "type": "record",
    "name": "RandomTest",
    "namespace": "examples",
    "fields": [{ "type": "string", "name": "fullName" }]
  }
`
const { id } = await registry.register({ type: SchemaType.AVRO, schema })

console.log(id);

const kafka = new Kafka({
  clientId: 'my-app',
  brokers: ['kafka-service.demo.svc.cluster.local:9092'],
});

const producer = kafka.producer()

const payload = { fullName: 'Marco' }

const outgoingMessage = {
  value: await registry.encode(id, payload)
}


await producer.connect()
await producer.send({
  topic: 'test',
  messages: [
    outgoingMessage
  ],
})

await producer.disconnect();

init();