# PowerShell script to add OpenAI API key to backend/.env

$envFile = "backend\.env"
$apiKey = "sk-proj-YOUR_API_KEY_HERE"

Write-Host "Adding OpenAI API key to backend/.env..." -ForegroundColor Green

if (Test-Path $envFile) {
    $content = Get-Content $envFile -Raw
    
    if ($content -match "OPENAI_API_KEY=") {
        # Replace existing OPENAI_API_KEY line
        $content = $content -replace "OPENAI_API_KEY=.*", "OPENAI_API_KEY=$apiKey"
        Set-Content -Path $envFile -Value $content -NoNewline
        Write-Host "✅ OpenAI API key updated in backend/.env" -ForegroundColor Green
    } else {
        # Add new line if not found
        Add-Content -Path $envFile -Value "`nOPENAI_API_KEY=$apiKey"
        Write-Host "✅ OpenAI API key added to backend/.env" -ForegroundColor Green
    }
} else {
    Write-Host "❌ backend/.env file not found. Creating from template..." -ForegroundColor Yellow
    Copy-Item "env.example.txt" $envFile
    Add-Content -Path $envFile -Value "`nOPENAI_API_KEY=$apiKey"
    Write-Host "✅ Created backend/.env with OpenAI API key" -ForegroundColor Green
}

Write-Host "`nOpenAI API integration is ready! 🚀" -ForegroundColor Cyan


