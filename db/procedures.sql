-- Stored Procedures and View Deployment Script
-- Run this script in SSMS / Azure Data Studio / sqlcmd against database: LRDIGS
-- It creates/updates the core objects for Case intake & status management.

SET ANSI_NULLS ON;
SET QUOTED_IDENTIFIER ON;
GO

/* =============================================
   View: Active Cases
   Lists cases not Closed / Archived
============================================= */
CREATE OR ALTER VIEW dbo.vw_ActiveCases AS
SELECT c.CaseId,
       c.SystemCaseId,
       c.CaseName,
       c.Status,
       c.Priority,
       c.DOK,
       c.IncidentDate,
       c.InvestigationDeadline,
       c.ClosureDeadline,
       c.RiskScore,
       c.UrgencyLevel,
       c.CreatedOn,
       c.ModifiedOn
FROM dbo.[Case] c
WHERE c.Status NOT IN ('Closed','Archived');
GO

/* =============================================
   Procedure: Create Case
   Generates identifiers using sequences and inserts a new case row.
   Returns the full inserted row.
============================================= */
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

  INSERT INTO dbo.[Case](
      CaseId, SystemCaseId, CaseName, EntryId,
      EmployeeId, EmployeeFirstName, EmployeeLastName,
      UnionGroupCode, ViolationType, Severity, Likelihood,
      Status, Priority, DOK, IncidentDate, ReportedDate,
      InvestigatorId, BaseCode, RiskScore, LitigationHold,
      Description, Summary, InvestigationDeadline, ClosureDeadline,
      CloseoutScheduled, EruCompleted, Location, ConcernType,
      UrgencyLevel, IsPrmCase, FoiNeeded, SubmitterId,
      CreatedOn, CreatedBy)
  VALUES(
      @CaseGuid, @SystemCaseId, @CaseName, @NextSeq,
      @EmployeeId, @EmployeeFirstName, @EmployeeLastName,
      @UnionGroupCode, @ViolationType, @Severity, @Likelihood,
      'New', @Priority, @DOK, @IncidentDate, @ReportedDate,
      @InvestigatorId, @BaseCode, NULL, 0,
      @Description, @Summary, @InvestigationDeadline, @ClosureDeadline,
      0, 0, @Location, @ConcernType,
      @UrgencyLevel, @IsPrmCase, 0, @SubmitterId,
      SYSUTCDATETIME(), @CreatedBy);

  SELECT * FROM dbo.[Case] WHERE CaseId = @CaseGuid;
END;
GO

/* =============================================
   Procedure: Update Case Status
   Logs status change to CaseHistory
============================================= */
CREATE OR ALTER PROCEDURE dbo.usp_UpdateCaseStatus
  @SystemCaseId VARCHAR(30),
  @NewStatus NVARCHAR(50),
  @ChangedBy NVARCHAR(100) = NULL
AS
BEGIN
  SET NOCOUNT ON;
  DECLARE @CaseId UNIQUEIDENTIFIER;
  SELECT @CaseId = CaseId FROM dbo.[Case] WHERE SystemCaseId = @SystemCaseId;
  IF @CaseId IS NULL
  BEGIN
    RAISERROR('Case not found',16,1);
    RETURN;
  END
  DECLARE @OldStatus NVARCHAR(50);
  SELECT @OldStatus = Status FROM dbo.[Case] WHERE CaseId = @CaseId;
  IF @OldStatus = @NewStatus RETURN; -- no change

  UPDATE dbo.[Case]
    SET Status = @NewStatus,
        ModifiedOn = SYSUTCDATETIME(),
        ModifiedBy = @ChangedBy
    WHERE CaseId = @CaseId;

  INSERT INTO dbo.CaseHistory(CaseId, FieldName, OldValue, NewValue, ChangedBy)
  VALUES(@CaseId, 'Status', @OldStatus, @NewStatus, @ChangedBy);

  SELECT * FROM dbo.[Case] WHERE CaseId = @CaseId;
END;
GO

/* =============================================
   Procedure: Get Case By SystemCaseId
============================================= */
CREATE OR ALTER PROCEDURE dbo.usp_GetCaseBySystemCaseId
  @SystemCaseId VARCHAR(30)
AS
BEGIN
  SET NOCOUNT ON;
  SELECT * FROM dbo.[Case] WHERE SystemCaseId = @SystemCaseId;
END;
GO

/* =============================================
   OPTIONAL: Seed Lookup Data (Idempotent)
============================================= */
MERGE dbo.UnionGroup AS tgt
USING (VALUES ('UG1','Union Group 1'),('UG2','Union Group 2')) AS src(UnionGroupCode, UnionGroupName)
ON tgt.UnionGroupCode = src.UnionGroupCode
WHEN NOT MATCHED THEN INSERT(UnionGroupCode, UnionGroupName) VALUES(src.UnionGroupCode, src.UnionGroupName);
GO

MERGE dbo.BaseLocation AS tgt
USING (VALUES ('BASE1','Base Location 1'),('BASE2','Base Location 2')) AS src(BaseCode, BaseName)
ON tgt.BaseCode = src.BaseCode
WHEN NOT MATCHED THEN INSERT(BaseCode, BaseName) VALUES(src.BaseCode, src.BaseName);
GO

-- End of Script
