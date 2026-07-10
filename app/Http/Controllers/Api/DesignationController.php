<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\StoreDesignationRequest;
use App\Http\Resources\DesignationResource;
use App\Models\Designation;
use App\Services\DesignationService;
use App\Traits\ApiResponse;
use Illuminate\Http\JsonResponse;

class DesignationController extends Controller
{
    use ApiResponse;

    public function __construct(
        private readonly DesignationService $designationService
    ) {}

    public function index(): JsonResponse
    {
        return $this->respondSuccess(
            DesignationResource::collection($this->designationService->all())
        );
    }

    public function store(StoreDesignationRequest $request): JsonResponse
    {
        $designation = $this->designationService->create($request->validated());
        return $this->respondCreated(
            new DesignationResource($designation),
            'Designation created'
        );
    }

    public function update(StoreDesignationRequest $request, Designation $designation): JsonResponse
    {
        $designation = $this->designationService->update($request->validated(), $designation);
        return $this->respondUpdated(
            new DesignationResource($designation),
            'Designation updated'
        );
    }

    public function destroy(Designation $designation): JsonResponse
    {
        $this->designationService->delete($designation);
        return $this->respondDeleted('Designation deleted');
    }
}
