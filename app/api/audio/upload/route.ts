import { handleUpload, type HandleUploadBody } from '@vercel/blob/client';
import { NextResponse } from 'next/server';
 
export async function POST(request: Request): Promise<NextResponse> {
  const body = (await request.json()) as HandleUploadBody;
 
  try {
    const jsonResponse = await handleUpload({
      body,
      request,
      onBeforeGenerateToken: async (
        pathname,
        /* clientPayload */
      ) => {
        // Generar un token de cliente para que el navegador suba el archivo
        // ⚠️ Autenticar y autorizar a los usuarios antes de generar el token.
        // De lo contrario, estarías permitiendo cargas anónimas.
 
        return {
          allowedContentTypes: ['audio/mpeg', 'audio/wav', 'audio/ogg', 'audio/mp4', 'audio/mp3'],
          tokenPayload: JSON.stringify({
            // opcional, enviado a tu servidor al completar la carga
            // podrías pasar un id de usuario desde la autenticación, o un valor de clientPayload
          }),
        };
      },
      onUploadCompleted: async ({ blob, tokenPayload }) => {
        // Notificación de la finalización de la carga del cliente
        // ⚠️ Esto no funcionará en sitios web `localhost`,
        // Usa ngrok o similar para obtener el flujo completo de carga
 
        console.log('Carga del blob completada', blob, tokenPayload);
 
        try {
          // Ejecutar cualquier lógica después de que la carga del archivo se haya completado
          // const { userId } = JSON.parse(tokenPayload);
          // await db.update({ avatar: blob.url, userId });
        } catch (error) {
          throw new Error('No se pudo actualizar el usuario');
        }
      },
    });
 
    return NextResponse.json(jsonResponse);
  } catch (error) {
    return NextResponse.json(
      { error: (error as Error).message },
      { status: 400 }, // El webhook intentará de nuevo 5 veces esperando un 200
    );
  }
}
