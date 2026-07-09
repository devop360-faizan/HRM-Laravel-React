<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\AttendanceController;
use App\Http\Controllers\Api\LeaveController;
use App\Http\Controllers\Api\EmployeeController;

Route::post('/login', [AuthController::class, 'login']);

Route::middleware('auth:sanctum')->group(function () {
    Route::get('/user', [AuthController::class, 'user']);
    Route::post('/logout', [AuthController::class, 'logout']);

    // Admin, HR & Employer Routes
    Route::middleware('role:admin|hr')->group(function () {
        Route::get('/dashboard/analytics', [App\Http\Controllers\Api\DashboardController::class, 'analytics']);
        Route::apiResource('designations', App\Http\Controllers\Api\DesignationController::class);
        Route::apiResource('departments', App\Http\Controllers\DepartmentController::class);
        Route::post('/attendances/import', [AttendanceController::class, 'import']);
        Route::get('/attendances/all', [AttendanceController::class, 'index']);
        Route::post('/attendances/manual', [AttendanceController::class, 'markManualAttendance']);
        
        Route::patch('/leaves/{leave}/status', [LeaveController::class, 'updateStatus']);
        Route::get('/leaves/all', [LeaveController::class, 'index']);
        
        Route::apiResource('employees', EmployeeController::class)->except(['destroy']);
        Route::apiResource('leave-types', App\Http\Controllers\Api\LeaveTypeController::class)->except(['show']);
        Route::apiResource('holidays', App\Http\Controllers\Api\HolidayController::class)->except(['show', 'index']);
    });

    // Employee Self-Service & Shared Routes
    Route::get('/holidays', [App\Http\Controllers\Api\HolidayController::class, 'index']);
    Route::get('/attendances', [AttendanceController::class, 'myAttendances']);
    Route::post('/attendances/check-in', [AttendanceController::class, 'checkIn']);
    Route::post('/attendances/check-out', [AttendanceController::class, 'checkOut']);
    Route::get('/leaves', [LeaveController::class, 'myLeaves']);
    Route::post('/leaves', [LeaveController::class, 'store']);
    Route::post('/profile/avatar', [EmployeeController::class, 'updateAvatar']);
    Route::post('/profile/update', [EmployeeController::class, 'updateSelf']);
});
