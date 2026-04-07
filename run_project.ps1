# Smart Campus Hub - Project Launcher

# 1. Set up Java Path
$JDK_PATH = "C:\Program Files\Amazon Corretto\jdk17.0.18_9\bin"
if (Test-Path $JDK_PATH) {
    $env:PATH = "$JDK_PATH;" + $env:PATH
    Write-Host "✅ Java path configured: $JDK_PATH" -ForegroundColor Green
} else {
    Write-Host "❌ JDK not found at expected path. Please ensure Java 17+ is installed." -ForegroundColor Red
}

# 2. Start Backend
Write-Host "🚀 Starting Backend (Spring Boot)..." -ForegroundColor Cyan
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd backend; ./mvnw spring-boot:run"

# 3. Start Frontend
Write-Host "🚀 Starting Frontend (React)..." -ForegroundColor Cyan
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd frontend; npm start"

Write-Host "✨ Both servers are starting in new windows!" -ForegroundColor Yellow
Write-Host "Backend: http://localhost:8080"
Write-Host "Frontend: http://localhost:5173"
