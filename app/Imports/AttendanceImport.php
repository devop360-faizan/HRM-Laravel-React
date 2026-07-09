<?php

namespace App\Imports;

use App\Models\Attendance;
use App\Models\User;
use Maatwebsite\Excel\Concerns\ToModel;
use Maatwebsite\Excel\Concerns\WithHeadingRow;
use Carbon\Carbon;

class AttendanceImport implements ToModel, WithHeadingRow
{
    /**
    * @param array $row
    *
    * @return \Illuminate\Database\Eloquent\Model|null
    */
    public function model(array $row)
    {
        // Assuming excel has: email, date, check_in, check_out, status
        $user = User::where('email', $row['email'])->first();
        if (!$user) return null;

        return new Attendance([
            'user_id' => $user->id,
            'date' => Carbon::parse($row['date'])->format('Y-m-d'),
            'check_in' => isset($row['check_in']) ? Carbon::parse($row['check_in'])->format('H:i:s') : null,
            'check_out' => isset($row['check_out']) ? Carbon::parse($row['check_out'])->format('H:i:s') : null,
            'status' => $row['status'] ?? 'present',
        ]);
    }
}
