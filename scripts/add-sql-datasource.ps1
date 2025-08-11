param(
    [Parameter(Mandatory = $true)][string]$ConnectionId,
    [Parameter(Mandatory = $true)][string]$Server,
    [Parameter(Mandatory = $true)][string]$Database,
    [string]$Table = '[dbo].[Case]'
)

Write-Host "Adding SQL tabular data source ($Table) via Power Apps Code Apps CLI..." -ForegroundColor Cyan

pac code add-data-source -a shared_sql -c $ConnectionId -t $Table -d "$Server,$Database"

if ($LASTEXITCODE -eq 0) {
    Write-Host "✅ Data source added. Generated Models/Services should appear under src/Models and src/Services." -ForegroundColor Green
    Write-Host "   Re-run: npm run dev (or dev:full) to leverage generated service." -ForegroundColor Green
} else {
    Write-Host "❌ Failed to add data source (exit code $LASTEXITCODE)." -ForegroundColor Red
}
