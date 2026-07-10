<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class StoreEmployeeRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'name' => 'required|string|max:255',
            'email' => 'required|string|email|max:255|unique:users',
            'password' => 'required|string|min:8',
            'role' => 'required|string|exists:roles,name',
            'designation_id' => 'required|exists:designations,id',
            'department_id' => 'nullable|exists:departments,id',
            'salary' => 'required|numeric',
            'join_date' => 'required|date',
            'employment_status' => 'required|in:probation,permanent',
            'probation_end_date' => 'nullable|date',
        ];
    }
}
