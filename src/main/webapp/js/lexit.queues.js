
// Provided by ChatGPT
// and adapted for lex'it



/* 

// Example usage:


const queue = new FunctionQueue();

queue.enQueue(function(){ ... });   // task 1
queue.enQueue(function(){ ... });	// task 2
etc ...

Promises are executed in the same order and the process starts automatically!


*/

class FunctionQueue {
	
    constructor() {
        this.queue = [];
        this.isProcessing = false;
    }

    // Add a function to the queue
    _enqueue(fn) {
        this.queue.push(fn);
        if (!this.isProcessing) {
            this.processQueue();
        }
    }
    
    
    enQueue(fn) {
		
		this.queue.push(function(){
			return new Promise((resolve) => {
				fn();
				resolve();
			});			
		});
		
		if (!this.isProcessing) {
            this.processQueue();
        }
			
	}

    // Process the functions in the queue
    processQueue() {
        if (this.queue.length === 0) {
            this.isProcessing = false;
            return;
        }

        this.isProcessing = true;
        const fn = this.queue.shift();
        const promise = fn();

        if (promise && promise.then) {
            promise.then(() => this.processQueue()).catch(() => this.processQueue());
        } else {
            this.processQueue();
        }
    }
}


