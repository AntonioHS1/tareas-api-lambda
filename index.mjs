// Importamos los clientes de DynamoDB del SDK de AWS
import { DynamoDB } from '@aws-sdk/client-dynamodb';
import { DynamoDBDocument } from '@aws-sdk/lib-dynamodb';
// Prueba1
// Creamos la conexión con DynamoDB
const client = new DynamoDB({});
const dynamo = DynamoDBDocument.from(client);
const TABLE = 'tareas-api';

// Esta función se ejecuta cada vez que llega una petición HTTP
export const handler = async (event) => {
  // Identificamos el método HTTP (GET, POST o DELETE)
  const method = event.requestContext?.http?.method
                 || event.httpMethod;
  const body = event.body ? JSON.parse(event.body) : {};

  let response;

  switch (method) {
    case 'GET':
      // Obtener todas las tareas
      const data = await dynamo.scan({ TableName: TABLE });
      response = data.Items;
      break;

    case 'POST':
      // Crear una nueva tarea
      const item = {
        id: Date.now().toString(),
        tarea: body.tarea || 'Sin titulo',
        completada: false,
        fecha: new Date().toISOString()
      };
      await dynamo.put({ TableName: TABLE, Item: item });
      response = item;
      break;

    case 'DELETE':
      // Eliminar una tarea por su id
      await dynamo.delete({
        TableName: TABLE,
        Key: { id: body.id }
      });
      response = { mensaje: 'Tarea eliminada' };
      break;

    default:
      response = { error: 'Método no soportado' };
  }

  // Devolvemos la respuesta como JSON
  return {
    statusCode: 200,
    headers: {
      'Content-Type': 'application/json',
      'Access-Control-Allow-Origin': '*'
    },
    body: JSON.stringify(response)
  };};
