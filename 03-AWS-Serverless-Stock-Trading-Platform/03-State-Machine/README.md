## State Machine (AWS Step Functions)

### What is a State Machine?

- In this project, a **State Machine** refers to an **AWS Step Function**—a serverless orchestration service that allows you to coordinate multiple AWS Lambda functions into a defined workflow.
- Each state in the state machine represents a step (or task), and transitions define the execution path. This allows for powerful error handling, retries, parallel execution, and more.

### Statemachine Video

https://github.com/user-attachments/assets/6d8b872e-dc6a-4765-abf4-78ee073e3efc

### Why Use Step Functions?

In the context of a stock trading platform, multiple steps may need to occur in sequence or conditionally. For example:
- Validating trade inputs
- Executing the trade logic (buy/sell)
- Recording the transaction to the database
- Sending a response back to the user

Using Step Functions:
- Increases reliability and fault tolerance
- Makes the workflow easier to visualize and debug
- Automatically retries failed tasks where configured

---

### How It's Used in This Project

We created a **Step Function state machine** to orchestrate the execution of three Lambda functions in the following order:

1. **ValidateTradeFunction**  
   Validates the incoming trade request (e.g., check stock symbol, quantity, balance).

2. **ExecuteTradeFunction**  
   Performs the business logic for buy/sell, updates user balance and stock holdings.

3. **RecordTransactionFunction**  
   Stores the trade transaction in DynamoDB for history and portfolio tracking.

---

### Triggering the State Machine

The State Machine is invoked via **API Gateway** using a `/trade` endpoint. When a user places a trade from the frontend UI, the request triggers the Step Function which runs all three Lambda functions in sequence.




