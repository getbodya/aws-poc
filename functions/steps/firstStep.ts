import {BaseStep} from '../common/baseStep';

class FirstStep extends BaseStep {
    constructor() {
        super(process.env.STATE_TABLE_NAME as string);
    }

    public async handler(event: any) {
        console.log('FirstStep', event)

        const state = {
            firstStep: 'firstStep'
        };
        
        await this.setState(state);
    }
}

const firstStep = new FirstStep();

export const handler = firstStep.handler.bind(firstStep);