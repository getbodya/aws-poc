import {BaseStep} from '../common/baseStep';
import { ResultService } from '../services/resultService';

class ThirdStep extends BaseStep {
    private resultService: ResultService; 
    constructor() {
        super(process.env.STATE_TABLE_NAME as string);

        this.resultService = new ResultService(process.env.RESULT_TABLE_NAME as string)
    }

    public async handler(event: any) {
        console.log('ThirdStep', event)
        const stateItem = await this.getState();
        const state = stateItem.Item?.STATE;
        const date = new Date();
        const time = `${date.getHours()}:${date.getMinutes()}:${date.getSeconds()}`;
        const result = `${Object.values(state).join('__')}__${time}`;

        await this.deleteState();
        await this.resultService.setResult(Number(event.resultId), result)

        return {
            statusCode: 200,
            body: {
                data: result
            }
        }
    }
}

const thirdStep = new ThirdStep();

export const handler = thirdStep.handler.bind(thirdStep);