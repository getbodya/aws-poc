import {DynamoDB} from 'aws-sdk';

export class ResultService {
    private defaultParams: any;
    private client: DynamoDB.DocumentClient;

    constructor(tableName: string) {
        this.defaultParams = {
            TableName: tableName
        }
        this.client = new DynamoDB.DocumentClient();
    }

    public async setResult(id: number, result: any): Promise<void> {
        const params = {
            ...this.defaultParams,
            Item: {
                'RESULT_ID': id,
                'RESULT': result
            }
        };

        await this.client.put(params).promise()
    }
}