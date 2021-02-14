import { DynamoService } from '../services/dynamo';

export class BaseStep {
    private dynamoService: DynamoService;
    
    constructor(tableName: string, private stateId: number = 11011, ) {
        //@ts-ignore
        this.dynamoService = new DynamoService(tableName);
    }

    public async setState(state: any): Promise<void> {
        await this.dynamoService.set(this.stateId, state)
    }

    public async getState(): Promise<any> {
        return await this.dynamoService.get(this.stateId);
    }
    
    public async updateState(state: any): Promise<any> {
        return await this.dynamoService.update(this.stateId, state);
    }

    public async deleteState(): Promise<any> {
        await this.dynamoService.delete(this.stateId);
    }


    
}