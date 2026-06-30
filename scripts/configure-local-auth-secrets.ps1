param(
  [switch]$LaunchNewWindow,
  [string]$EnvFile = ""
)

$ErrorActionPreference = "Stop"

if ($LaunchNewWindow) {
  $scriptPath = $PSCommandPath
  $arguments = @(
    "-NoExit",
    "-ExecutionPolicy",
    "Bypass",
    "-File",
    $scriptPath
  )

  if (-not [string]::IsNullOrWhiteSpace($EnvFile)) {
    $arguments += @("-EnvFile", $EnvFile)
  }

  Start-Process powershell -ArgumentList $arguments -WindowStyle Normal
  return
}

$repoRoot = Resolve-Path (Join-Path $PSScriptRoot "..")

if ([string]::IsNullOrWhiteSpace($EnvFile)) {
  $EnvFile = Join-Path $repoRoot ".env.local"
}

$envPath = [System.IO.Path]::GetFullPath($EnvFile)
$repoPath = [System.IO.Path]::GetFullPath($repoRoot)

if (-not $envPath.StartsWith($repoPath, [System.StringComparison]::OrdinalIgnoreCase)) {
  throw "Refusing to write outside the repository: $envPath"
}

function Convert-SecureStringToPlainText {
  param([securestring]$SecureString)

  $pointer = [Runtime.InteropServices.Marshal]::SecureStringToBSTR($SecureString)
  try {
    return [Runtime.InteropServices.Marshal]::PtrToStringBSTR($pointer)
  } finally {
    [Runtime.InteropServices.Marshal]::ZeroFreeBSTR($pointer)
  }
}

function New-AuthSecret {
  $bytes = New-Object byte[] 32
  $rng = [Security.Cryptography.RandomNumberGenerator]::Create()
  try {
    $rng.GetBytes($bytes)
    return [Convert]::ToBase64String($bytes)
  } finally {
    $rng.Dispose()
  }
}

function Read-EnvValues {
  param([string]$Path)

  $values = [ordered]@{}

  if (-not (Test-Path -LiteralPath $Path)) {
    return $values
  }

  foreach ($line in Get-Content -LiteralPath $Path) {
    if ($line -match '^\s*#' -or $line -notmatch '=') {
      continue
    }

    $parts = $line -split '=', 2
    $key = $parts[0].Trim()
    $value = if ($parts.Count -gt 1) { $parts[1] } else { "" }

    if (-not [string]::IsNullOrWhiteSpace($key)) {
      $values[$key] = $value
    }
  }

  return $values
}

function Read-PlainSetting {
  param(
    [string]$Prompt,
    [string]$CurrentValue,
    [string]$DefaultValue = ""
  )

  $fallback = if ([string]::IsNullOrWhiteSpace($CurrentValue)) { $DefaultValue } else { $CurrentValue }
  $suffix = if ([string]::IsNullOrWhiteSpace($fallback)) { "" } else { " [$fallback]" }
  $value = Read-Host "$Prompt$suffix"

  if ([string]::IsNullOrWhiteSpace($value)) {
    return $fallback
  }

  return $value.Trim()
}

function Read-SecretSetting {
  param(
    [string]$Prompt,
    [string]$CurrentValue
  )

  if (-not [string]::IsNullOrWhiteSpace($CurrentValue)) {
    $choice = Read-Host "$Prompt is already set. Press Enter to keep it, or type replace"

    if ($choice.Trim().ToLowerInvariant() -ne "replace") {
      return $CurrentValue
    }
  }

  $secureValue = Read-Host $Prompt -AsSecureString
  $plainValue = Convert-SecureStringToPlainText $secureValue

  if ([string]::IsNullOrWhiteSpace($plainValue)) {
    if (-not [string]::IsNullOrWhiteSpace($CurrentValue)) {
      return $CurrentValue
    }

    throw "$Prompt cannot be empty."
  }

  return $plainValue.Trim()
}

function Set-EnvValue {
  param(
    [hashtable]$Values,
    [string]$Key,
    [string]$Value
  )

  if ($null -ne $Value) {
    $Values[$Key] = $Value
  }
}

$values = Read-EnvValues $envPath

$authUrl = Read-PlainSetting "Auth URL" $values["AUTH_URL"] "http://localhost:3000"
$googleClientId = Read-PlainSetting "Google OAuth client ID" $values["AUTH_GOOGLE_ID"] ""
$googleClientSecret = Read-SecretSetting "Google OAuth client secret" $values["AUTH_GOOGLE_SECRET"]
$resendChoice = Read-Host "Configure Resend password reset email now? Type yes to configure"

Set-EnvValue $values "AUTH_URL" $authUrl
Set-EnvValue $values "AUTH_TRUST_HOST" (Read-PlainSetting "AUTH_TRUST_HOST" $values["AUTH_TRUST_HOST"] "true")

if ([string]::IsNullOrWhiteSpace($values["AUTH_SECRET"])) {
  Set-EnvValue $values "AUTH_SECRET" (New-AuthSecret)
}

Set-EnvValue $values "AUTH_GOOGLE_ID" $googleClientId
Set-EnvValue $values "AUTH_GOOGLE_SECRET" $googleClientSecret

if ($resendChoice.Trim().ToLowerInvariant() -eq "yes") {
  $resetEmailFrom = Read-PlainSetting "Password reset email from address" $values["PASSWORD_RESET_EMAIL_FROM"] ""
  $resendApiKey = Read-SecretSetting "Resend API key" $values["RESEND_API_KEY"]

  Set-EnvValue $values "PASSWORD_RESET_EMAIL_FROM" $resetEmailFrom
  Set-EnvValue $values "RESEND_API_KEY" $resendApiKey
}

$orderedKeys = @(
  "NEXT_PUBLIC_APP_NAME",
  "DATABASE_URL",
  "AUTH_URL",
  "AUTH_SECRET",
  "AUTH_TRUST_HOST",
  "AUTH_GOOGLE_ID",
  "AUTH_GOOGLE_SECRET",
  "AUTH_GITHUB_ID",
  "AUTH_GITHUB_SECRET",
  "PASSWORD_RESET_BASE_URL",
  "PASSWORD_RESET_EMAIL_FROM",
  "RESEND_API_KEY",
  "PASSWORD_RESET_DEBUG_LINKS",
  "OPENAI_API_KEY",
  "OPENAI_EMBEDDING_MODEL",
  "OPENAI_ANSWER_MODEL",
  "SEED_USER_EMAIL",
  "SEED_USER_PASSWORD"
)

$lines = New-Object System.Collections.Generic.List[string]
$written = @{}

foreach ($key in $orderedKeys) {
  if ($values.Contains($key)) {
    $lines.Add("$key=$($values[$key])")
    $written[$key] = $true
  }
}

foreach ($key in $values.Keys) {
  if (-not $written.ContainsKey($key)) {
    $lines.Add("$key=$($values[$key])")
  }
}

Set-Content -LiteralPath $envPath -Value $lines -Encoding UTF8

$callbackUrl = (New-Object System.Uri((New-Object System.Uri($authUrl), "/api/auth/callback/google"))).ToString()

Write-Host ""
Write-Host "Updated local auth settings in .env.local. Secret values were not printed."
Write-Host "Register this Google OAuth callback URL:"
Write-Host "  $callbackUrl"
