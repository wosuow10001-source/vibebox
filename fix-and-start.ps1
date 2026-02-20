# Vibebox 빌드 문제 해결 및 서버 시작 스크립트

Write-Host "==================================" -ForegroundColor Cyan
Write-Host "Vibebox 빌드 문제 해결 시작" -ForegroundColor Cyan
Write-Host "==================================" -ForegroundColor Cyan
Write-Host ""

# 1. .next 폴더 삭제
Write-Host "[1/3] .next 폴더 삭제 중..." -ForegroundColor Yellow
if (Test-Path ".next") {
    Remove-Item -Recurse -Force ".next" -ErrorAction SilentlyContinue
    Start-Sleep -Seconds 1
    if (Test-Path ".next") {
        Write-Host "  ❌ .next 폴더 삭제 실패" -ForegroundColor Red
        Write-Host "  수동으로 삭제해주세요: Remove-Item -Recurse -Force .next" -ForegroundColor Red
        exit 1
    } else {
        Write-Host "  ✅ .next 폴더 삭제 완료" -ForegroundColor Green
    }
} else {
    Write-Host "  ✅ .next 폴더 이미 없음" -ForegroundColor Green
}

Write-Host ""

# 2. package.json 확인
Write-Host "[2/3] 프로젝트 설정 확인 중..." -ForegroundColor Yellow
if (Test-Path "package.json") {
    Write-Host "  ✅ package.json 존재" -ForegroundColor Green
} else {
    Write-Host "  ❌ package.json 없음" -ForegroundColor Red
    exit 1
}

if (Test-Path "node_modules") {
    Write-Host "  ✅ node_modules 존재" -ForegroundColor Green
} else {
    Write-Host "  ⚠️  node_modules 없음 - npm install 실행 필요" -ForegroundColor Yellow
    Write-Host "  npm install을 실행하세요" -ForegroundColor Yellow
    exit 1
}

Write-Host ""

# 3. 서버 시작
Write-Host "[3/3] 개발 서버 시작 중..." -ForegroundColor Yellow
Write-Host "  서버를 중지하려면 Ctrl+C를 누르세요" -ForegroundColor Cyan
Write-Host ""
Write-Host "==================================" -ForegroundColor Cyan
Write-Host ""

npm run dev
