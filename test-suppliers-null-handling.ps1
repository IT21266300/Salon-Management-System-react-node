# Test script for Suppliers with null handling
Write-Host "Testing Suppliers with null/empty values..." -ForegroundColor Green

# Test 1: Create supplier with empty values
Write-Host "`n1. Testing supplier creation with empty values" -ForegroundColor Yellow
$supplier1 = @{
    name = "Test Supplier Empty"
    contactPerson = ""
    email = ""
    phone = ""
    address = ""
} | ConvertTo-Json

try {
    $result1 = Invoke-RestMethod -Uri "http://localhost:3000/api/suppliers" -Method Post -Body $supplier1 -ContentType "application/json"
    Write-Host "Success: Created supplier with empty values. ID: $($result1.supplierId)" -ForegroundColor Green
    $supplierId1 = $result1.supplierId
} catch {
    Write-Host "Error: Failed to create supplier with empty values: $($_.Exception.Message)" -ForegroundColor Red
    exit 1
}

# Test 2: Update supplier with valid values
Write-Host "`n2. Testing supplier update with valid values" -ForegroundColor Yellow
$updateSupplier1 = @{
    name = "Updated Test Supplier"
    contactPerson = "John Doe"
    email = "john@example.com"
    phone = "123-456-7890"
    address = "123 Test Street"
} | ConvertTo-Json

try {
    $updateResult1 = Invoke-RestMethod -Uri "http://localhost:3000/api/suppliers/$supplierId1" -Method Put -Body $updateSupplier1 -ContentType "application/json"
    Write-Host "Success: Updated supplier with valid values. Message: $($updateResult1.message)" -ForegroundColor Green
} catch {
    Write-Host "Error: Failed to update supplier: $($_.Exception.Message)" -ForegroundColor Red
}

# Test 3: Update supplier back to empty values
Write-Host "`n3. Testing supplier update back to empty values" -ForegroundColor Yellow
$updateSupplier2 = @{
    name = "Test Supplier Back to Empty"
    contactPerson = ""
    email = ""
    phone = ""
    address = ""
} | ConvertTo-Json

try {
    $updateResult2 = Invoke-RestMethod -Uri "http://localhost:3000/api/suppliers/$supplierId1" -Method Put -Body $updateSupplier2 -ContentType "application/json"
    Write-Host "Success: Updated supplier back to empty values. Message: $($updateResult2.message)" -ForegroundColor Green
} catch {
    Write-Host "Error: Failed to update supplier to empty values: $($_.Exception.Message)" -ForegroundColor Red
}

# Test 4: Try to update with invalid email (should fail)
Write-Host "`n4. Testing supplier update with invalid email (should fail)" -ForegroundColor Yellow
$updateSupplier3 = @{
    name = "Test Supplier Invalid Email"
    contactPerson = "Jane Smith"
    email = "invalid-email"
    phone = "987-654-3210"
    address = "456 Test Ave"
} | ConvertTo-Json

try {
    $updateResult3 = Invoke-RestMethod -Uri "http://localhost:3000/api/suppliers/$supplierId1" -Method Put -Body $updateSupplier3 -ContentType "application/json"
    Write-Host "Error: Should have failed with invalid email but succeeded" -ForegroundColor Red
} catch {
    Write-Host "Success: Correctly rejected invalid email format" -ForegroundColor Green
}

# Test 5: Clean up - delete test supplier
Write-Host "`n5. Cleaning up test supplier" -ForegroundColor Yellow
try {
    $deleteResult = Invoke-RestMethod -Uri "http://localhost:3000/api/suppliers/$supplierId1" -Method Delete
    Write-Host "Success: Deleted test supplier. Message: $($deleteResult.message)" -ForegroundColor Green
} catch {
    Write-Host "Error: Failed to delete test supplier: $($_.Exception.Message)" -ForegroundColor Red
}

Write-Host "`nAll null handling tests completed!" -ForegroundColor Green
