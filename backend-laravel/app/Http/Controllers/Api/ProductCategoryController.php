<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\ProductCategory;
use Illuminate\Http\Request;

class ProductCategoryController extends Controller
{
    public function index()
    {
        $categories = ProductCategory::with('parent')->paginate(15);
        return response()->json($categories);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:200|unique:product_categories,name',
            'slug' => 'required|string|max:200|unique:product_categories,slug',
            'parent_id' => 'nullable|integer|exists:product_categories,id',
            'is_active' => 'boolean',
        ]);

        $category = ProductCategory::create($validated);
        return response()->json(['message' => 'Category created successfully', 'category' => $category], 201);
    }

    public function show(ProductCategory $category)
    {
        return response()->json($category->load('parent', 'children'));
    }

    public function update(Request $request, ProductCategory $category)
    {
        $validated = $request->validate([
            'name' => 'nullable|string|max:200|unique:product_categories,name,' . $category->id,
            'slug' => 'nullable|string|max:200|unique:product_categories,slug,' . $category->id,
            'parent_id' => 'nullable|integer|exists:product_categories,id',
            'is_active' => 'boolean',
        ]);

        $category->update($validated);
        return response()->json(['message' => 'Category updated successfully', 'category' => $category]);
    }

    public function destroy(ProductCategory $category)
    {
        $category->delete();
        return response()->json(['message' => 'Category deleted successfully']);
    }
}
