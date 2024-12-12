DROP TABLE IF EXISTS AuctionHouse;
DROP TABLE IF EXISTS Bid;
DROP TABLE IF EXISTS Purchase;
DROP TABLE IF EXISTS Item;
DROP TABLE IF EXISTS BuyerAccount;
DROP TABLE IF EXISTS SellerAccount;
DROP TABLE IF EXISTS AdminAccount;
DROP TABLE IF EXISTS Accounts;

CREATE TABLE Accounts
(
    AccountID INT AUTO_INCREMENT PRIMARY KEY,
    Username  VARCHAR(255) Unique,
    Password  VARCHAR(255),
    IsFrozen       BOOLEAN DEFAULT FALSE,
    IsClosed       BOOLEAN DEFAULT FALSE,
    AccountType ENUM('Buyer', 'Seller', 'Admin')
);

CREATE TABLE BuyerAccount
(
    AccountID      INT PRIMARY KEY,
    AvailableFunds DECIMAL(10, 2),
    TotalFunds     DECIMAL(10, 2),
    FOREIGN KEY (AccountID) REFERENCES Accounts (AccountID)
);

CREATE TABLE SellerAccount
(
    AccountID INT PRIMARY KEY,
    Funds     DECIMAL(10, 2),
    FOREIGN KEY (AccountID) REFERENCES Accounts (AccountID)
);

CREATE TABLE AdminAccount
(
    AccountID INT PRIMARY KEY,
    Funds     DECIMAL(10, 2),
    FOREIGN KEY (AccountID) REFERENCES Accounts (AccountID)
);

CREATE TABLE Item
(
    ItemID       INT AUTO_INCREMENT PRIMARY KEY,
    Name         VARCHAR(255),
    Description  TEXT,
    Images       JSON,
    InitialPrice DECIMAL(10, 2),
    StartDate    DATETIME,
    DurationDays INT,
    DurationHours INT,
    DurationMinutes INT,
    IsBuyNow BOOLEAN DEFAULT FALSE,
    IsPublished  BOOLEAN DEFAULT FALSE,
    IsFrozen     BOOLEAN DEFAULT FALSE,
    IsArchived   BOOLEAN DEFAULT FALSE,
    IsComplete   BOOLEAN DEFAULT FALSE,
    IsFailed     BOOLEAN DEFAULT FALSE,
    SellerID     INT,
    FOREIGN KEY (SellerID) REFERENCES SellerAccount (AccountID)
);

CREATE TABLE Purchase
(
    PurchaseID         INT PRIMARY KEY AUTO_INCREMENT,
    ItemID             INT UNIQUE,
    Name               VARCHAR(255),
    Description        TEXT,
    Images             JSON,
    PurchasePrice      DECIMAL(10, 2),
    AuctionHouseProfit DECIMAL(10, 2),
    FOREIGN KEY (ItemID) REFERENCES Item (ItemID)
);

CREATE TABLE Bid
(
    BidID     INT PRIMARY KEY AUTO_INCREMENT,
    BuyerID   INT,
    ItemID    INT,
    BidAmount DECIMAL(10, 2),
    BidTimeStamp DATETIME default CURRENT_TIMESTAMP,
    FOREIGN KEY (BuyerID) REFERENCES BuyerAccount (AccountID),
    FOREIGN KEY (ItemID) REFERENCES Item (ItemID)
);

# CREATE TABLE AuctionHouse (
#               Profit DECIMAL(10, 2) PRIMARY KEY,
#               SuccessfulPurchaseID INT,
#               FOREIGN KEY (SuccessfulPurchaseID) REFERENCES Purchase(PurchaseID)
# );

INSERT INTO Accounts (Username, Password, accountType)
VALUES ('buyer1', 'buyer123', 'Buyer'),
       ('seller1', 'seller123', 'Seller'),
       ('buyer2', 'buyer456', 'Buyer'),
       ('seller2', 'seller456', 'Seller'),
       ('Admin', 'Admin123', 'Admin'),
    ('thelittleshop','littleshop','Seller'),
    ('somegenzuser','genz','Buyer');




INSERT INTO BuyerAccount (AccountID, AvailableFunds, TotalFunds)
VALUES (1, 1150.00, 1500.00),
       (3, 2000.00, 3000.00);

INSERT INTO SellerAccount (AccountID, Funds)
VALUES (2, 500.00),
       (4, 750.00);

INSERT INTO Item (ItemID, Name, Description, Images, InitialPrice, StartDate, DurationDays, DurationHours, DurationMinutes, IsPublished, IsFrozen,
                  IsArchived, IsComplete, IsFailed, SellerID)
VALUES (1, 'Antique Vase', 'A rare antique vase from the 18th century.', '["20241110_001036/0.png", "20241110_001036/1.png"]', 300.00, '2024-10-22 10:00:00', 3, 20, 10, TRUE, FALSE, FALSE, FALSE, FALSE, 2),
       (2, 'Vintage Painting', 'An original painting from the 19th century.', '["20241110_001134/0.png"]', 500.00, '2024-10-21 12:00:00', 2, 5, 20, TRUE, FALSE, FALSE, FALSE, FALSE, 4),
        (3,'my bucket','a completely empty bucket','["20241111_014817/0.png"]',5.00,'2024-11-11 01:48:00',3,2,1,0,0,1,0,0,2);

INSERT INTO Bid (BidID, BuyerID, ItemID, BidAmount)
VALUES (1, 1, 1, 350.00),
       (3, 3, 1, 400.00),
       (2, 3, 2, 600.00);


INSERT INTO Purchase (PurchaseID, ItemID, Name, Description, Images, PurchasePrice, AuctionHouseProfit)
VALUES (1, 1, 'Antique Vase', 'A rare antique vase from the 18th century.', '[
  {
    "url": "image1.jpg"
  },
  {
    "url": "image2.jpg"
  }
]', 350.00, 35.00),
       (2, 2, 'Vintage Painting', 'An original painting from the 19th century.', '[
         {
           "url": "painting1.jpg"
         }
       ]', 600.00, 60.00);

# INSERT INTO AuctionHouse (Funds, SuccessfulPurchaseID)
# VALUES (10000.00, 1),
#        (15000.00, 2);

SELECT * FROM Accounts;
SELECT * FROM BuyerAccount;
SELECT * FROM SellerAccount;
SELECT * FROM Item;
SELECT * FROM Bid;
SELECT * FROM Purchase;

# UPDATE Accounts SET IsClosed = FALSE where AccountID=2;
#
UPDATE Item SET IsPublished = FALSE where ItemID = 4;
# UPDATE BuyerAccount SET AvailableFunds = AvailableFunds + 100, TotalFunds = TotalFunds + 100 where AccountID = 1;

DELETE FROM Purchase WHERE PurchaseID = 1;
DELETE FROM Purchase WHERE PurchaseID = 2;