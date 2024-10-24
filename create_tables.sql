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
    SuccessfulPurchaseID INT, YEAR.we32w
    FOREIGN KEY (SuccessfulPurchaseID) REFERENCES Purchase(PurchaseID)
);

INSERT INTO Accounts (AccountID, Username, Password) VALUES
(1, 'buyer1', 'buyer123'),
(2, 'seller1', 'seller123'),
(3, 'buyer2', 'buyer456'),
(4, 'seller2', 'seller456');

INSERT INTO BuyerAccount (AccountID, AvailableFunds, TotalFunds, IsFrozen) VALUES
(1, 1000.00, 1500.00, FALSE),
(3, 2000.00, 3000.00, FALSE);

INSERT INTO SellerAccount (AccountID, Funds, IsFrozen, IsClosed) VALUES
(2, 500.00, FALSE, FALSE),
(4, 750.00, FALSE, FALSE);

INSERT INTO Item (ItemID, Name, Description, Images, InitialPrice, StartDate, Duration, IsPublished, IsFrozen, IsArchived, IsComplete, IsFailed, SellerID) VALUES
(1, 'Antique Vase', 'A rare antique vase from the 18th century.', '[{"url":"image1.jpg"}, {"url":"image2.jpg"}]', 300.00, '2024-10-22 10:00:00', '2024-11-22 10:00:00', TRUE, FALSE, FALSE, FALSE, FALSE, 2),
(2, 'Vintage Painting', 'An original painting from the 19th century.', '[{"url":"painting1.jpg"}]', 500.00, '2024-10-21 12:00:00', '2024-11-21 12:00:00', TRUE, FALSE, FALSE, FALSE, FALSE, 4);

INSERT INTO Bid (BidID, BuyerID, ItemID, BidAmount) VALUES
(1, 1, 1, 350.00),
(2, 3, 2, 600.00);

INSERT INTO Purchase (PurchaseID, ItemID, Name, Description, Images, PurchasePrice, AuctionHouseProfit) VALUES
(1, 1, 'Antique Vase', 'A rare antique vase from the 18th century.', '[{"url":"image1.jpg"}, {"url":"image2.jpg"}]', 350.00, 35.00),
(2, 2, 'Vintage Painting', 'An original painting from the 19th century.', '[{"url":"painting1.jpg"}]', 600.00, 60.00);

INSERT INTO AuctionHouse (Funds, SuccessfulPurchaseID) VALUES
(10000.00, 1),
(15000.00, 2);
