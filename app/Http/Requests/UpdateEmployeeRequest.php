<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class UpdateEmployeeRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'designation_id' => 'sometimes|exists:designations,id',
            'department_id' => 'sometimes|exists:departments,id',
            'salary' => 'sometimes|numeric',
            'employment_status' => 'sometimes|in:probation,permanent,terminated',
            'probation_end_date' => 'nullable|date',
            'about_me' => 'nullable|string',
        ];
    }
}
