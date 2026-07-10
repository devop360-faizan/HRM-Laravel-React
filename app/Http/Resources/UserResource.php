<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class UserResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'name' => $this->name,
            'email' => $this->email,
            'avatar' => $this->avatar,
            'roles' => RoleResource::collection($this->whenLoaded('roles')),
            'profile' => new EmployeeProfileResource($this->whenLoaded('profile')),
            'leave_balance' => new LeaveBalanceResource($this->whenLoaded('leaveBalance')),
        ];
    }
}
