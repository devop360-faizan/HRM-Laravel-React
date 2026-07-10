<?php

namespace App\Traits;

use Illuminate\Http\JsonResponse;

trait ApiResponse
{
    protected function respondSuccess(mixed $data = null, string $message = 'Success', int $code = 200, array $meta = []): JsonResponse
    {
        $response = [
            'success' => true,
            'message' => $message,
            'data' => $data,
        ];

        if (!empty($meta)) {
            $response['meta'] = $meta;
        }

        return response()->json($response, $code);
    }

    protected function respondCreated(mixed $data = null, string $message = 'Created successfully'): JsonResponse
    {
        return $this->respondSuccess($data, $message, 201);
    }

    protected function respondUpdated(mixed $data = null, string $message = 'Updated successfully'): JsonResponse
    {
        return $this->respondSuccess($data, $message);
    }

    protected function respondDeleted(string $message = 'Deleted successfully'): JsonResponse
    {
        return $this->respondSuccess(null, $message);
    }

    protected function respondError(string $message = 'Error', int $code = 400, mixed $errors = null): JsonResponse
    {
        $response = [
            'success' => false,
            'message' => $message,
        ];

        if ($errors !== null) {
            $response['errors'] = $errors;
        }

        return response()->json($response, $code);
    }

    protected function respondNotFound(string $message = 'Resource not found'): JsonResponse
    {
        return $this->respondError($message, 404);
    }

    protected function respondUnauthorized(string $message = 'Unauthorized'): JsonResponse
    {
        return $this->respondError($message, 401);
    }

    protected function respondForbidden(string $message = 'Forbidden'): JsonResponse
    {
        return $this->respondError($message, 403);
    }

    protected function respondValidationError(string $message = 'Validation failed', mixed $errors = null): JsonResponse
    {
        return $this->respondError($message, 422, $errors);
    }
}
