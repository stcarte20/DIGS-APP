param(
  [Parameter(Mandatory=$true)][string]$ConnectionId,
  [Parameter(Mandatory=$true)][string]$Server,
  [Parameter(Mandatory=$true)][string]$Database
)

$tables = @('[dbo].[Case]','[dbo].[CaseNote]','[dbo].[CaseTask]','[dbo].[CaseDocument]','[dbo].[vw_ActiveCases]')

foreach ($t in $tables) {
  Write-Host "Adding data source: $t" -ForegroundColor Cyan
  pac code add-data-source -a shared_sql -c $ConnectionId -t $t -d "$Server,$Database"
  if ($LASTEXITCODE -ne 0) {
    Write-Host "Failed: $t" -ForegroundColor Red
  } else {
    Write-Host "Added: $t" -ForegroundColor Green
  }
}

Write-Host "Done. Review generated Models/Services." -ForegroundColor Green
