# Database Deployment Notes

Issue: Creating or altering `usp_CreateCase` with full body is not persisting when executed via the current SQL execution channel. Simple procedures (like `usp_ProcTest`) succeed, but multi-parameter definitions or those using sequences inside the CREATE statement appear to be ignored (object not created) without an error message.

Confirmed Working:

- Tables exist: Case, CaseHistory, CaseWitness, CaseContextTag, Investigator, UnionGroup, BaseLocation.
- Sequences exist: Seq_PRMCase, Seq_NPRMCase, Seq_CaseEntry.
- View exists: vw_ActiveCases.
- Procedure `usp_UpdateCaseStatus` exists with full logic.
- Direct INSERT into Case with sequences works and row is visible.

Symptoms:

- Executing a CREATE PROCEDURE statement with many parameters returns "Query has no results to return" (normal) but the object is not in sys.objects afterwards.
- Creating a very small procedure with 3-4 params or none works.

Potential Causes / Hypotheses:

1. Hidden batch splitter requirement or max statement size limit in the execution tool causing silent skip.
2. Specific tokens (NVARCHAR(MAX) parameter, or usage of sequences) within CREATE not supported in the execution sandbox.
3. Need for separate batches: CREATE first minimal, then ALTER to expand (attempted; expansion ALTER ignored similarly).

Workaround Plan:

- Keep a minimal CREATE (already works) then apply incremental ALTER steps each adding a small set of params and logic, verifying after each.
- If still blocked, export the final desired procedure script here and run it via alternate tooling (SSMS / Azure Data Studio / sqlcmd) directly against the DB.

Next Steps Script (Desired Final Procedure):

```sql
CREATE OR ALTER PROCEDURE dbo.usp_CreateCase
  @EmployeeId NVARCHAR(50),
  @EmployeeFirstName NVARCHAR(100),
  @EmployeeLastName NVARCHAR(100),
  @IsPrmCase BIT,
  @DOK DATE,
  @IncidentDate DATE,
  @ReportedDate DATETIME2(7),
  @Description NVARCHAR(MAX) = NULL,
  @Summary NVARCHAR(MAX) = NULL,
  @InvestigationDeadline DATE = NULL,
  @ClosureDeadline DATE = NULL,
  @InvestigatorId UNIQUEIDENTIFIER = NULL,
  @UnionGroupCode VARCHAR(20) = NULL,
  @BaseCode VARCHAR(20) = NULL,
  @ViolationType NVARCHAR(100) = NULL,
  @Priority NVARCHAR(50) = NULL,
  @ConcernType NVARCHAR(100) = NULL,
  @UrgencyLevel NVARCHAR(50) = NULL,
  @Severity TINYINT = NULL,
  @Likelihood TINYINT = NULL,
  @Location NVARCHAR(200) = NULL,
  @SubmitterId NVARCHAR(100) = NULL,
  @CreatedBy NVARCHAR(100) = NULL
AS
BEGIN
  SET NOCOUNT ON;
  DECLARE @NextSeq INT = NEXT VALUE FOR dbo.Seq_CaseEntry;
  DECLARE @CaseGuid UNIQUEIDENTIFIER = NEWID();
  DECLARE @NextSystemIdNumber INT = CASE WHEN @IsPrmCase = 1 THEN NEXT VALUE FOR dbo.Seq_PRMCase ELSE NEXT VALUE FOR dbo.Seq_NPRMCase END;
  DECLARE @SystemCaseId VARCHAR(30) = CONCAT(CASE WHEN @IsPrmCase = 1 THEN 'PRM-AFA-' ELSE 'NPRM-AFA-' END, RIGHT(CONCAT('0000', @NextSystemIdNumber),4));
  DECLARE @CaseName NVARCHAR(250) = CONCAT(@EmployeeLastName, ', ', @EmployeeFirstName, ' ', @EmployeeId);
  INSERT INTO dbo.[Case](CaseId, SystemCaseId, CaseName, EntryId, EmployeeId, EmployeeFirstName, EmployeeLastName, UnionGroupCode, ViolationType, Severity, Likelihood, Status, Priority, DOK, IncidentDate, ReportedDate, InvestigatorId, BaseCode, RiskScore, LitigationHold, Description, Summary, InvestigationDeadline, ClosureDeadline, CloseoutScheduled, EruCompleted, Location, ConcernType, UrgencyLevel, IsPrmCase, FoiNeeded, SubmitterId, CreatedOn, CreatedBy)
  VALUES(@CaseGuid, @SystemCaseId, @CaseName, @NextSeq, @EmployeeId, @EmployeeFirstName, @EmployeeLastName, @UnionGroupCode, @ViolationType, @Severity, @Likelihood, 'New', @Priority, @DOK, @IncidentDate, @ReportedDate, @InvestigatorId, @BaseCode, NULL, 0, @Description, @Summary, @InvestigationDeadline, @ClosureDeadline, 0, 0, @Location, @ConcernType, @UrgencyLevel, @IsPrmCase, 0, @SubmitterId, SYSUTCDATETIME(), @CreatedBy);
  SELECT * FROM dbo.[Case] WHERE CaseId = @CaseGuid;
END;
```

Alternate Minimal Verified Version (works):

```sql
ALTER PROCEDURE dbo.usp_CreateCase
  @EmployeeId NVARCHAR(50),
  @EmployeeFirstName NVARCHAR(100),
  @EmployeeLastName NVARCHAR(100),
  @IsPrmCase BIT
AS
BEGIN
  SET NOCOUNT ON;
  SELECT @EmployeeId AS EmployeeId, @EmployeeFirstName AS FirstName, @IsPrmCase AS IsPrmCase;
END;
```

Recommendation: Execute the full CREATE OR ALTER script in SSMS or Azure Data Studio until tooling limitation is resolved.
