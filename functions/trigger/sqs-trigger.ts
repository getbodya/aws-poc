import {SQS} from 'aws-sdk';

export const handler = async(event:any) => {
    const data = [
        {
            id: Math.floor(Math.random()* 1000000),
            value:'QQWEAD'
        },
        {
            id: Math.floor(Math.random()* 1000000),
            value: 'mkcvSDF'
        },
        {
            id: Math.floor(Math.random()* 1000000),
            value: '!#@!@#',
        },
        {
            id: Math.floor(Math.random()* 1000000),
            value: 'zzzzzzZZ'
        }
    ];

    const sqs = new SQS();

    const promises: Promise<any>[] = [];

    data.forEach(item => {
        const msg: SQS.SendMessageRequest = {
            QueueUrl: process.env.QUEUE_URL as string,
            MessageBody: JSON.stringify(item)
        };

        promises.push(sqs.sendMessage(msg).promise())
    })

    await Promise.all(promises);
}