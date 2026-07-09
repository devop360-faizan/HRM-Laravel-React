<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\Designation;

class DesignationController extends Controller
{
    public function index()
    {
        return response()->json(Designation::with('department')->get());
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'department_id' => 'required|exists:departments,id'
        ]);

        $designation = Designation::create($validated);
        return response()->json(['message' => 'Designation created', 'designation' => $designation->load('department')]);
    }

    public function update(Request $request, Designation $designation)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'department_id' => 'required|exists:departments,id'
        ]);

        $designation->update($validated);
        return response()->json(['message' => 'Designation updated', 'designation' => $designation->load('department')]);
    }

    public function destroy(Designation $designation)
    {
        $designation->delete();
        return response()->json(['message' => 'Designation deleted']);
    }
}
