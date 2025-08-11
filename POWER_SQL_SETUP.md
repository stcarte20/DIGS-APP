# Power Apps SQL Tabular Data Source Setup

This guide ensures the DIGS Code App pulls Cases directly from Azure SQL in Power Apps using the built-in `shared_sql` connector (tabular data source).

## 1. Prerequisites

* Azure SQL Database with tables (e.g. `[dbo].[Case]`) and least-privilege SQL user.
* Firewall / private endpoint allows Azure Power Platform outbound connections.
* Power Platform environment ID: `189e6486-e123-e7a7-b745-314857769903`.
* Power Platform CLI authenticated (`pac auth create`) and environment selected.

## 2. Create / Locate SQL Connection in Environment

In Power Apps maker portal:

1. Go to Connections > New connection > SQL Server.
2. Choose Authentication: SQL Server Authentication (or Azure AD if configured).
3. Enter server, database, username, password.
4. After creation, open the connection; copy its Connection ID (GUID) from URL or details pane.

## 3. Add the Tabular Data Source (CLI)

Run the provided script (preferred on Windows PowerShell):

```powershell
cd "$(Resolve-Path .)"
./scripts/add-sql-datasource.ps1 -ConnectionId <YOUR_CONNECTION_ID_GUID> -Server your-sql-server.database.windows.net -Database YourDbName -Table '[dbo].[Case]'
```

Alternative direct command:

```powershell
pac code add-data-source -a shared_sql -c <YOUR_CONNECTION_ID_GUID> -t "[dbo].[Case]" -d "your-sql-server.database.windows.net,YourDbName"
```

If you want additional tables (e.g. notes, tasks):

```powershell
pac code add-data-source -a shared_sql -c <CONN> -t "[dbo].[CaseNote]" -d "server,db"
pac code add-data-source -a shared_sql -c <CONN> -t "[dbo].[CaseTask]" -d "server,db"
```

## 4. Generated Artifacts

On success the CLI updates:

* `power.config.json` (adds connection reference & datasource mapping)
* `.power/schemas/shared_sql/**` (connector + table schema)
* `src/Models/**` (TS models for tables)
* `src/Services/**` (service wrappers to call the connector)

Commit these changes (except secrets) to source control.

## 5. Using the Generated Service

After generation, you can import the table service. Example (pseudo until generated):

```ts
// Example path – adjust to actual generated filename
import { CaseTable } from '../Services/shared_sql/Case';

async function fetchCasesViaConnector() {
  const result = await CaseTable.list(); // typical pattern (verify actual method names)
  return result;
}
```

You can integrate this into `casesHybrid` by first attempting connector service before Express API / mock.

## 6. Priority Order Recommendation

1. Tabular Data Source (`shared_sql`) – direct Power Platform managed connection.
2. Express API fallback (`server/index.ts`) – for custom procs/views not exposed as tabular.
3. In-memory mock – development offline safety net.

## 7. Exposing Views / Stored Procedures

Tabular connector surfaces tables & views. If you need `vw_ActiveCases`, add a SQL view with a deterministic schema, then:

```powershell
pac code add-data-source -a shared_sql -c <CONN> -t "[dbo].[vw_ActiveCases]" -d "server,db"
```

Note: Some views may need `SCHEMABINDING` & explicit column list for best metadata.

## 8. Regeneration / Schema Changes

After altering a table/view:

```powershell
pac code remove-data-source -a shared_sql -t "[dbo].[Case]" # if supported in your CLI version
pac code add-data-source -a shared_sql -c <CONN> -t "[dbo].[Case]" -d "server,db"
```

Or re-run add command (CLI may refresh schema in-place).

## 9. Troubleshooting

| Issue | Cause | Fix |
|-------|-------|-----|
| Command fails w/ auth error | Not logged in | Run `pac auth create` then `pac env select -env <envId>` |
| No Models generated | Wrong table name / permissions | Verify table exists & user has SELECT rights |
| Timeout / network | Firewall blocking Azure region | Add Azure services / Power Platform IPs to firewall |
| Empty results in app | Table has no rows | Insert test row directly in SQL |

## 10. Security Notes

* Use least-privilege SQL account (SELECT/EXEC needed objects only).
* Avoid exposing PII columns not needed – consider view projection.
* Keep credentials out of repo (`.env`, Azure Key Vault, etc.).

---

After completing steps run:

```powershell
npm run dev:codeapp
```

Open the Power Apps play URL including `_localAppUrl` and verify cases populate via connector.
