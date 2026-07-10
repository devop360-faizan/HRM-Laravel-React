<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class EmployeeProfileResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'employee_id' => $this->employee_id,
            'about_me' => $this->about_me,
            'salary' => (float) $this->salary,
            'join_date' => $this->join_date,
            'employment_status' => $this->employment_status,
            'probation_end_date' => $this->probation_end_date,
            'designation' => new DesignationResource($this->whenLoaded('designation')),
            'department' => new DepartmentResource($this->whenLoaded('department')),
        ];
    }
}
