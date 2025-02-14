# Install dependencies listed in dependencies.txt
Write-Host "Installing dependencies from dependencies.txt..."

Get-Content "dependencies.txt" | ForEach-Object {
    npm install $_
}

Write-Host "All dependencies have been installed!"
