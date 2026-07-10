<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class StoreDepartmentRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        $id = $this->route('department')?->id;
        return [
            'name' => 'required|string|unique:departments,name,' . $id,
            'description' => 'nullable|string',
        ];
    }
}
