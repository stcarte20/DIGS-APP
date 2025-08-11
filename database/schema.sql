/* DIGS Core SQL Schema (idempotent-ish) */
SET NOCOUNT ON;

/* Cases Table */
IF OBJECT_ID('dbo.Case','U') IS NULL
CREATE TABLE dbo.[Case] (
    CaseId INT IDENTITY(1,1) PRIMARY KEY,
    systemCaseId NVARCHAR(50) NOT NULL UNIQUE,
    caseName NVARCHAR(200) NULL,
    entryId INT NOT NULL,
    primaryCaseId NVARCHAR(50) NOT NULL,
    secondaryCaseId NVARCHAR(80) NULL,
    caseNumber NVARCHAR(50) NULL,
    employeeId NVARCHAR(25) NOT NULL,
    employeeFirstName NVARCHAR(100) NOT NULL,
    employeeLastName NVARCHAR(100) NOT NULL,
    unionGroup NVARCHAR(20) NULL,
    violationType NVARCHAR(50) NULL,
    severity INT NULL,
    likelihood INT NULL,
    status NVARCHAR(40) NOT NULL DEFAULT 'New',
    priority NVARCHAR(20) NULL,
    dok DATE NOT NULL,
    incidentDate DATE NOT NULL,
    reportedDate DATETIME2 NOT NULL DEFAULT SYSUTCDATETIME(),
    investigatorId NVARCHAR(50) NULL,
    assignedTo NVARCHAR(50) NULL,
    baseLocation NVARCHAR(10) NULL,
    riskScore INT NULL,
    litigationHold BIT NOT NULL DEFAULT 0,
    description NVARCHAR(MAX) NULL,
    summary NVARCHAR(MAX) NULL,
    investigationDeadline DATE NULL,
    closureDeadline DATE NULL,
    closeoutScheduled BIT NOT NULL DEFAULT 0,
    eruCompleted BIT NOT NULL DEFAULT 0,
    createdOn DATETIME2 NOT NULL DEFAULT SYSUTCDATETIME(),
    createdBy NVARCHAR(100) NULL,
    modifiedOn DATETIME2 NULL,
    modifiedBy NVARCHAR(100) NULL,
    IsActive BIT NOT NULL DEFAULT 1
);

/* CaseNote */
IF OBJECT_ID('dbo.CaseNote','U') IS NULL
CREATE TABLE dbo.CaseNote (
    CaseNoteId INT IDENTITY(1,1) PRIMARY KEY,
    CaseId INT NOT NULL,
    noteCategory NVARCHAR(50) NOT NULL,
    subject NVARCHAR(200) NULL,
    body NVARCHAR(MAX) NOT NULL,
    followUpFlag BIT NOT NULL DEFAULT 0,
    followUpDate DATE NULL,
    isConfidential BIT NOT NULL DEFAULT 0,
    createdOn DATETIME2 NOT NULL DEFAULT SYSUTCDATETIME(),
    createdBy NVARCHAR(100) NULL,
  FOREIGN KEY (CaseId) REFERENCES dbo.[Case](CaseId)
);

/* CaseTask */
IF OBJECT_ID('dbo.CaseTask','U') IS NULL
CREATE TABLE dbo.CaseTask (
    CaseTaskId INT IDENTITY(1,1) PRIMARY KEY,
    CaseId INT NOT NULL,
    title NVARCHAR(200) NOT NULL,
    description NVARCHAR(MAX) NULL,
    ownerId NVARCHAR(50) NULL,
    assignedTo NVARCHAR(50) NULL,
    assignedBy NVARCHAR(50) NULL,
    dueDate DATE NULL,
    completedDate DATE NULL,
    status NVARCHAR(30) NOT NULL DEFAULT 'Open',
    priority NVARCHAR(20) NULL,
    taskType NVARCHAR(50) NULL,
    createdOn DATETIME2 NOT NULL DEFAULT SYSUTCDATETIME(),
    createdBy NVARCHAR(100) NULL,
  FOREIGN KEY (CaseId) REFERENCES dbo.[Case](CaseId)
);

/* CaseDocument */
IF OBJECT_ID('dbo.CaseDocument','U') IS NULL
CREATE TABLE dbo.CaseDocument (
    CaseDocumentId INT IDENTITY(1,1) PRIMARY KEY,
    CaseId INT NOT NULL,
    fileName NVARCHAR(260) NOT NULL,
    fileSize BIGINT NULL,
    mimeType NVARCHAR(100) NULL,
    docType NVARCHAR(40) NULL,
    hash NVARCHAR(128) NULL,
    privilegedFlag BIT NOT NULL DEFAULT 0,
    storageLocation NVARCHAR(400) NULL,
    uploadedBy NVARCHAR(100) NULL,
    virusScanStatus NVARCHAR(20) NULL,
    virusScanDate DATETIME2 NULL,
    createdOn DATETIME2 NOT NULL DEFAULT SYSUTCDATETIME(),
  FOREIGN KEY (CaseId) REFERENCES dbo.[Case](CaseId)
);

/* View for active cases */
IF OBJECT_ID('dbo.vw_ActiveCases','V') IS NULL
EXEC('CREATE VIEW dbo.vw_ActiveCases AS SELECT * FROM dbo.[Case] WHERE IsActive = 1');

/* Stored Procedure: Create Case */
IF OBJECT_ID('dbo.usp_CreateCase','P') IS NOT NULL DROP PROCEDURE dbo.usp_CreateCase;
GO
CREATE PROCEDURE dbo.usp_CreateCase
  @EmployeeId NVARCHAR(25),
  @EmployeeFirstName NVARCHAR(100),
  @EmployeeLastName NVARCHAR(100),
  @IsPrmCase BIT,
  @DOK DATE,
  @IncidentDate DATE,
  @ReportedDate DATETIME2,
  @Description NVARCHAR(MAX) = NULL,
  @CreatedBy NVARCHAR(100) = NULL
AS
BEGIN
  SET NOCOUNT ON;
  DECLARE @SystemCaseId NVARCHAR(50) = CONCAT(CASE WHEN @IsPrmCase=1 THEN 'PRM' ELSE 'NPRM' END,'-',@EmployeeId,'-',FORMAT(GETDATE(),'yyyyMMddHHmmss'));
  INSERT INTO dbo.[Case](systemCaseId, caseName, entryId, primaryCaseId, secondaryCaseId, caseNumber, employeeId, employeeFirstName, employeeLastName, violationType, status, priority, dok, incidentDate, reportedDate, description, createdBy)
  VALUES(@SystemCaseId, CONCAT(@EmployeeLastName,',',@EmployeeFirstName,' ',@EmployeeId), 0, @SystemCaseId, CONCAT(@EmployeeLastName,',',@EmployeeFirstName,'-',@EmployeeId), @SystemCaseId, @EmployeeId, @EmployeeFirstName, @EmployeeLastName, NULL, 'New','Medium', @DOK, @IncidentDate, @ReportedDate, @Description, @CreatedBy);
  SELECT TOP 1 * FROM dbo.[Case] WHERE systemCaseId=@SystemCaseId;
END;
GO

/* Stored Procedure: Update Case Status */
IF OBJECT_ID('dbo.usp_UpdateCaseStatus','P') IS NOT NULL DROP PROCEDURE dbo.usp_UpdateCaseStatus;
GO
CREATE PROCEDURE dbo.usp_UpdateCaseStatus
  @SystemCaseId NVARCHAR(50),
  @Status NVARCHAR(40),
  @ChangedBy NVARCHAR(100)=NULL
AS
BEGIN
  SET NOCOUNT ON;
  UPDATE dbo.[Case]
    SET status=@Status, modifiedOn=SYSUTCDATETIME(), modifiedBy=@ChangedBy
    WHERE systemCaseId=@SystemCaseId;
  SELECT TOP 1 * FROM dbo.[Case] WHERE systemCaseId=@SystemCaseId;
END;
GO

/* Stored Procedure: Get Active Cases (for connector exposure) */
IF OBJECT_ID('dbo.GetActiveCases','P') IS NOT NULL DROP PROCEDURE dbo.GetActiveCases;
GO
CREATE PROCEDURE dbo.GetActiveCases
AS
BEGIN
  SET NOCOUNT ON;
  SELECT systemCaseId, caseName, status, reportedDate, employeeId, employeeFirstName, employeeLastName
  FROM dbo.[Case]
  WHERE IsActive = 1
  ORDER BY reportedDate DESC;
END;
GO

/* Indexes */
IF NOT EXISTS (SELECT 1 FROM sys.indexes WHERE name='IX_Case_systemCaseId')
  CREATE UNIQUE INDEX IX_Case_systemCaseId ON dbo.[Case](systemCaseId);
IF NOT EXISTS (SELECT 1 FROM sys.indexes WHERE name='IX_Case_status')
  CREATE INDEX IX_Case_status ON dbo.[Case](status);

PRINT 'DIGS schema script executed';
