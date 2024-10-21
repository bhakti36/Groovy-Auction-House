DROP TABLE IF EXISTS AuctionHouse;
DROP TABLE IF EXISTS Bid;
DROP TABLE IF EXISTS Purchase;
DROP TABLE IF EXISTS Item;
DROP TABLE IF EXISTS BuyerAccount;
DROP TABLE IF EXISTS SellerAccount;
DROP TABLE IF EXISTS Accounts;

CREATE TABLE Accounts (
    AccountID INT PRIMARY KEY,
    Username VARCHAR(255) Unique,
    Password VARCHAR(255)
);

CREATE TABLE BuyerAccount (
    AccountID INT PRIMARY KEY,
    AvailableFunds DECIMAL(10, 2),
    TotalFunds DECIMAL(10, 2),
    IsFrozen BOOLEAN,
    FOREIGN KEY (AccountID) REFERENCES Accounts(AccountID)
);

CREATE TABLE SellerAccount (
    AccountID INT PRIMARY KEY,
    Funds DECIMAL(10, 2),
    IsFrozen BOOLEAN,
    IsClosed BOOLEAN,
    FOREIGN KEY (AccountID) REFERENCES Accounts(AccountID)
);

CREATE TABLE Item (
    ItemID INT PRIMARY KEY,
    Name VARCHAR(255),
    Description TEXT,
    Images JSON, 
    InitialPrice DECIMAL(10, 2),
    StartDate DATETIME,
    Duration DATETIME,
    IsPublished BOOLEAN,
    IsFrozen BOOLEAN,
    IsArchived BOOLEAN,
    IsComplete BOOLEAN,
    IsFailed BOOLEAN,
    SellerID INT,
    FOREIGN KEY (SellerID) REFERENCES SellerAccount(AccountID)
);

CREATE TABLE Purchase (
    PurchaseID INT PRIMARY KEY AUTO_INCREMENT,
    ItemID INT,
    Name VARCHAR(255),
    Description TEXT,
    Images JSON, 
    PurchasePrice DECIMAL(10, 2),
    AuctionHouseProfit DECIMAL(10, 2),
    FOREIGN KEY (ItemID) REFERENCES Item(ItemID)
);

CREATE TABLE Bid (
    BidID INT PRIMARY KEY AUTO_INCREMENT,
    BuyerID INT,
    ItemID INT,
    BidAmount DECIMAL(10, 2),
    FOREIGN KEY (BuyerID) REFERENCES BuyerAccount(AccountID),
    FOREIGN KEY (ItemID) REFERENCES Item(ItemID)
);

CREATE TABLE AuctionHouse (
    Funds DECIMAL(10, 2) PRIMARY KEY,
    SuccessfulPurchaseID INT,
    FOREIGN KEY (SuccessfulPurchaseID) REFERENCES Purchase(PurchaseID)
);
