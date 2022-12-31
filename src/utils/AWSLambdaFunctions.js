import {
  DynamoDBClient,
  ScanCommand,
  PutItemCommand,
  UpdateItemCommand,
  DeleteItemCommand,
} from '@aws-sdk/client-dynamodb';
import { marshall, unmarshall } from '@aws-sdk/util-dynamodb';
const dynamodb = new DynamoDBClient({ region: 'ap-south-1' });

const dynamodbTableName = 'contact';
const contactsPath = '/contacts';

export const handler = async function (event) {
  let response;
  switch (true) {
    case event.httpMethod === 'GET' && event.path === contactsPath:
      response = await getContacts();
      break;
    case event.httpMethod === 'POST' && event.path === contactsPath:
      response = await saveContact(JSON.parse(event.body));
      break;
    case event.httpMethod === 'PUT' && event.resource === '/contacts/{id}':
      response = await updateContact(event);
      break;
    case event.httpMethod === 'DELETE' && event.resource === '/contacts/{id}':
      response = await deleteContact(event);
      break;
    default:
      response = buildResponse(404, '404 Not Found');
  }
  return response;
};

async function getContacts() {
  try {
    const params = {
      TableName: dynamodbTableName,
    };
    const { Items } = await dynamodb.send(new ScanCommand(params));
    const result = [];
    Items.map((eachItem) => {
      result.push(unmarshall(eachItem));
    });
    return buildResponse(200, result);
  } catch (error) {
    throw error;
  }
}

async function saveContact(requestBody) {
  try {
    const params = {
      TableName: dynamodbTableName,
      Item: marshall(requestBody),
    };
    const result = await dynamodb.send(new PutItemCommand(params));
    return buildResponse(200, result);
  } catch (error) {
    throw error;
  }
}

async function updateContact(event) {
  try {
    const requestBody = JSON.parse(event.body);
    const itemKeys = Object.keys(requestBody);
    const params = {
      TableName: dynamodbTableName,
      Key: marshall({ id: event.pathParameters.id }),
      ReturnValues: 'ALL_NEW',
      UpdateExpression: `SET ${itemKeys
        .map((k, index) => `#field${index} = :value${index}`)
        .join(', ')}`,
      ExpressionAttributeNames: itemKeys.reduce(
        (accumulator, k, index) => ({ ...accumulator, [`#field${index}`]: k }),
        {}
      ),
      ExpressionAttributeValues: marshall(
        itemKeys.reduce(
          (accumulator, k, index) => ({
            ...accumulator,
            [`:value${index}`]: requestBody[k],
          }),
          {}
        )
      ),
    };
    const { Attributes } = await dynamodb.send(new UpdateItemCommand(params));
    return buildResponse(200, unmarshall(Attributes));
  } catch (error) {
    console.log(error);
    throw error;
  }
}

async function deleteContact(event) {
  try {
    const params = {
      TableName: dynamodbTableName,
      Key: marshall({ id: event.pathParameters.id }),
    };
    const result = await dynamodb.send(new DeleteItemCommand(params));
    return buildResponse(200, result);
  } catch (error) {
    throw error;
  }
}

function buildResponse(statusCode, body) {
  return {
    statusCode: statusCode,
    headers: {
      'Content-Type': 'application/json',
      'Access-Control-Allow-Origin': '*',
    },
    body: JSON.stringify(body),
  };
}
