import * as cdk from '@aws-cdk/core';
import * as lambda from '@aws-cdk/aws-lambda';
import * as dynamodb from '@aws-cdk/aws-dynamodb';
import { LambdaInvoke } from '@aws-cdk/aws-stepfunctions-tasks';
import { Chain, StateMachine } from '@aws-cdk/aws-stepfunctions';
import { Queue } from '@aws-cdk/aws-sqs';
import { SqsEventSource } from '@aws-cdk/aws-lambda-event-sources';

const preffix = 'WWW-';

export class CdkWorkshopStack extends cdk.Stack {
  private stateTable: dynamodb.ITable;
  private resultTable: dynamodb.ITable;
  private defaultLambdaProps: any;
  private queue: Queue;

  constructor(scope: cdk.App, id: string, props?: cdk.StackProps) {
    super(scope, id, props);
    //create table for save state
    this.stateTable = new dynamodb.Table(this, 'stateTable', {
      tableName: 'STATE',
      partitionKey: {
        name: 'STATE_ID',
        type: dynamodb.AttributeType.NUMBER
      }
    });

    //create table for save calculation result
    this.resultTable = new dynamodb.Table(this, 'resultTable', {
      tableName: 'RESULTS',
      partitionKey: {
        name: 'RESULT_ID',
        type: dynamodb.AttributeType.NUMBER
      }
    });

    this.defaultLambdaProps = {
      runtime: lambda.Runtime.NODEJS_12_X,
      code: lambda.Code.fromAsset('functions'),
      environment: {
        STATE_TABLE_NAME: this.stateTable.tableName,
        RESULT_TABLE_NAME: this.resultTable.tableName
      }
    };

    //create queue
    this.queue = new Queue(this, `$queue`, {
      queueName: `${preffix}queue`,
      visibilityTimeout: cdk.Duration.hours(1)
    });

    const {
      firstStepTask,
      secondStepTask,
      thirdStepTask
    } = this.getTasks();

    const taskDefinition = Chain.start(firstStepTask)
      .next(secondStepTask)
      .next(thirdStepTask)

    const stateMachine = new StateMachine(this, 'tasks steps', {
      stateMachineName: `${preffix}state-machine`,
      definition: taskDefinition
    })

    const sqsTriggerLambda = new lambda.Function(this, 'sqsTriggerHandler', {
      ...this.defaultLambdaProps,
      functionName: `${preffix}sqsTrigger`,
      handler: 'trigger/sqs-trigger.handler',
      environment: {
        QUEUE_URL: this.queue.queueUrl
      }
    });
    this.queue.grantSendMessages(sqsTriggerLambda);
    
    const sqsHandlerLambda = new lambda.Function(this, 'sqsHandler', {
      ...this.defaultLambdaProps,
      functionName: `${preffix}sqsHandler`,
      handler: 'trigger/sqs-handler.handler',
      environment: {
        STATE_MACHINE_ARN: stateMachine.stateMachineArn,
        QUEUE_URL: this.queue.queueUrl
      }
    });
    sqsHandlerLambda.addEventSource(new SqsEventSource(this.queue, {
      batchSize: 1
    }));
    stateMachine.grantStartExecution(sqsHandlerLambda)

}
  

  private getTasks() {
    const firstStepLambda = new lambda.Function(this, 'firstStepHandler', {
      ...this.defaultLambdaProps,
      functionName: `${preffix}firstStep`,
      handler: 'steps/firstStep.handler'
    });
    this.stateTable.grantFullAccess(firstStepLambda);
    const firstStepTask = new LambdaInvoke(this, 'firstStepTask', {
      lambdaFunction: firstStepLambda,
      resultPath: '$.lambdaResponse'
    })

    const secondStepLambda = new lambda.Function(this, 'secondStepHandler', {
      ...this.defaultLambdaProps,
      functionName: `${preffix}secondStep`,
      handler: 'steps/secondStep.handler'
    });
    this.stateTable.grantFullAccess(secondStepLambda);
    const secondStepTask = new LambdaInvoke(this, 'secondStepTask', {
      lambdaFunction: secondStepLambda,
      resultPath: '$.lambdaResponse'
    });

    const thirdStepLambda = new lambda.Function(this, 'thirdStepHandler', {
      ...this.defaultLambdaProps,
      functionName: `${preffix}thirdStep`,
      handler: 'steps/thirdStep.handler'
    });
    this.stateTable.grantFullAccess(thirdStepLambda);
    this.resultTable.grantFullAccess(thirdStepLambda);

    const thirdStepTask = new LambdaInvoke(this, 'thirdStepTask', {
      lambdaFunction: thirdStepLambda,
      resultPath: '$.lambdaResponse'
    });
    
    return {
      firstStepTask,
      secondStepTask,
      thirdStepTask
    }
  }
}
