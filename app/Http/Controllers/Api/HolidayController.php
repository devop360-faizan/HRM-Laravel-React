<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\StoreHolidayRequest;
use App\Http\Resources\HolidayResource;
use App\Models\Holiday;
use App\Services\HolidayService;
use App\Traits\ApiResponse;
use Illuminate\Http\JsonResponse;

class HolidayController extends Controller
{
    use ApiResponse;

    public function __construct(
        private readonly HolidayService $holidayService
    ) {}

    public function index(): JsonResponse
    {
        return $this->respondSuccess(
            HolidayResource::collection($this->holidayService->all())
        );
    }

    public function store(StoreHolidayRequest $request): JsonResponse
    {
        $holiday = $this->holidayService->create($request->validated());
        return $this->respondCreated(
            new HolidayResource($holiday),
            'Holiday created'
        );
    }

    public function update(StoreHolidayRequest $request, Holiday $holiday): JsonResponse
    {
        $holiday = $this->holidayService->update($request->validated(), $holiday);
        return $this->respondUpdated(
            new HolidayResource($holiday),
            'Holiday updated'
        );
    }

    public function destroy(Holiday $holiday): JsonResponse
    {
        $this->holidayService->delete($holiday);
        return $this->respondDeleted('Holiday deleted');
    }
}
