const { Kafka } = require('kafkajs')

const { KAFKA_USERNAME: username, KAFKA_PASSWORD: password } = process.env
const sasl = username && password ? { username, password, mechanism: 'plain' } : null
const ssl = !!sasl

// This creates a client instance that is configured to connect to the Kafka broker provided by
// the environment variable KAFKA_BOOTSTRAP_SERVER
const kafka = new Kafka({
  clientId: 'npm-slack-notifier',
  brokers: [process.env.KAFKA_BOOTSTRAP_SERVER],
  ssl,
  sasl
});


const producer = kafka.producer();
await producer.connect()




var express = require('express');
var app = express();

app.get('/send-message', function(req, res) {
    try {
        const responses = await producer.send({
          topic: process.env.TOPIC,
          messages: [{
            // Name of the published package as key, to make sure that we process events in order
            key: event.name,
    
            // The message value is just bytes to Kafka, so we need to serialize our JavaScript
            // object to a JSON string. Other serialization methods like Avro are available.
            value: JSON.stringify({
              package: event.name,
              version: event.version
            })
          }]
        })
    
        console.log('Published message', { responses })
      } catch (error) {
        console.error('Error publishing message', error)
      }
});
app.listen(process.env.PORT || 3000, () => {
    console.log(`Server listening on port ${process.env.PORT || 3000}`)
});
