$secret = "gktmtmxhs@12"
$baseUrl = "http://localhost:3000"

$categories = @(
    'laptop', 'desktop', 'monitor', 'tablet', 'mouse', 'keyboard', 
    'watch', 'audio', 'speaker', 'camera', 'tv', 'refrigerator', 
    'washer', 'clothes_dryer', 'air_conditioner', 'air_purifier', 
    'cleaner', 'hair_dryer', 'massage', 'accessory'
)

Write-Host "🚀 [수동 모드] 전체 카테고리 업데이트 시작..." -ForegroundColor Cyan

foreach ($slug in $categories) {
    Write-Host "[진행중] $slug 업데이트..." -NoNewline

    $uri = "$baseUrl/api/cron/update-rankings?secret=$secret&slug=$slug"

    try {
        $response = Invoke-RestMethod -Uri $uri -Method Get -ErrorAction Stop -TimeoutSec 600
        Write-Host " ✅ 완료" -ForegroundColor Green
    }
    catch {
        Write-Host " ❌ 실패" -ForegroundColor Red
        Write-Host "   에러: $($_.Exception.Message)" -ForegroundColor Yellow
    }

    Start-Sleep -Seconds 3
}

Write-Host "🎉 모든 업데이트가 끝났습니다!" -ForegroundColor Cyan