# Test script for Suppliers API
Write-Host "Testing Suppliers API..." -ForegroundColor Green

# Test 1: Get all suppliers
Write-Host "`n1. Testing GET /api/suppliers" -ForegroundColor Yellow
try {
    $suppliers = Invoke-RestMethod -Uri "http://localhost:3000/api/suppliers" -Method Get
    Write-Host "Success: GET suppliers successful. Found $($suppliers.suppliers.Count) suppliers" -ForegroundColor Green
} catch {
    Write-Host "Error: GET suppliers failed: $($_.Exception.Message)" -ForegroundColor Red
}

# Test 2: Create a new supplier
Write-Host "`n2. Testing POST /api/suppliers" -ForegroundColor Yellow
$newSupplier = @{
    name = "Test Supplier API"
    contactPerson = "Jane Smith"
    email = "jane.smith@testapi.com"
    phone = "(555) 999-8888"
    address = "456 API Test Avenue, Test City, TC 12345"
} | ConvertTo-Json

try {
    $createResult = Invoke-RestMethod -Uri "http://localhost:3000/api/suppliers" -Method Post -Body $newSupplier -ContentType "application/json"
    $newSupplierId = $createResult.supplierId
    Write-Host "Success: POST supplier successful. Created supplier ID: $newSupplierId" -ForegroundColor Green
} catch {
    Write-Host "Error: POST supplier failed: $($_.Exception.Message)" -ForegroundColor Red
    exit 1
}

# Test 3: Get supplier by ID
Write-Host "`n3. Testing GET /api/suppliers/:id" -ForegroundColor Yellow
try {
    $supplier = Invoke-RestMethod -Uri "http://localhost:3000/api/suppliers/$newSupplierId" -Method Get
    Write-Host "Success: GET supplier by ID successful. Name: $($supplier.supplier.name)" -ForegroundColor Green
} catch {
    Write-Host "Error: GET supplier by ID failed: $($_.Exception.Message)" -ForegroundColor Red
}

# Test 4: Update supplier
Write-Host "`n4. Testing PUT /api/suppliers/:id" -ForegroundColor Yellow
$updateSupplier = @{
    name = "Updated Test Supplier API"
    contactPerson = "Jane Smith Updated"
    email = "jane.smith.updated@testapi.com"
    phone = "(555) 999-7777"
    address = "789 Updated API Test Avenue, Test City, TC 12345"
    status = "active"
} | ConvertTo-Json

try {
    $updateResult = Invoke-RestMethod -Uri "http://localhost:3000/api/suppliers/$newSupplierId" -Method Put -Body $updateSupplier -ContentType "application/json"
    Write-Host "Success: PUT supplier successful. Message: $($updateResult.message)" -ForegroundColor Green
} catch {
    Write-Host "Error: PUT supplier failed: $($_.Exception.Message)" -ForegroundColor Red
}

# Test 5: Toggle supplier status
Write-Host "`n5. Testing PATCH /api/suppliers/:id/status" -ForegroundColor Yellow
$statusUpdate = @{
    status = "inactive"
} | ConvertTo-Json

try {
    $statusResult = Invoke-RestMethod -Uri "http://localhost:3000/api/suppliers/$newSupplierId/status" -Method Patch -Body $statusUpdate -ContentType "application/json"
    Write-Host "Success: PATCH supplier status successful. Message: $($statusResult.message)" -ForegroundColor Green
} catch {
    Write-Host "Error: PATCH supplier status failed: $($_.Exception.Message)" -ForegroundColor Red
}

# Test 6: Delete supplier
Write-Host "`n6. Testing DELETE /api/suppliers/:id" -ForegroundColor Yellow
try {
    $deleteResult = Invoke-RestMethod -Uri "http://localhost:3000/api/suppliers/$newSupplierId" -Method Delete
    Write-Host "Success: DELETE supplier successful. Message: $($deleteResult.message)" -ForegroundColor Green
} catch {
    Write-Host "Error: DELETE supplier failed: $($_.Exception.Message)" -ForegroundColor Red
}

# Test 7: Verify supplier was deleted
Write-Host "`n7. Testing GET deleted supplier (should fail)" -ForegroundColor Yellow
try {
    $deletedSupplier = Invoke-RestMethod -Uri "http://localhost:3000/api/suppliers/$newSupplierId" -Method Get
    Write-Host "Error: Supplier was not deleted properly" -ForegroundColor Red
} catch {
    Write-Host "Success: Supplier was deleted successfully (404 expected)" -ForegroundColor Green
}

Write-Host "`nAll Suppliers API tests completed!" -ForegroundColor Green
