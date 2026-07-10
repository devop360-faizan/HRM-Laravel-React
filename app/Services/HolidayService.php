<?php

namespace App\Services;

use App\Models\Holiday;

class HolidayService extends BaseService
{
    public function all(): mixed
    {
        return Holiday::orderBy('date')->get();
    }

    public function create(array $data): Holiday
    {
        return Holiday::create($data);
    }

    public function update(array $data, Holiday $holiday): Holiday
    {
        $holiday->update($data);
        return $holiday;
    }

    public function delete(Holiday $holiday): void
    {
        $holiday->delete();
    }
}
