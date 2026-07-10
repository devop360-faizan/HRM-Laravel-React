<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\ImportAttendanceRequest;
use App\Http\Requests\ManualAttendanceRequest;
use App\Http\Resources\AttendanceResource;
use App\Services\AttendanceService;
use App\Traits\ApiResponse;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class AttendanceController extends Controller
{
    use ApiResponse;

    public function __construct(
        private readonly AttendanceService $attendanceService
    ) {}

    public function import(ImportAttendanceRequest $request): JsonResponse
    {
        $this->attendanceService->import($request);
        return $this->respondSuccess(null, 'Attendance imported successfully');
    }

    public function index(Request $request): JsonResponse
    {
        return $this->respondSuccess(
            AttendanceResource::collection($this->attendanceService->index($request))
        );
    }

    public function myAttendances(Request $request): JsonResponse
    {
        return $this->respondSuccess(
            AttendanceResource::collection($this->attendanceService->myAttendances($request))
        );
    }

    public function markManualAttendance(ManualAttendanceRequest $request): JsonResponse
    {
        $attendance = $this->attendanceService->markManual($request->validated());
        return $this->respondSuccess(
            new AttendanceResource($attendance),
            'Attendance marked manually'
        );
    }

    public function checkIn(Request $request): JsonResponse
    {
        try {
            $attendance = $this->attendanceService->checkIn($request);
            return $this->respondSuccess(
                new AttendanceResource($attendance),
                'Checked in successfully'
            );
        } catch (\RuntimeException $e) {
            return $this->respondError($e->getMessage(), 400);
        }
    }

    public function checkOut(Request $request): JsonResponse
    {
        try {
            $attendance = $this->attendanceService->checkOut($request);
            return $this->respondSuccess(
                new AttendanceResource($attendance),
                'Checked out successfully'
            );
        } catch (\RuntimeException $e) {
            return $this->respondError($e->getMessage(), 400);
        }
    }
}
