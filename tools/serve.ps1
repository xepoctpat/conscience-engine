# Serve the Floodlit Archive reader on this machine only.
# Uses the project .venv — never the global interpreter.
# Binding 127.0.0.1 avoids the Windows Firewall LAN/public prompt.
# Default 18780 avoids common local probes on 8080 (Razer Synapse / WYVRN).
# If a preview is already up, this script reuses it instead of binding twice.
param(
    [int]$Port = 18780,
    [switch]$Open,
    [switch]$Detach
)

$ErrorActionPreference = "Stop"
$root = Split-Path -Parent $PSScriptRoot
Set-Location -LiteralPath $root

function Get-VenvPython {
    $windows = Join-Path $root ".venv\Scripts\python.exe"
    $posix = Join-Path $root ".venv\bin\python"
    if (Test-Path -LiteralPath $windows) { return $windows }
    if (Test-Path -LiteralPath $posix) { return $posix }
    throw @"
Project virtualenv is missing.
Create it once, then serve:

  pwsh -File tools\bootstrap.ps1
  pwsh -File tools\serve.ps1

Do not use global python or py -m http.server.
"@
}

function Test-PortOpen {
    param([string]$Bind, [int]$Port)
    $client = New-Object System.Net.Sockets.TcpClient
    try {
        $iar = $client.BeginConnect($Bind, $Port, $null, $null)
        $ok = $iar.AsyncWaitHandle.WaitOne(400)
        if (-not $ok) { return $false }
        $client.EndConnect($iar)
        return $true
    } catch {
        return $false
    } finally {
        $client.Dispose()
    }
}

function Test-ReaderUp {
    param([string]$Listen)
    try {
        $req = [System.Net.HttpWebRequest]::Create($Listen)
        $req.Method = "GET"
        $req.Timeout = 2000
        $req.ReadWriteTimeout = 2000
        $req.UserAgent = "FloodlitArchive-ensure-serve"
        $resp = $req.GetResponse()
        try {
            $reader = New-Object System.IO.StreamReader($resp.GetResponseStream())
            $body = $reader.ReadToEnd()
            $reader.Close()
        } finally {
            $resp.Close()
        }
        return $body -match "Floodlit Archive|Conscience Engine"
    } catch {
        return $false
    }
}

$python = Get-VenvPython
$bind = "127.0.0.1"
$listen = "http://${bind}:${Port}/"
$servePy = Join-Path $PSScriptRoot "serve.py"

Write-Host "Floodlit Archive reader"
Write-Host "  root     $root"
Write-Host "  python   $python"
Write-Host "  listen   $listen"
Write-Host "  bind     $bind (localhost only)"

if (Test-ReaderUp -Listen $listen) {
    Write-Host "  state    already listening (reusing)"
    if ($Open) { Start-Process $listen }
    exit 0
}

if (Test-PortOpen -Bind $bind -Port $Port) {
    throw "Port $bind`:$Port is in use, but it is not this reader. Stop that process, then run tools\serve.ps1 again."
}

if ($Detach) {
    Write-Host "  state    starting detached"
    # ArgumentList must quote paths: this folder name contains spaces.
    $argLine = '"{0}" --port {1} --bind {2} --root "{3}"' -f $servePy, $Port, $bind, $root
    $psi = New-Object System.Diagnostics.ProcessStartInfo
    $psi.FileName = $python
    $psi.Arguments = $argLine
    $psi.WorkingDirectory = $root
    $psi.UseShellExecute = $false
    $psi.CreateNoWindow = $true
    # Windows Python may keep a parent+child pair with the same command line.
    # The child is the listener. Do not treat the parent as an orphan.
    [void][System.Diagnostics.Process]::Start($psi)

    $deadline = (Get-Date).AddSeconds(8)
    do {
        Start-Sleep -Milliseconds 200
        if (Test-ReaderUp -Listen $listen) {
            Write-Host "  state    ready"
            if ($Open) { Start-Process $listen }
            exit 0
        }
    } while ((Get-Date) -lt $deadline)

    throw "Started the preview but $listen did not answer. Check that only .venv python is bound to $Port."
}

Write-Host "Stop with Ctrl+C."
Write-Host ""
if ($Open) { Start-Process $listen }
& $python $servePy --port $Port --bind $bind --root $root
if ($LASTEXITCODE -ne 0 -and (Test-ReaderUp -Listen $listen)) {
    Write-Host "  state    already listening (reusing)"
    exit 0
}
