<?php

namespace App\Services;

use App\Models\Department;

class DepartmentService extends BaseService
{
    public function all(): mixed
    {
        return Department::orderBy('name')->get();
    }

    public function create(array $data): Department
    {
        return Department::create($data);
    }

    public function update(array $data, Department $department): Department
    {
        $department->update($data);
        return $department;
    }

    public function delete(Department $department): void
    {
        $department->delete();
    }
}
