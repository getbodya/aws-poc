import {SQS, StepFunctions} from 'aws-sdk';
import {SQSRecord} from 'aws-lambda';

export const handler = async (event: any) => {
    const queueUrl = process.env.QUEUE_URL as string;
    const STATE_MACHINE_ARN = process.env.STATE_MACHINE_ARN as string;

    const sqs = new SQS();
    const stepFunction = new StepFunctions();

    const records: SQSRecord[] = event.Records || [];
    const msg: SQSRecord = records[0];
    const body = JSON.parse(msg.body);

    const params: StepFunctions.StartExecutionInput = {
        input: JSON.stringify({resultId: body.id}),
        stateMachineArn: STATE_MACHINE_ARN 
    }
    await stepFunction.startExecution(params).promise()
        .then((value) => {
            sqs.deleteMessage({
                QueueUrl: queueUrl,
                ReceiptHandle: msg.receiptHandle
            });
        })
}