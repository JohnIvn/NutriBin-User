export type ErrorPayload = {
  ok: boolean;
  status: string;
  statusCode: number;
  error: string;
};

export function errorResponse(data: ErrorPayload) {
  return {
    ok: false,
    status: data.status,
    statusCode: data.statusCode,
    error: data.error,
  };
}
