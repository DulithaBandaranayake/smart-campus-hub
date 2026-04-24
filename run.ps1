# Smart Campus Hub - Run Script
# Usage: .\run.ps1

Write-Host "--- Starting Smart Campus Hub ---" -ForegroundColor Cyan

# Set JAVA_HOME for this session
$env:JAVA_HOME = "C:\Program Files\Eclipse Adoptium\jdk-17.0.18.8-hotspot"

# Start Backend
Write-Host "Starting Backend (Spring Boot)..."
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd backend; `$env:JAVA_HOME='C:\Program Files\Eclipse Adoptium\jdk-17.0.18.8-hotspot'; .\mvnw.cmd spring-boot:run" -WindowStyle Normal

# Start Frontend
Write-Host "Starting Frontend (Vite)..."
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd frontend; npm run dev" -WindowStyle Normal

Write-Host "Servers are starting in separate windows." -ForegroundColor Green
Write-Host "Backend: http://localhost:8081"
Write-Host "Frontend: http://localhost:5173"
