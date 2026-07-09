<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use App\Models\EmployeeProfile;
use App\Models\LeaveBalance;
use Illuminate\Support\Facades\Log;

class AccrueLeaves extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'hrm:accrue-leaves';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Add 1.5 leaves to permanent employees monthly';

    /**
     * Execute the console command.
     */
    public function handle()
    {
        $this->info('Starting leave accrual...');
        
        $permanentEmployees = EmployeeProfile::where('employment_status', 'permanent')->get();
        
        $count = 0;
        foreach ($permanentEmployees as $profile) {
            $leaveBalance = LeaveBalance::firstOrCreate(
                ['user_id' => $profile->user_id],
                ['balance' => 0]
            );
            
            $leaveBalance->increment('balance', 1.5);
            $count++;
        }

        $this->info("Successfully accrued 1.5 leaves for {$count} permanent employees.");
        Log::info("AccrueLeaves ran: Added 1.5 leaves to {$count} permanent employees.");
    }
}
