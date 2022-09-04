import DynamoDB, { DocumentClient } from 'aws-sdk/clients/dynamodb';
import { v4 as uuidv4 } from 'uuid';

export class DynamoDBHandler {
  table: string;
  dynamoDB: DocumentClient;
  dynamodbInstance: DynamoDB;
  defaultProjectionExpression: string;
  defaultExpressionAttributeNames: any;

  constructor(
    table: string,
    defaultProjectionExpression: string,
    defaultExpressionAttributeNames: any,
  ) {
    this.table = table;
    this.defaultProjectionExpression = defaultProjectionExpression;
    this.defaultExpressionAttributeNames = defaultExpressionAttributeNames;
    this.dynamoDB = new DocumentClient({
      region: process.env.AWS_REGION,
      accessKeyId: process.env.AWS_KEY_ID,
      secretAccessKey: process.env.AWS_SECRET,
    });
    this.dynamodbInstance = new DynamoDB({
      region: process.env.AWS_REGION,
      accessKeyId: process.env.AWS_KEY_ID,
      secretAccessKey: process.env.AWS_SECRET,
    });
  }

  async CreateTable(keyName: string) {
    const tables = await this.dynamodbInstance.listTables({}).promise();

    const exists =
      tables.TableNames.filter((name: string) => name === this.table).length >
      0;

    if (!exists) {
      await this.dynamodbInstance
        .createTable({
          TableName: this.table,
          AttributeDefinitions: [
            {
              AttributeName: keyName,
              AttributeType: 'S',
            },
          ],
          KeySchema: [
            {
              AttributeName: keyName,
              KeyType: 'HASH',
            },
          ],
          ProvisionedThroughput: {
            ReadCapacityUnits: 1,
            WriteCapacityUnits: 1,
          },
          StreamSpecification: {
            StreamEnabled: false,
          },
        })
        .promise();
    }
  }
  generateUpdateQuery(fields: any) {
    const exp = {
      UpdateExpression: 'set',
      ExpressionAttributeNames: {},
      ExpressionAttributeValues: {},
    };
    Object.entries(fields).forEach(([key, item]) => {
      exp.UpdateExpression += ` #${key} = :${key},`;
      exp.ExpressionAttributeNames[`#${key}`] = key;
      exp.ExpressionAttributeValues[`:${key}`] = item;
    });
    exp.UpdateExpression = exp.UpdateExpression.slice(0, -1);
    return exp;
  }

  generateFilterQuery(fields: any) {
    const exp = {
      FilterExpression: '',
      ExpressionAttributeNames: {},
      ExpressionAttributeValues: {},
    };
    Object.entries(fields).forEach(([key, item]) => {
      exp.FilterExpression += ` #${key} = :${key} or `;
      exp.ExpressionAttributeNames[`#${key}`] = key;
      exp.ExpressionAttributeValues[`:${key}`] = item;
    });
    exp.FilterExpression = exp.FilterExpression.slice(0, -3);
    return exp;
  }

  get(limit = 50, startKey = {}) {
    const queryOptions = {
      TableName: this.table,
      Limit: limit,
      ...(Object.keys(startKey).length && { ExclusiveStartKey: startKey }),
      ExpressionAttributeNames: this.defaultExpressionAttributeNames,
      ProjectionExpression: this.defaultProjectionExpression,
    };
    return this.dynamoDB
      .scan({
        ...queryOptions,
      })
      .promise();
  }

  getByCustomQuery(query: any) {
    return this.dynamoDB
      .scan({
        TableName: this.table,
        ...query,
      })
      .promise();
  }

  getByEqQuery(query: any) {
    return this.dynamoDB
      .scan({
        TableName: this.table,
        ...this.generateFilterQuery(query),
      })
      .promise();
  }

  batchWrite(item: Array<any>) {
    return this.dynamoDB
      .batchWrite({
        RequestItems: {
          [this.table]: [...item],
        },
      })
      .promise();
  }

  async putItem(keyName: string, item: any) {
    item[keyName] = uuidv4();

    await this.dynamoDB
      .put({
        TableName: this.table,
        Item: item,
      })
      .promise();
    return item[keyName];
  }

  updateItem(id: any, item: any) {
    return this.dynamoDB
      .update({
        Key: id,
        TableName: this.table,
        ConditionExpression: 'attribute_exists(id)',
        ...this.generateUpdateQuery(item),
      })
      .promise();
  }
}
