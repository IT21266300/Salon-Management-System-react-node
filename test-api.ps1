# Test script to verify appointment status update endpoint

# Get an appointment with a workstation
$appointment = Invoke-RestMethod -Uri "http://localhost:3001/api/workstations/6c2d124d-9d19-496f-96a5-cee401e9fcde/appointments" -Method GET
Write-Host "Appointments for workstation:" $appointment.appointments

if ($appointment.appointments.Length -gt 0) {
    $firstAppointment = $appointment.appointments[0]
    Write-Host "Testing with appointment ID:" $firstAppointment.id
    Write-Host "Current status:" $firstAppointment.status
    
    # Update status
    $body = @{ status = "confirmed" } | ConvertTo-Json
    $response = Invoke-RestMethod -Uri "http://localhost:3001/api/workstations/6c2d124d-9d19-496f-96a5-cee401e9fcde/appointments/$($firstAppointment.id)/status" -Method PUT -Body $body -ContentType "application/json"
    Write-Host "Update response:" $response
    
    # Check if it was updated
    $updatedAppointments = Invoke-RestMethod -Uri "http://localhost:3001/api/workstations/6c2d124d-9d19-496f-96a5-cee401e9fcde/appointments" -Method GET
    $updatedAppointment = $updatedAppointments.appointments | Where-Object { $_.id -eq $firstAppointment.id }
    Write-Host "Updated status:" $updatedAppointment.status
} else {
    Write-Host "No appointments found for this workstation"
}
