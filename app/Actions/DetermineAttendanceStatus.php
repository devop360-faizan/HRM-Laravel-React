<?php

namespace App\Actions;

use Carbon\Carbon;

class DetermineAttendanceStatus
{
    private const LATE_THRESHOLD = '12:15';

    public function execute(?string $checkInTime, string $currentStatus = 'present'): string
    {
        if (empty($checkInTime) && $currentStatus !== 'present') {
            return $currentStatus;
        }

        $time = $checkInTime
            ? Carbon::createFromFormat('H:i', $checkInTime)
            : Carbon::now();

        $threshold = Carbon::createFromFormat('H:i', self::LATE_THRESHOLD);

        if ($time->greaterThan($threshold) && $currentStatus === 'present') {
            return 'late';
        }

        return $currentStatus;
    }
}
