import { DocumentClient } from 'aws-sdk/clients/dynamodb';

export class DynamoDBHandler {
  table: string;
  dynamoDB: DocumentClient;

  constructor(table: string) {
    this.table = table;
    this.dynamoDB = new DocumentClient({
      region: process.env.AWS_REGION,
      accessKeyId: process.env.AWS_KEY_ID,
      secretAccessKey: process.env.AWS_SECRET,
    });
  }

  get() {
    return this.dynamoDB
      .scan({
        TableName: this.table,
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

  putItem(item: any) {
    return this.dynamoDB
      .put({
        TableName: this.table,
        Item: item,
      })
      .promise();
  }
}
