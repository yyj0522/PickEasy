$secret = "gktmtmxhs@12"
$baseUrl = "http://localhost:3000"
$repeatCount = 10 

Write-Host "IT Dictionary Collection Started... (Total $repeatCount times)" -ForegroundColor Cyan

for ($i = 1; $i -le $repeatCount; $i++) {
    Write-Host "[ $i / $repeatCount ] Requesting..." -NoNewline

    $uri = "$baseUrl/api/cron/update-dictionary?secret=$secret"

    try {
        $response = Invoke-RestMethod -Uri $uri -Method Get -ErrorAction Stop -TimeoutSec 180
        
        Write-Host " Success!" -ForegroundColor Green
        if ($response) {
            Write-Host "   - Topic: $($response.topic)" -ForegroundColor Gray
            Write-Host "   - Added: $($response.added)" -ForegroundColor Gray
        }
    }
    catch {
        Write-Host " Failed" -ForegroundColor Red
        Write-Host "   Error: $($_.Exception.Message)" -ForegroundColor Yellow
    }

    if ($i -lt $repeatCount) {
        Start-Sleep -Seconds 5
    }
}

Write-Host "Collection Complete! Check your website." -ForegroundColor Cyan
