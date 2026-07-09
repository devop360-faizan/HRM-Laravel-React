<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\Holiday;

class HolidayController extends Controller
{
    public function index()
    {
        return response()->json(Holiday::orderBy('date')->get());
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string',
            'date' => 'required|date',
            'description' => 'nullable|string'
        ]);

        $holiday = Holiday::create($validated);
        return response()->json(['message' => 'Holiday created', 'holiday' => $holiday]);
    }

    public function update(Request $request, Holiday $holiday)
    {
        $validated = $request->validate([
            'name' => 'required|string',
            'date' => 'required|date',
            'description' => 'nullable|string'
        ]);

        $holiday->update($validated);
        return response()->json(['message' => 'Holiday updated', 'holiday' => $holiday]);
    }

    public function destroy(Holiday $holiday)
    {
        $holiday->delete();
        return response()->json(['message' => 'Holiday deleted']);
    }
}
