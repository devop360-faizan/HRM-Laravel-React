<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class StoreLeaveTypeRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        $id = $this->route('leave_type')?->id;
        return [
            'name' => 'required|string|unique:leave_types,name,' . $id,
            'days_allowed' => 'required|integer|min:0',
        ];
    }
}
