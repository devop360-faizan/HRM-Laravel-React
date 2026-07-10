<?php

namespace App\Services;

use App\Models\Designation;

class DesignationService extends BaseService
{
    public function all(): mixed
    {
        return Designation::with('department')->get();
    }

    public function create(array $data): Designation
    {
        $designation = Designation::create($data);
        return $designation->load('department');
    }

    public function update(array $data, Designation $designation): Designation
    {
        $designation->update($data);
        return $designation->load('department');
    }

    public function delete(Designation $designation): void
    {
        $designation->delete();
    }
}
