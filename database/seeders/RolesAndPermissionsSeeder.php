<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Spatie\Permission\Models\Role;
use App\Models\User;
use App\Models\Department;
use App\Models\Designation;
use App\Models\Attendance;
use App\Models\Leave;
use App\Models\LeaveType;
use App\Models\Holiday;
use Illuminate\Support\Facades\Hash;
use Carbon\Carbon;

class RolesAndPermissionsSeeder extends Seeder
{
    public function run(): void
    {
        // Create Roles
        $employerRole = Role::firstOrCreate(['name' => 'employer']);
        $adminRole = Role::firstOrCreate(['name' => 'admin']);
        $hrRole = Role::firstOrCreate(['name' => 'hr']);
        $employeeRole = Role::firstOrCreate(['name' => 'employee']);

        // Create Departments
        $salesDept = Department::firstOrCreate(['name' => 'Sales', 'description' => 'Sales and Marketing']);
        $engDept = Department::firstOrCreate(['name' => 'Engineering', 'description' => 'Product Development']);
        $hrDept = Department::firstOrCreate(['name' => 'Human Resources', 'description' => 'HR and Admin']);
        $prodDept = Department::firstOrCreate(['name' => 'Production', 'description' => 'Production and Operations']);

        // Create Designations
        $designations = [
            ['name' => 'Intern', 'department_id' => $salesDept->id],
            ['name' => 'Sales Executive', 'department_id' => $salesDept->id],
            ['name' => 'Senior Sales Executive', 'department_id' => $salesDept->id],
            ['name' => 'Sales Manager', 'department_id' => $salesDept->id],
            ['name' => 'Backend Developer', 'department_id' => $engDept->id],
            ['name' => 'App Developer', 'department_id' => $engDept->id],
            ['name' => 'CMS Developer', 'department_id' => $engDept->id],
            ['name' => 'HR Manager', 'department_id' => $hrDept->id],
            ['name' => 'Production Supervisor', 'department_id' => $prodDept->id],
        ];

        foreach ($designations as $desig) {
            Designation::firstOrCreate($desig);
        }

        // 1. Admin, HR, Employer (No Employee Profiles)
        $admin = User::firstOrCreate(
            ['email' => 'admin@hrm.com'],
            ['name' => 'Sufyan Khan', 'password' => Hash::make('password')]
        );
        $admin->assignRole($adminRole);

        $employer = User::firstOrCreate(
            ['email' => 'employer@hrm.com'],
            ['name' => 'Ismail Khan', 'password' => Hash::make('password')]
        );
        $employer->assignRole($employerRole);

        $hr = User::firstOrCreate(
            ['email' => 'hr@hrm.com'],
            ['name' => 'Aisha Khan', 'password' => Hash::make('password')]
        );
        $hr->assignRole($hrRole);

        // 2. Leave Types & Holidays
        LeaveType::firstOrCreate(['name' => 'Casual Leave', 'days_allowed' => 10]);
        LeaveType::firstOrCreate(['name' => 'Sick Leave', 'days_allowed' => 8]);
        Holiday::firstOrCreate(['name' => 'New Year', 'date' => '2026-01-01', 'description' => 'New Year Holiday']);
        Holiday::firstOrCreate(['name' => 'Eid', 'date' => '2026-04-10', 'description' => 'Eid ul Fitr']);

        // 3. Employees Data
        $employeesData = [
            'Faizan Ullah', 'Taha Siddique', 'Jawaad Ahmed', 'Zafeer Ahmed',
            'Irfan Khan', 'Noman Khan', 'Noman Ali', 'Atif khan', 
            'Muzaif khan', 'Muhhamd Abdullah'
        ];

        $employeeUsers = [];
        $desigIds = Designation::pluck('id')->toArray();
        $deptIds = Department::pluck('id')->toArray();

        foreach ($employeesData as $index => $name) {
            $email = strtolower(str_replace(' ', '.', $name)) . '@hrm.com';
            $emp = User::firstOrCreate(
                ['email' => $email],
                ['name' => $name, 'password' => Hash::make('password')]
            );
            $emp->assignRole($employeeRole);
            
            $emp->profile()->firstOrCreate([
                'employee_id' => 'EMP-' . str_pad($index + 1, 3, '0', STR_PAD_LEFT),
                'designation_id' => $desigIds[array_rand($desigIds)],
                'department_id' => $deptIds[array_rand($deptIds)],
                'salary' => rand(40000, 150000),
                'join_date' => Carbon::now()->subMonths(6)->format('Y-m-d'),
                'employment_status' => 'permanent',
            ]);
            
            $employeeUsers[] = $emp;
        }

        // 4. Generate 4 Months of Records (Attendance & Leaves)
        $startDate = Carbon::now()->subMonths(4);
        $endDate = Carbon::now();

        foreach ($employeeUsers as $emp) {
            $currentDate = $startDate->copy();
            
            while ($currentDate <= $endDate) {
                // Skip weekends
                if ($currentDate->isWeekend()) {
                    $currentDate->addDay();
                    continue;
                }

                // Randomly generate attendance or leave
                $rand = rand(1, 100);
                
                if ($rand <= 85) { // 85% Present
                    Attendance::create([
                        'user_id' => $emp->id,
                        'date' => $currentDate->format('Y-m-d'),
                        'check_in' => $currentDate->copy()->setHour(9)->setMinute(rand(0, 30))->format('H:i:s'),
                        'check_out' => $currentDate->copy()->setHour(17)->setMinute(rand(0, 30))->format('H:i:s'),
                        'status' => 'present',
                    ]);
                } elseif ($rand > 85 && $rand <= 92) { // 7% Late
                    Attendance::create([
                        'user_id' => $emp->id,
                        'date' => $currentDate->format('Y-m-d'),
                        'check_in' => $currentDate->copy()->setHour(10)->setMinute(rand(10, 59))->format('H:i:s'),
                        'check_out' => $currentDate->copy()->setHour(17)->setMinute(rand(0, 30))->format('H:i:s'),
                        'status' => 'late',
                    ]);
                } elseif ($rand > 92 && $rand <= 95) { // 3% Absent
                    Attendance::create([
                        'user_id' => $emp->id,
                        'date' => $currentDate->format('Y-m-d'),
                        'status' => 'absent',
                    ]);
                } else { // 5% Leave
                    Attendance::create([
                        'user_id' => $emp->id,
                        'date' => $currentDate->format('Y-m-d'),
                        'status' => 'absent',
                    ]);
                    
                    Leave::create([
                        'user_id' => $emp->id,
                        'leave_type_id' => LeaveType::first()->id,
                        'start_date' => $currentDate->format('Y-m-d'),
                        'end_date' => $currentDate->format('Y-m-d'),
                        'reason' => 'Personal work',
                        'status' => 'approved',
                    ]);
                }
                
                $currentDate->addDay();
            }
        }
    }
}