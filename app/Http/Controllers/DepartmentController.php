<?php

namespace App\Http\Controllers;

use App\Http\Requests\StoreDepartmentRequest;
use App\Http\Resources\DepartmentResource;
use App\Models\Department;
use App\Services\DepartmentService;
use App\Traits\ApiResponse;
use Illuminate\Http\JsonResponse;

class DepartmentController extends Controller
{
    use ApiResponse;

    public function __construct(
        private readonly DepartmentService $departmentService
    ) {}

    public function index(): JsonResponse
    {
        return $this->respondSuccess(
            DepartmentResource::collection($this->departmentService->all())
        );
    }

    public function store(StoreDepartmentRequest $request): JsonResponse
    {
        $department = $this->departmentService->create($request->validated());
        return $this->respondCreated(
            new DepartmentResource($department),
            'Department created'
        );
    }

    public function update(StoreDepartmentRequest $request, Department $department): JsonResponse
    {
        $department = $this->departmentService->update($request->validated(), $department);
        return $this->respondUpdated(
            new DepartmentResource($department),
            'Department updated'
        );
    }

    public function destroy(Department $department): JsonResponse
    {
        $this->departmentService->delete($department);
        return $this->respondDeleted('Department deleted');
    }
}
