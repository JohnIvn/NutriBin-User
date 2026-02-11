import { errorResponse } from './ErrorHandler';

export type ResponsePayload = {
  ok: boolean;
  data: any;
  message?: string;
  error?: string;
};

export function returnResponse(data: ResponsePayload) {
  if (!data) {
    return errorResponse({
      ok: false,
      status: 'No Payload Found',
      statusCode: 404,
      error: 'No Payload Found',
    });
  }
  return {
    ok: data.ok,
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    data: data.data || null,
    message: data.message,
    error: data.error,
  };
}
