import {DynamoDB} from 'aws-sdk';

export class DynamoService {
    private defaultParams: any;
    private client: DynamoDB.DocumentClient;

    constructor(tableName: string) {
        this.defaultParams = {
            TableName: tableName
        }
        this.client = new DynamoDB.DocumentClient();
    }

    public async get(stateId: number): Promise<any> {
        const params = {
            ...this.defaultParams,
            Key: {
                "STATE_ID": stateId
            }
        };

        return await this.client.get(params).promise();
    }

    public async set(stateId: number, state: any): Promise<void> {
        const params = {
            ...this.defaultParams,
            Item: {
                'STATE_ID': stateId,
                'STATE': state
            }
        };

        await this.client.put(params).promise()
    }

    public async update(stateId: number, state: any): Promise<void> {

        const params = {
            ...this.defaultParams,
            Key: {
                "STATE_ID": stateId
            },
            UpdateExpression: "set #state = :state",
            ExpressionAttributeNames: {
                "#state": "STATE"
            },
            ExpressionAttributeValues: {
                ":state": state
            }
        };

        await this.client.update(params).promise()
    }

    public async delete(stateId: number): Promise<void> {
        const params = {
            ...this.defaultParams,
            Key: {
                "STATE_ID": stateId
            }
        };

        await this.client.delete(params).promise();
    }
}
