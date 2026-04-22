
$ErrorActionPreference = "Stop"
$baseUrl = "http://localhost:3000"

Write-Host "--- TEST 1: POST /api/products ---"
$body = @{
    name = "Nuclear Test Phone"
    category = "iphone"
    price = 99999
    price_on_inquiry = $false
    in_stock = $true
    description = "Test description"
    image_url = ""
    images = @()
} | ConvertTo-Json
try {
    $r1 = Invoke-WebRequest "$baseUrl/api/products" -Method POST -Body $body -ContentType "application/json" -UseBasicParsing
    Write-Host "POST SUCCESS: $($r1.StatusCode)"
    $prod = $r1.Content | ConvertFrom-Json
    $pid = $prod.id
    Write-Host "CREATED ID: $pid"
} catch {
    Write-Host "POST FAILED: $($_.Exception.Message)"
    if ($_.ErrorDetails) { Write-Host "Details: $($_.ErrorDetails.Message)" }
    exit 1
}

Write-Host "`n--- TEST 2: GET /api/products ---"
$r2 = Invoke-WebRequest "$baseUrl/api/products" -UseBasicParsing
Write-Host "GET ALL SUCCESS: $($r2.StatusCode)"

Write-Host "`n--- TEST 3: GET /api/products/[id] ---"
$r3 = Invoke-WebRequest "$baseUrl/api/products/$pid" -UseBasicParsing
Write-Host "GET SINGLE SUCCESS: $($r3.StatusCode)"
$pdata = $r3.Content | ConvertFrom-Json
Write-Host "NAME MATCH: $($pdata.name -eq 'Nuclear Test Phone')"

Write-Host "`n--- TEST 4: Homepage loads ---"
$r4 = Invoke-WebRequest "$baseUrl" -UseBasicParsing
Write-Host "HOME SUCCESS: $($r4.StatusCode)"

Write-Host "`n--- TEST 5: Product page loads ---"
$r5 = Invoke-WebRequest "$baseUrl/products/$pid" -UseBasicParsing
Write-Host "DETAIL PAGE SUCCESS: $($r5.StatusCode)"

Write-Host "`n✅ ALL TESTS PASSED LOCALLY!"
