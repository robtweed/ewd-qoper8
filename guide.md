# ewd-qoper8 Installation & Reference Guide
Version 4

4 August 2016 

© 2016 M/Gateway Developments Ltd

---

## What is ewd-qoper8?
ewd-qoper8 is a Node.js-based message queue and multi-process management module. It
provides you with:
- a **memory-based queue** within your main process onto which you can add JSON messages
- a **pool of persistent child processes** (aka worker processes) that run your message handler
functions
- a **worker process pool manager** that will start up and shut down worker processes based on
demand
- a **dispatcher** that processes the queue whenever a message is added to it, and attempts to send
the message to an available worker process
It differs from most other message queues by preventing a worker process from handling more
than one message at a time. This is by deliberate design and has some interesting consequences.
You determine the maximum size of the worker process pool. If no free worker processes are
available, messages will remain on the queue. The queue is automatically processed whenever:
  - a new message is added to the queue
  - a worker process completes its processing of a message and returns itself to the available pool
  
  The structure of messages is entirely up to you, but:
    - they are stringify-able JavaScript objects
    - for ease of handling, they should normally have a type property (the value of which is up to you)

How messages are handled within a worker process is up to you. You define a handler method/function for each message type you expect to be added to the queue.
ewd-qoper8 is highly customisable. 

For example, the master and/or worker processes can be
customised to connect to any database you wish, and it can be integrated with a Node.js-based
web-server module such as Express, and with a web-socket module such as socket.io. You can
also over-ride the memory-based queue and implement your own persistent one.

## Installing ewd-qoper8
```javascript
npm install ewd-qoper8
```

## Getting Started With ewd-qoper8
ewd-qoper8 is pre-configured with a set of default methods that essentially take a “do nothing”
action. You can therefore very simply test ewd-qoper8 by writing and running the following script
file:
```javascript
var qoper8 = require('ewd-qoper8');
var q = new qoper8.masterProcess();
console.log(q.version() + ' running in process ' + process.pid);
q.start();
```
*(You'll find a copy of this in the /tests sub-folder within the ewd-qoper8 module folder - see test1.js)*

This example will start the ewd-qoper8 master process, with a worker process pool size of 1. It will
then sit waiting for messages to be added to the queue - which isn't going to happen in this script.
When ewd-qoper8 starts, it does not start any worker processes. A worker processes is only
started when:
- a message is added to the queue; AND
- no free worker process is available; AND
- the maximum worker process pool size has not yet been reached
So if you run the above script you should just see something like this:
```
robtweed@ubuntu:~/qoper8$ sudo node node_modules/ewd-qoper8/lib/tests/test1
ewd-qoper8 Build 3.0.0; 1 March 2016 running in process 12599
Worker Bootstrap Module file written to node_modules/ewd-qoper8-worker.js
========================================================
ewd-qoper8 is up and running. Max worker pool size: 1
========================================================
```

Notice the second line of output: ewd-qoper8 always automatically creates a file containing the core worker process logic from which it bootstraps itself. However, since the test script doesn't add any messages to ewd-qoper8's queue, no worker processes are created and the master process will just sit waiting.
To stop ewd-qoper8, just press CTRL & C within the process console, or send a SIGINT message
from another process, eg:
```
kill 10947
```
*Note: the number should be the process Id for the ewd-qoper8 master process*

In either case you should see something like the following:
```
^C*** CTRL & C detected: shutting down gracefully...
Master process will now shut down
```
Alternatively we could add something like the following at the end of the test script:
```javascript
setTimeout(function() {
 q.stop();
}, 10000);
```
This time, after 10 seconds you'll now see ewd-qoper8 shut itself down

## Testing Adding a Message to the ewd-qoper8 Queue

You use ewd-qoper8's `addToQueue()` method to add messages to the queue. Messages are JavaScript objects and should have a type property defined. The type value is entirely up to you. Defining a type assists in message and response handling. The built-in logging reports will assume your messages have a type property.

So we could do the following test (see test2.js in the /tests sub-folder):
```javascript
var qoper8 = require('ewd-qoper8');
var q = new qoper8.masterProcess();
q.on('started', function() {
 console.log(q.version() + ' running in process ' + process.pid);
 var messageObj = {
 type: 'testMessage1',
 hello: 'world'
 };
 this.addToQueue(messageObj);
});
q.start();
setTimeout(function() {
 q.stop();
}, 10000);
```
Any ewd-qoper8 activity should be defined within its 'started' event handler. In the example above you can see a message object being created and queued using `this.addToQueue()` within the
q.on('started') handler.

Running the above script should produce output similar to the following:
```
robtweed@ubuntu:~/qoper8$ sudo node node_modules/ewd-qoper8/lib/tests/test2
Worker Bootstrap Module file written to node_modules/ewd-qoper8-worker.js
========================================================
ewd-qoper8 is up and running. Max worker pool size: 1
========================================================
ewd-qoper8 Build 3.0.0; 1 March 2016 running in process 12576
no available workers
master process received response from worker 12581: {"type":"workerProcessStarted","ok":12581}
new worker 12581 started and ready so process queue again
checking if more on queue
worker 12581 received message: {"type":"testMessage1","hello":"world"}
master process received response from worker 12581:
{"type":"testMessage1","finished":true,"message":{"error":"No handler found for testMessage1
message"}}
Master process has finished processing response from worker process 12581 which is back in
available pool
signalling worker 12581 to stop
worker 12581 received message: {"type":"qoper8-exit"}
worker process 12581 will now shut down
exit received from worker process 12581
No worker processes are running
Master process will now shut down
```

You'll see that it reports starting a worker process to handle the message that was added to the queue - in this case with a process id (PID) of 12581.

As we've not yet specified a specific handler function for incoming messages, by default the worker process simply sends an error message back to the master process, which, as a result, returns the worker process to the available pool. The error message confirms that no handler was defined for the message.

Note that worker process 12581 is not shut down after it has finished handling the message, but persists, waiting and available for handling any future messages that are added to the queue (which, of course, in this example, doesn't happen).

As in the previous example, after 10 seconds, ewd-qoper8 is instructed to shut down. This time you can see that the master process first signals the worker process to shut down, then waits for a few seconds before shutting itself down.

If you leave ewd-qoper8 running, you'll see it regularly reporting the duration that each worker process has been idle. If the default idle limit (1 hour, or 3,600,000ms) is exceeded, ewd-qoper8 will shut down the worker process. As soon as a new message is added to the queue, ewd-oper8 will immediately start a new worker process to handle it.

As before, if you don't use ewd-qoper8's `stop()` method within your script, CTRL&C or a SIGINT message will shut down ewd-qoper8.

## Handling Multiple Messages

So far we've only queued a single message. It's worth looking at what happens if multiple messages are added to the queue. The following example (see test3.js in the /tests folder) will
queue two messages:
```javascript
var qoper8 = require('ewd-qoper8');
var q = new qoper8.masterProcess();
q.on('started', function() {
 var messageObj = {
 type: 'testMessage1',
 hello: 'world'
 };
 this.addToQueue(messageObj);
 messageObj = {
 type: 'testMessage2',
 hello: 'rob'
 };
 this.addToQueue(messageObj);
});
q.start();
setTimeout(function() {
 q.stop();
}, 5000);
```

The output should look something like this:
```
robtweed@ubuntu:~/qoper8$ sudo node node_modules/ewd-qoper8/lib/tests/test3
Worker Bootstrap Module file written to node_modules/ewd-qoper8-worker.js
========================================================
ewd-qoper8 is up and running. Max worker pool size: 1
========================================================
no available workers
no available workers
master process received response from worker 12593: {"type":"workerProcessStarted","ok":12593}
new worker 12593 started and ready so process queue again
checking if more on queue
more items found on queue - processing again
no available workers
worker 12593 received message: {"type":"testMessage1","hello":"world"}
master process received response from worker 12593:
{"type":"testMessage1","finished":true,"message":{"error":"No handler found for testMessage1
message"}}
Master process has finished processing response from worker process 12593 which is back
in available pool
checking if more on queue
worker 12593 received message: {"type":"testMessage2","hello":"rob"}
master process received response from worker 12593:
{"type":"testMessage2","finished":true,"message":{"error":"No handler found for testMessage2
message"}}
Master process has finished processing response from worker process 12593 which is back in available pool signalling worker 12593 to stop worker 12593 received message: {"type":"qoper8-exit"}
worker process 12593 will now shut down
exit received from worker process 12593
No worker processes are running
Master process will now shut down
```

Both messages are immediately added to the queue. Adding the first triggers a worker process to be started and the message is dispatched to the worker as soon as it has signalled back that it has started up and is ready for use.

Because we haven't specified otherwise, ewd-qoper8 defaults to a worker process pool size of 1, so the second message will remain on the queue until the single worker process (PID 12593 in this
above example) has finished handling the first message. As soon as the worker process becomes available, the second, queued message is dispatched to it for processing.

This sequence will continue automatically until the queue is empty. Try editing the example script so that it adds more messages to the queue, and see what happens.

## Defining The Worker Process Pool Size

Configuration of ewd-qoper8 is done by modifying its various default properties. The best place to do this is within a “start” event handler.

For example, you can specify a worker process pool size of 2 in one of two ways:
```javascript
q.on('start', function() {
 this.setWorkerPoolSize(2);
});
```
or:
```javascript
q.on('start', function() {
 this.worker.poolSize = 2;
});
```

If you modify the previous example to use 2 worker processes, you should see a quite different
result, particularly if you queue up a larger number of message. For example, take the following
script (see test4.js in the /tests folder):
```javascript
var qoper8 = require('ewd-qoper8');
var q = new qoper8.masterProcess();
q.on('start', function() {
 this.setWorkerPoolSize(2);
});
q.on('started', function() {
 var noOfMessages = 5;
 var messageObj;
 for (var i = 0; i < noOfMessages; i++) {
 messageObj = {
 type: 'testMessage1',
 hello: 'world'
 };
 this.addToQueue(messageObj);
 }
});
q.start();
setTimeout(function() {
 q.getAllWorkerStats();
}, 5000);
setTimeout(function() {
 q.stop();
}, 10000);
```

The worker pool size is being increased to 2 within the `q.on('start')` handler. Within the `q.on('started')` handler, 5 messages are being queued. After 5 seconds, the `q.getAllWorkerStats()` method is invoked: this will ask each worker process to report back a number of vital statistics, including the number of messages it has processed.

Here's an example of the output generated by this script:
```
rrobtweed@ubuntu:~/qoper8$ sudo node node_modules/ewd-qoper8/lib/tests/test4
Worker Bootstrap Module file written to node_modules/ewd-qoper8-worker.js
========================================================
ewd-qoper8 is up and running. Max worker pool size: 2
========================================================
no available workers
no available workers
no available workers
no available workers
no available workers
master process received response from worker 12643: {"type":"workerProcessStarted","ok":12643}
new worker 12643 started and ready so process queue again
checking if more on queue
more items found on queue - processing again
no available workers
master process received response from worker 12644: {"type":"workerProcessStarted","ok":12644}
new worker 12644 started and ready so process queue again
checking if more on queue
more items found on queue - processing again
no available workers
worker 12643 received message: {"type":"testMessage1","hello":"world"}
master process received response from worker 12643:
{"type":"testMessage1","finished":true,"message":{"error":"No handler found for testMessage1
message"}}
Master process has finished processing response from worker process 12643 which is back in
available pool
checking if more on queue
more items found on queue - processing again
no available workers
worker 12643 received message: {"type":"testMessage1","hello":"world"}
master process received response from worker 12643:
{"type":"testMessage1","finished":true,"message":{"error":"No handler found for testMessage1
message"}}
Master process has finished processing response from worker process 12643 which is back in
available pool
checking if more on queue
more items found on queue - processing again
no available workers
worker 12644 received message: {"type":"testMessage1","hello":"world"}
master process received response from worker 12643:
{"type":"testMessage1","finished":true,"message":{"error":"No handler found for testMessage1
message"}}
Master process has finished processing response from worker process 12643 which is back in
available pool
checking if more on queue
worker 12643 received message: {"type":"testMessage1","hello":"world"}
worker 12643 received message: {"type":"testMessage1","hello":"world"}
master process received response from worker 12643:
{"type":"testMessage1","finished":true,"message":{"error":"No handler found for testMessage1
message"}}
Master process has finished processing response from worker process 12643 which is back in
available pool
master process received response from worker 12644:
{"type":"testMessage1","finished":true,"message":{"error":"No handler found for testMessage1
message"}}
Master process has finished processing response from worker process 12644 which is back in
available pool
worker 12643 received message: {"type":"qoper8-getStats"}
master process received response from worker 12643: {"type":"qoper8-stats","stats":{"pid":
12643,"upTime":"0 days 0:00:04","noOfMessages":6,"memory":
{"rss":"22.47","heapTotal":"9.03","heapUsed":"4.42"}}}
worker 12644 received message: {"type":"qoper8-getStats"}
master process received response from worker 12644: {"type":"qoper8-stats","stats":{"pid":
12644,"upTime":"0 days 0:00:04","noOfMessages":3,"memory":
{"rss":"22.09","heapTotal":"9.03","heapUsed":"4.40"}}}
signalling worker 12643 to stop
signalling worker 12644 to stop
worker 12643 received message: {"type":"qoper8-exit"}
worker process 12643 will now shut down
worker 12644 received message: {"type":"qoper8-exit"}
worker process 12644 will now shut down
exit received from worker process 12643
exit received from worker process 12644
No worker processes are running
Master process will now shut down
```

This time you'll see that ewd-qoper8 started 2 worker processes (PIds 12643 and 12644). In the example above, they handled 6 and 3 messages respectively. 

You'll find that the balance of messages handled by each worker may vary each time you run the script: it takes time for each worker process to start up and become ready for handling messages, so the first one may have handled several messages before the second one is ready.

You're probably wondering why a total of 9 messages was handled by the worker processes when only 5 were added to the queue. The reason is that a message is sent to each worker as part of its startup sequence, and another message was sent to each worker to ask for its vital statistics (as a result of running the `q.getAllWorkerStats()` method).

## Defining a Worker Process Message Handler

In the examples above the worker processes have been applying a default “message” event handler. That's what's generating output lines such as this:
```
master process received response from worker 12643:
{"type":"testMessage1","finished":true,"message":{"error":"No handler found for testMessage1
message"}}
```

You customise the behaviour of the worker processes by creating a Worker Handler Module that ewd-qoper8 will load into each worker process when they are started.

Your module can define any of the following event handlers:
- **start**: this will be invoked whenever a worker process starts, at the point at which it is ready for use
- **stop**: this will be invoked just before a worker process closes down
- **message**: this is invoked whenever a message is received by the worker. This is where you define your logic for handling all messages (with the exception of ewd-qoper8's own control messages)

### Example Worker Module

Here's a simple example of a worker module:
```javascript
module.exports = function() {
 this.on('start', function() {
 if (this.log) console.log('Worker process ' + process.pid + ' starting...');
 });
 this.on('message', function(messageObj, send, finished) {
 var response = {
 hello: 'world'
 };
 finished(response);
 });
 this.on('stop', function() {
 if (this.log) console.log('Worker process ' + process.pid + ' stopping...');
 });

};
```
You should always adhere to the pattern shown above:
- create a function that is exported from the module
- the function should have no arguments
- within the function you can define any or all of the worker's hander functions: `this.on('start')`, `this.on('end')` and `this.on('message')` handler functions.

## The start event handler
The start event handler is where you can do things such as connect to databases or load other modules that you'll need in your worker process.

Within the handler's callback function, `'this'` provides you access to all the worker's methods and properties.

The `on('start')` event's callback function can take a single optional argument: `isFirst`

This argument will be true if this is the first time a worker process has been started since ewdqoper8 itself was started. This is useful in situations where you want to initialise data in a database each time ewd-qoper8 is started, but before any subsequent activity occurs.

## The stop event handler

Your stop event handler is where you can do things such as cleanly disconnect from databases or tidy up other resources before the worker process is terminated. Within the handler's callback function, `'this'` provides you access to all the worker's methods and properties.

## The message event handler

The message event handler is where you'll define how to process all incoming messages that you have added to the queue. How they are processed is entirely up to you.

Its callback function provides three argument:
- **messageObj**: the raw incoming message object, sent from the master process's queue.
- **send**: a function that allows you to send a message to the master process without returning the
worker back to the available pool
- **finished**: a function that allows you to send a message to the master process, and signalling to
the master process that you have finished using the worker. The worker will be returned back to the available pool

Within the handler's callback function, `'this'` provides you access to all the worker's methods and properties. What you do with the message within the worker process is entirely up to you.
Once you've finished processing the message, you send the results back to the master process by invoking the `finished()` method.

This takes a single argument:
- **resultObj**: an object containing the results that are to be returned to the master process

On receipt of the message created by the `finished()` method, the master process will return the worker back to the available pool
You can optionally send more messages back to the master process during processing, prior to using the `finished()` method. To do this, use the `send()` method. This takes the same argument
as the `finished()` method (`resultObj`). 

The difference is that on receipt of the message, the master
process does not return the worker process to the available pool.
By default, both the `send()` and `finished()` functions return to the master process a message whose type property is the same as that of the message being handled. You can optionally use
the `send()` function to return messages with a different type property to the master process: to do this, simply define a type property in the `resultObj` object argument. Note that you cannot override the type property of the `finished()` function's result object.

Make sure that your `on('message')` handler logic always ends with an invocation of the `finished()` function, and only invoke it once - failure to do so will cause the worker process to not be released back to the available pool.

## Configuring ewd-qoper8 To Use Your Worker Handler Module

You instruct ewd-qoper8 to load your worker module by setting the property `this.worker.module` from within the on('start') method handler. The module you specify will be loaded (using require()) into each worker process when it is started.

For example, if you saved your module in `./node_modules/exampleModule.js`, then you instruct ewd-qoper8 to load it as follows, eg:
```javascript
q.on('start', function() {
 this.worker.module = 'exampleModule';
});
```

If your module is saved elsewhere, modify the module path accordingly. For example if you look at the example script test5.js in the /tests folder, you'll see that it specifies:

```javascript
q.on('start', function() {
 this.setWorkerPoolSize(2);
 this.worker.module = 'ewd-qoper8/lib/tests/example-worker-module';
});
```
Try running the test5.js script to see the effect of this module on the messages returned to the master process.

## Handling the Results Object Returned from a Worker
When a results object is returned from a Worker process, you normally define how the master process should handle it. So far we've been letting ewd-qoper8's default action to take place,
which is to simply report the returned result message to the console.

The basic mechanism for handling messages returned by worker processes is to define an `on('response')` handler, eg:

```javascript
q.on('response', function(responseObj, pid) {
 console.log('Received from worked ' + pid + ': ' + JSON.stringify(responseObj, null, 2));
});
```

As you can see above, the on('response') handler callback function provides two arguments:
- **resultsObj**: the raw incoming results object, sent from the worker process.
- **pid**: the process Id of the worker that handled the original message and sent this response

How you handle each returned message and what you do with it is up to you. Within the `on('response')` handler's callback function, `'this'` provides access to all of the master process's
properties and methods.

Note that your `on('response')` handler function method intercepts all messages returned by worker processes, including ewd-qoper8's own ones. You'll be able to distinguish them because their type will have 'qoper8-' as a prefix.

For a worked example, take a look at test6.js in the /tests folder:
```javascript
var qoper8 = require('ewd-qoper8');
var q = new qoper8.masterProcess();
q.on('start', function() {
 this.setWorkerPoolSize(2);
 this.worker.module = 'ewd-qoper8/lib/tests/test-workerModule1';
});
q.on('response', function(responseObj, pid) {
 console.log('Received from worked ' + pid + ': ' + JSON.stringify(responseObj, null, 2));
});
q.on('started', function() {
 var noOfMessages = 5;
 var messageObj;
 for (var i = 0; i < noOfMessages; i++) {
 messageObj = {
 type: 'testMessage1',
 hello: 'world'
 };
 this.addToQueue(messageObj);
 }
});
q.start();
setTimeout(function() {
 console.log(q.getStats());
 q.getWorkerAvailability(function(available) {
 console.log('Worker availability: ' + JSON.stringify(available));
 });
}, 5000);
setTimeout(function() {
 q.stop();
}, 10000);
```

## Simpler Message Handling with the handleMessage Function

Although the `addMessage()` method and the `on('response')` event provide the basic mechanisms for handling messages within the ewd-qoper8 master process, the `handleMessage()` method
provides a much simpler and slicker mechanism.

The `handleMessage()` function has two arguments:
- **messageObj**: the message object to be added to the queue
- **callback**: a callback function which provides a single argument: responseObj containing the response object that was sent by the worker process that handled the message

Note that the callback function will fire for messages sent from the worker process using both the `send()` and `finished()` methods.

For a worked example, take a look at test7.js in the /tests folder:
```javascript
'use strict'
var qoper8 = require('ewd-qoper8');
var q = new qoper8.masterProcess();
q.on('start', function() {
 this.toggleLogging();
 this.worker.poolSize = 1;
 this.worker.module = 'ewd-qoper8/lib/tests/test-workerModule2';
});
q.on('stop', function() {
 console.log(this.getStats());
});
q.on('started', function() {
 var noOfMessages = 5;
 var messageObj;
 for (let i = 0; i < noOfMessages; i++) {
 messageObj = {
 type: 'testMessage1',
 hello: 'world'
 };
 this.handleMessage(messageObj, function(response) {
 console.log('** response received for message ' + i + ': ' + JSON.stringify(response));
 });
 }
});
q.start();
setTimeout(function() {
 q.stop();
}, 10000);
```
Here's the `on('message')` handler in the worker module for this example:
```javascript
 this.on('message', function(messageObj, send, finished) {
 send({
 info: 'intermediate message',
 pid: process.pid
 });
 count++;
 var results = {
 count: count,
 time: new Date().toString()
 };
 finished(results);
 });
 ```

Notice the way this is sending messages using both the `send()` and `finished()` functions. Both will be intercepted by the `handleMessage()` function's callback.

## Customising What Happens to the Master Process When it is Started

You've already seen how the `q.on('start')` event can be used to over-ride default properties such as the worker pool size and to specify the path of your worker module.

The `on('start')` event is also where you can customise your master process, for example if you want to connect it to a database and load other modules. You can augment the master process's properties and methods from within this event's callback function: simply augment `'this'`.

## Customising What Happens to the Master Process When it is Stopped

You can optionally intercept the ewd-qoper8 master process shut-down sequence, allowing you to release and tidy up resources, and shut down any linked services tidily.

You can do this by handling the on('stop') event e.g.:
```javascript
var qoper8 = require('ewd-qoper8');
var q = new qoper8.masterProcess();
q.on('stop', function() {
 // perform your shutdown logic here
});
q.start();
```
Within the `'stop'` event handler's callback function, `'this'` provides access to all the master process's properties and methods.

## Examples Included with ewd-qoper8
You'll find a number of example scripts in the `/lib/tests` folder within your `node_modules/ewdqoper8` directory.

To run them, ensure you're in the directory that you'd been in when you first installed ewd-qoper8.

From that directory, you can invoke the command:
```
node node_modules/ewd-qoper8/lib/tests/[name]
```

where `[name]` is the script name, e.g. test1

For example, to run test1.js:
```
node node_modules/ewd-qoper8/lib/tests/test1
```

You can use the test files as examples of how to use ewd-qoper8.

## Benchmark

Included in the `/tests` folder is a script named `benchmark.js`
This will generate a specified number of messages and add them to the queue in batches. The messages are round-tripped to your worker process(es).

The benchmark will measure how long it takes to process the complete set of messages and provide statistics such as the rate per second and the number of messages handled by each worker process.

To run the benchmark:
```
node node_modules/ewd-qoper8/lib/tests/benchmark [[no of workers] [no of messages] [messages/batch] [pause between each batch (ms)]
```

The default values, if not specified as command line parameters are:
- no of workers: 1
- no of messages: 100,000
- messages per batch: 500
- pause between each batch: 51ms

When you run the benchmark, it will show you if the queue continues to grow, or any time the queue is exhausted. Maximum throughput will be achieved if you can approximate a steady-state
whereby the queue doesn't exceed 2,000 - 3,000 and it is never exhausted. You should also find that maximum throughput will be when the number of worker processes plus the master process
equals the number of CPU cores available. Use the defaults as starting points.

If you find that the queue just keeps building up throughout a run, increase the pause between batches. This will allow ewd-qoper8 to consume more of the queued messages before a next
batch is added.

Conversely, if you see lots of reports of the queue being exhausted during a run, decrease the pause between batches, so you're topping up the queue as fast as it is being consumed.

The default queue used by ewd-qoper8 is simply a JavaScript array. JavaScript performance when processing arrays decreases as array size increases, so it's a good idea to try to maintain as
small a queue size as possible for maximum throughput.

Here's some examples of how to run the benchmark:
```
node node_modules/ewd-qoper8/lib/tests/benchmark
- no of workers: 1
- no of messages: 100,000
- messages per batch: 500
- pause between each batch: 51ms
```
```
node node_modules/ewd-qoper8/lib/tests/benchmark 2
- no of workers: 2
- no of messages: 100,000
- messages per batch: 500
- pause between each batch: 51ms
```
```
node node_modules/ewd-qoper8/lib/tests/benchmark 1 10000
- no of workers: 1
- no of messages: 10,000
- messages per batch: 500
- pause between each batch: 51ms
```
```
node node_modules/ewd-qoper8/lib/tests/benchmark 2 5000 100
- no of workers: 2
- no of messages: 5,000
- messages per batch: 100
- pause between each batch: 51ms
```
```
node node_modules/ewd-qoper8/lib/tests/benchmark 2 10000 1000 102
- no of workers: 2
- no of messages: 10,000
- messages per batch: 1000
- pause between each batch: 102ms
```

By way of reference, running with the defaults on a Ubuntu 14.04 64-bit virtual machine (with 1 virtual CPU) under VMWare Fusion on an i5 MacBook Air shows a throughput of 8,500 - 9,500 messages/second

## Integrating ewd-qoper8 with Express
ewd-qoper8 is not really designed to be a standalone module. More sensibly, it is designed to be used in conjunction with a server module of some sort. The very popular and increasingly standard web server module Express is a good example of something with
which ewd-qoper8 can be easily integrated.

So, for example, ewd-qoper8's worker processes can be used to handle incoming HTTP requests, with the output from your worker-process module message handlers being
returned to the browser or web server client.

Here's a simple example of ewd-qoper8 working with Express. You'll find this in the /tests directory - look for express1.js:
```javascript
var express = require('express');
var bodyParser = require('body-parser');
var qoper8 = require('ewd-qoper8');
var app = express();
app.use(bodyParser.json());
var q = new qoper8.masterProcess();
app.post('/qoper8', function (req, res) {
 q.handleMessage(req.body, function(response) {
 res.send(response);
 });
});
q.on('started', function() {
 this.worker.module = 'ewd-qoper8/lib/tests/express-module';
 var server = app.listen(8080, function () {
 var host = server.address().address
 var port = server.address().port
 console.log("EWD-Express listening at http://%s:%s", host, port);
 console.log('__dirname = ' + __dirname);
 });
});
q.start();
```
This example will start ewd-qoper8, and when it has started and ready, it will start Express, listening on port 8080. It also sets the worker module file to be the express-module.js file
that you'll also find in the /tests folder.

The example worker module is pretty simple, just echoing back the incoming message and adding a few properties of its own:
```javascript
module.exports = function() {
 this.on('message', function(messageObj, send, finished) {
 var results = {
 youSent: messageObj,
 workerSent: 'hello from worker ' + process.pid,
 time: new Date().toString()
 };
 finished(results);
 });

};
```

Express will be watching for incoming HTTP POST requests with a URL path of /qoper8. The body of these requests will contain a JSON payload. Note the use of the standard bodyParser.json middleware to parse the JSON and make it available as req.body.
This JSON payload is then handled by ewd-qoper8's standard `handleMessage()` function.

This queues the message and awaits the response from the ewd-qoper8 worker process to which the message was dispatched. The returned result object is provided to you in its callback function which then uses Express's `res.send()` method to return it to the client.

Try using a REST client (eg the Chrome Advanced REST Client extension), and POST to the URL /qoper8 a JSON payload such as this (Make sure the Content-Type is set to application/json):
```
{
 "type": "HTTPMessage",
 "a": "hello"
}
```
You should get a response back such as this:
```
{
 “type":"HTTPMessage",
 “finished":true,
 “message":{
 “youSent":{
 “type":"HTTPMessage",
 “a":"hello"
 },
 "workerSent":"hello from worker 13809”,
 "time":"Fri Feb 19 2016 02:02:33 GMT+0000 (GMT)”
 }
}
```

## ewd-qoper-express
To make integration with Express even easier and more powerful, you can install a module named ewd-qoper8-express:
```
npm install ewd-qoper8-express
```
You'll find an example of how to use this in ewd-qoper's /tests directory: look for the file express2.js. You'll see that it contains the following:
```javascript
var express = require('express');
var bodyParser = require('body-parser');
var qoper8 = require('ewd-qoper8');
var qx = require('ewd-qoper8-express');
var app = express();
app.use(bodyParser.json());
var q = new qoper8.masterProcess();
qx.addTo(q);
app.post('/qoper8', function (req, res) {
 qx.handleMessage(req, res);
});
app.get('/qoper8/test', function (req, res) {
 qx.handleMessage(req, res);
});
q.on('started', function() {
 this.worker.module = 'ewd-qoper8/lib/tests/express-module';
 var server = app.listen(8080);
});
q.start();
```

Note the way you add ewd-qoper8-express to ewd-qoper8's master process:
```javascript
var qx = require('ewd-qoper8-express');
var q = new qoper8.masterProcess();
qx.addTo(q);
```

ewd-qoper8-express provides us with a special version of the `handleMessage()` method which constructs a message from all the relevant parts of the incoming Express request object and automatically returns the response received from the worker that processed it:
```
qx.handleMessage(req, res);
```

This example is using the same worker module as before, so it should just echo back the request generated by ewd-qoper8-express's handleMessage method.

Start up the express2.js example and try POST'ing the same request as before. You should get a response back such as this:
```
{
 "youSent": {
 "type": "ewd-qoper8-express",
 "path": "/qoper8",
 "method": "POST",
 "headers": {
 "host": "192.168.1.188:8080",
 "connection": "keep-alive",
 "content-length": "44",
 "user-agent": "Mozilla/5.0 (Windows NT 6.1; WOW64) AppleWebKit/
537.36 (KHTML, like Gecko) Chrome/48.0.2564.109 Safari/537.36",
 "origin": "chrome-extension://hgmloofddffdnphfgcellkdfbfbjeloo",
 "authorization": "f0906e12-10de-4cfc-a5e6-eaf4430d6764",
 "content-type": "application/json",
 "accept": "*/*",
 "accept-encoding": "gzip, deflate",
 "accept-language": "en-US,en;q=0.8",
 "cookie": "state-666E1C02-315E-11E5-8917-0C29C5382300=SYSADM
%3A0%2C0; Username=UnknownUser"
 },
 "params": {},
 "query": {},
 "body": {
 "type": "HTTPMessage",
 "a": "hello"
 }
 },
 "workerSent": "hello from worker 13684",
 "time": "Wed Mar 02 2016 06:33:35 GMT+0000 (GMT)"
}
```
You can see at once that the message that was constructed from Express's req object is much more complex than before (see the youSent part of the message, shown in bold):
- **type**: this is set to 'ewd-qoper8-express'
- **method**: matches the HTTP method
- **headers**: contains the HTTP request headers (req.headers)
- **params**: contains any req.params properties
- **path**: the URL path that was specified in the request
- **query**: contains any req.query properties (ie any URL name/value pairs)
- **body**: for POST and PUT requests, the parsed JSON payload

This ensures that your worker module will have all the information it needs to process the incoming Express requests.

ewd-qoper8-express also provides a special worker-side method to make things simpler for you.

You add this to your worker using the following:
```javascript
var handleExpressMessage = require('ewd-qoper8-express').workerMessage;
```
Take a look at the example worker process named express-module2.js in the ewd-qoper8/tests directory:
```javascript
module.exports = function() {
 var handleExpressMessage = require('ewd-qoper8-express').workerMessage;
 this.on('expressMessage', function(messageObj, send, finished) {
 var results = {
 youSent: messageObj,
 workerSent: 'hello from worker ' + process.pid,
 time: new Date().toString()
 };
 finished(results);
 });
 this.on('message', function(messageObj, send, finished) {
 var expressMessage = handleExpressMessage.call(this, messageObj, send,
finished);
 if (expressMessage) return;
 // handle any non-Express messages
 if (messageObj.type === 'non-express-message') {
 var results = {
 messageType: 'non-express',
 workerSent: 'hello from worker ' + process.pid,
 time: new Date().toString()
 };
 finished(results);
 }
 else {
 this.emit('unknownMessage', messageObj, send, finished);
 }
 });

};
```

This loads the ewd-qoper8-express worker method and applies it within the `on('message')` handler:

```javascript
var expressMessage = handleExpressMessage.call(this, messageObj, send, finished);
```

What this does is to filter out all incoming messages with a type of 'ewd-qoper8-express' and generates a new event named 'expressMessage'. You can see the handler for this message in the above example:
```javascript
 this.on('expressMessage', function(messageObj, send, finished) {..}
```
The reason for doing this is that you might also be sending non-Express-formatted messages from the ewd-qoper8 master process, and you want to keep their processing logic clearly separated.

This can be achieved by testing the return value from the `handleExpressMessage()` function. It will be true if the message was an ewd-qoper8-express type, and false if not. You can see how this is done in the example above.

You can try out this example - look for the file express3.js in the ewd-qoper8/tests directory:
```javascript
var express = require('express');
var bodyParser = require('body-parser');
var qoper8 = require('ewd-qoper8');
var qx = require('ewd-qoper8-express');
var app = express();
app.use(bodyParser.json());
var q = new qoper8.masterProcess();
qx.addTo(q);
app.post('/qoper8', function (req, res) {
 qx.handleMessage(req, res);
});
app.get('/qoper8/test', function (req, res) {
 var request = {
 type: 'non-express-message',
 hello: 'world'
 };
 q.handleMessage(request, function(response) {
 res.send(response);
 });
});
app.get('/qoper8/fail', function (req, res) {
 var request = {
 type: 'unhandled-message',
 };
 q.handleMessage(request, function(response) {
 var message = response.message;
 if (message.error) {
 res.status(400).send(message);
 }
 else {
 res.send(message);
 }
 });
});
q.on('started', function() {
 this.worker.module = 'ewd-qoper8/lib/tests/express-module2';
 var server = app.listen(8080);
});
q.start();
```

POSTing a /qoper8 URL will send an ewd-qoper8-epress formatted message to the worker module (express-module2).

However, sending /qoper8/test as a GET request will generate a manually-constructed message with a type of 'non-express-message' which will be handled as differently within the worker module. Sending /qoper8/fail as a GET request will return a “No handler found' error response.

## Sending Error Responses from your Worker Module
Whether or not you're handling the special ewd-qoper8-express messages within your worker module, if you've added the ewd-qoper8-express module to your master process, you can very simply generate error responses that will be treated as such by Express.

In your worker module message handlers, simply structure and send your error responses as follows:
```javascript
var response = {
 error: 'Some error message'
};
finished(response);
```

Express will send out an error response with an HTTP status code of 400 with the JSON payload:
```
{“error”: “Some error message”}
```

If you want Express to use a different status code, simply define it in the response as in this example that generates a status code of 500:
```javascript
var response = {
 error: 'Something went wrong on the server!',
 status: {code: 500}
};
finished(response);
```

If you want to generate a standard ewd-qoper8 "No handler was found for this message" error response, you can simply do the following in your message handler:
```javascript
this.emit('unknownMessage', messageObj, send, finished);
Take a look at express4.js in the ewd-qoper8 /tests directory:
var express = require('express');
var bodyParser = require('body-parser');
var qoper8 = require('ewd-qoper8');
var qx = require('ewd-qoper8-express');
var app = express();
app.use(bodyParser.json());
var q = new qoper8.masterProcess();
qx.addTo(q);
app.get('/qoper8/pass', function (req, res) {
 qx.handleMessage(req, res);
});
app.get('/qoper8/fail', function (req, res) {
 qx.handleMessage(req, res);
});
app.get('/qoper8/nohandler', function (req, res) {
 qx.handleMessage(req, res);
});
q.on('started', function() {
 this.worker.module = 'ewd-qoper8/lib/tests/express-module3';
 var server = app.listen(8080);
});
q.start();
```

It loads express-module3.js as its worker module:
```javascript
module.exports = function() {
 this.on('message', function(messageObj, send, finished) {
 var results;
 if (messageObj.path === '/qoper8/pass') {
 results = {
 youSent: messageObj,
 workerSent: 'hello from worker ' + process.pid,
 time: new Date().toString()
 };
 finished(results);
 return;
 }
 if (messageObj.path === '/qoper8/fail') {
 results = {
 error: 'An error occurred!',
 status: {code: 403}
 };
 finished(results);
 return;
 }
 this.emit('unknownMessage', messageObj, send, finished);
 });

};
```

Try the following GET requests:
- /qoper8/pass should echo back your original message
- /qoper8/fail should return a 403 error
- /qoper8/nohandler should return a 400 'No handler found' error

## Express Router
ewd-qoper8-express also provides a pre-packaged version of Express Router. Simply use it as follows:
```javascript
app.use('/vista', qx.router());
```
This incorporates the `qx.handleMessage` function behind the scenes, so provides all its capabilities to your specified routing.

Take a look at express4.js in ewd-qoper8's /test directory:
```javascript
var express = require('express');
var bodyParser = require('body-parser');
var qoper8 = require('ewd-qoper8');
var qx = require('ewd-qoper8-express');
var app = express();
app.use(bodyParser.json());
var q = new qoper8.masterProcess();
qx.addTo(q);
app.use('/qoper8', qx.router());
q.on('started', function() {
 this.worker.module = 'ewd-qoper8/lib/tests/express-module1';
 var server = app.listen(8080);
});
q.start();
```
This example uses the simple worker module express-module.js which just echoes back all the messages you send. You'll now see that any requests (GET, POST etc) that start with /qoper8 will be sent as ewd-qoper8-express formatted messages to your worker module.

So, for example, a GET request to /qoper8/testing/a/b?hello=world
will return a response similar to this:
```
{
 "youSent": {
 "type": "ewd-qoper8-express"
 "path": "/qoper8/testing/a/b?hello=world"
 "method": "GET"
 "headers": {
 "host": "192.168.1.188:8080"
 "connection": "keep-alive"
 "user-agent": "Mozilla/5.0 (Windows NT 6.1; WOW64) AppleWebKit/537.36
(KHTML, like Gecko) Chrome/48.0.2564.109 Safari/537.36"
 "authorization": "f0906e12-10de-4cfc-a5e6-eaf4430d6764"
 "accept": "*/*"
 "accept-encoding": "gzip, deflate, sdch"
 "accept-language": "en-US,en;q=0.8"
 "cookie": "state-666E1C02-315E-11E5-8917-0C29C5382300=SYSADM
%3A0%2C0; Username=UnknownUser"
 } -
 "params": {
 0: "a/b"
 "type": "testing"
 } -
 "query": {
 "hello": "world"
 } -
 "body": {}
 "application": "qoper8"
 "expressType": "testing"
 } -
 "workerSent": "hello from worker 13859"
 "time": "Wed Mar 02 2016 08:45:24 GMT+0000 (GMT)"
}
```
Notice that the path element following the /qoper8 root is available to you in your worker module message handler as `messageObj.params.type`. The /x/y elements are available in
`messageObj.params['0']`.

Also notice that the URL query string `?hello=world` is available as `messageObj.query.hello`.

## Using WebSockets With ewd-qoper8 and Express

ewd-qoper8 will also work with web socket messages. See the express6.js in the ewdqoper8/tests directory which contains the following:
```javascript
var express = require('express');
var bodyParser = require('body-parser');
var qoper8 = require('ewd-qoper8');
var app = express();
app.use(bodyParser.json());
var q = new qoper8.masterProcess();
app.get('/', function (req, res) {
 res.sendFile(__dirname + '/index.html');
});
q.on('started', function() {
 this.worker.module = 'ewd-qoper8/lib/tests/express-module1';
 var q = this;
 var server = app.listen(8080);
 var io = require('socket.io')(server);
 io.on('connection', function (socket) {
 socket.on('my-request', function (data) {
 q.handleMessage(data, function(resultObj) {
 delete resultObj.finished;
 socket.emit('my-response', resultObj);
 });
 });
 });
});
q.start();
```
For simplicity, this example uses the same worker module as before that just echoes back any messges it receives. This time it also loads the socket.io module. The socket.io event handler for incoming web socket messages makes use of the standard ewd-qoper8 `handleMessage()` function. The only difference is that instead of returning the message using: `res.send(resultObj);` it returns a WebSocket message as the response using:
```javascript
socket.emit('my-response', resultObj);
```

In order to test this example, you need to load an HTML file - there's one already created in the /test folder (index.html). If you start the express6.js script and put the following URL into a browser: <http://192.168.1.193:8080/> (change the IP address as appropriate), it should load the index.html page. This loads the client-side socket.io library and otherwise just contains a button that contains the text “Click Me”:
```html
<html>
 <head>
 <title id="ewd-qoper8 Demo"></title>
 </head>
 <body>
 <script src="/socket.io/socket.io.js"></script>
 <script>
 var socket = io.connect();
 socket.on('my-response', function (data) {
 console.log('ewd-qoper8 message received: ' + JSON.stringify(data, null, 2));
 });
 function sendMessage() {
 var message = {
 type: 'testSocketRequest',
 hello: 'world'
 };
 socket.emit('my-request', message);
 }
 </script>
 <div>
 <button onClick='sendMessage()'>Click me</button>
 </div>
 </body>
</html>
```

When the button is clicked it will send a web socket message to Express/socket.io, and will show the returned response web socket message in the browser's Javascript console. It should look something like this:
```
ewd-qoper8 message received: {
 "type": "testSocketRequest",
 "message": {
 "youSent": {
 "type": "testSocketRequest",
 "hello": "world"
 },
 "workerSent": "hello from worker 13912",
 "time": "Wed Mar 02 2016 09:04:38 GMT+0000 (GMT)"
 }
}
```

One of the important differences between HTTP and WebSockets is that you can send multiple messages to a browser from the back-end. Take a look at express7.js in the ewdqoper8/tests directory - the only difference between it and express8.js is that it uses a different worker module: express-module4.js:
```javascript
module.exports = function() {
 this.on('message', function(messageObj, send, finished) {
 send({
 intermediate: 'message',
 text: 'With websockets you can send multiple messages to the browser!'
 });
 var results = {
 youSent: messageObj,
 workerSent: 'hello from worker ' + process.pid,
 time: new Date().toString()
 };
 finished(results);
 });

};
```
This time, every time the button is clicked in the index.html file, you should see two messages arriving in the browser's JavaScript console:
```
ewd-qoper8 message received: {
 "type": "testSocketRequest",
 "message": {
 "intermediate": "message",
 "text": "With websockets you can send multiple messages to the browser!"
 }
}
ewd-qoper8 message received: {
 "type": "testSocketRequest",
 "message": {
 "youSent": {
 "type": "testSocketRequest",
 "hello": "world"
 },
 "workerSent": "hello from worker 13943",
 "time": "Wed Mar 02 2016 09:16:00 GMT+0000 (GMT)"
 }
}
```
Intermediate messages should be sent using the `send()` function to ensure that the master process doesn't return the child process to the available pool.
