param(
  [int]$Port = 3000
)

Set-Location $PSScriptRoot

# Check if port is already in use
$inUse = netstat -ano | Select-String "LISTENING" | Select-String ":$Port "
if ($inUse) {
  Write-Output "Port $Port is already in use. Server is likely running."
  Write-Output "Visit http://localhost:$Port/"
  exit 0
}

# Start server as persistent background job
$existing = Get-Job -Name "gender-predictor-server" -ErrorAction SilentlyContinue
if ($existing) {
  Stop-Job -Name "gender-predictor-server" -ErrorAction SilentlyContinue
  Remove-Job -Name "gender-predictor-server" -ErrorAction SilentlyContinue
}

Start-Job -Name "gender-predictor-server" -ScriptBlock {
  param($dir, $port)
  Set-Location $dir
  $env:PORT = $port
  node server.mjs
} -ArgumentList $PSScriptRoot, $Port | Out-Null

Start-Sleep 1
Write-Output "Gender Predictor running at http://localhost:$Port/"
Write-Output "To stop: Stop-Job -Name 'gender-predictor-server'; Remove-Job -Name 'gender-predictor-server'"
