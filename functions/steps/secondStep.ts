import {BaseStep} from '../common/baseStep';

class SecondStep extends BaseStep {
    constructor() {
        super(process.env.STATE_TABLE_NAME as string);
    }

    public async handler(event: any) {
        console.log('SecondStep', event)

        const stateItem = await this.getState();
        const state = stateItem.Item?.STATE;

        const updatedState = {
            ...state,
            secondStep: 'secondStep'
        }

        await this.updateState(updatedState);
    }
}

const secondStep = new SecondStep();

export const handler = secondStep.handler.bind(secondStep);