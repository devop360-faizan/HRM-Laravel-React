<?php

namespace App\Actions;

use App\Models\Attendance;
use App\Models\LeaveBalance;
use Carbon\Carbon;

class DeductLeaveOnExcessiveLates
{
    private const LATE_LIMIT = 3;

    public function execute(int $userId, string $date, string $status): void
    {
        if ($status !== 'late') {
            return;
        }

        $month = Carbon::parse($date)->month;
        $year = Carbon::parse($date)->year;

        $lateCount = Attendance::where('user_id', $userId)
            ->whereMonth('date', $month)
            ->whereYear('date', $year)
            ->where('status', 'late')
            ->count();

        if ($lateCount > 0 && $lateCount % self::LATE_LIMIT === 0) {
            LeaveBalance::firstOrCreate(
                ['user_id' => $userId],
                ['balance' => 0]
            )->decrement('balance', 1);
        }
    }
}
