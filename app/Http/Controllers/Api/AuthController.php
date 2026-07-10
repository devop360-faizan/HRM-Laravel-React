<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\LoginRequest;
use App\Http\Resources\UserResource;
use App\Services\AuthService;
use App\Traits\ApiResponse;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class AuthController extends Controller
{
    use ApiResponse;

    public function __construct(
        private readonly AuthService $authService
    ) {}

    public function login(LoginRequest $request): JsonResponse
    {
        try {
            $result = $this->authService->login($request->validated());
            return $this->respondSuccess($result, 'Login successful');
        } catch (\InvalidArgumentException $e) {
            return $this->respondError($e->getMessage(), 401);
        }
    }

    public function user(Request $request): JsonResponse
    {
        return $this->respondSuccess(
            new UserResource($this->authService->user($request))
        );
    }

    public function logout(Request $request): JsonResponse
    {
        $this->authService->logout($request);
        return $this->respondDeleted('Logged out successfully');
    }
}
