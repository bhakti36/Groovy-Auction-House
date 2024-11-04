DROP TABLE IF EXISTS AuctionHouse;
DROP TABLE IF EXISTS Bid;
DROP TABLE IF EXISTS Purchase;
DROP TABLE IF EXISTS Item;
DROP TABLE IF EXISTS BuyerAccount;
DROP TABLE IF EXISTS SellerAccount;
DROP TABLE IF EXISTS Accounts;

CREATE TABLE Accounts
(
    AccountID INT AUTO_INCREMENT PRIMARY KEY,
    Username  VARCHAR(255) Unique,
    Password  VARCHAR(255),
    IsFrozen       BOOLEAN,
    IsClosed       BOOLEAN,
    accountType ENUM('Buyer', 'Seller', 'Admin')
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
    ItemID             INT,
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
#                               Funds DECIMAL(10, 2) PRIMARY KEY,
#                               SuccessfulPurchaseID INT,
#                               FOREIGN KEY (SuccessfulPurchaseID) REFERENCES Purchase(PurchaseID)
#     );

INSERT INTO Accounts (Username, Password, IsFrozen, IsClosed)
VALUES ('buyer1', 'buyer123', FALSE, FALSE),
       ('seller1', 'seller123', FALSE, FALSE),
       ('buyer2', 'buyer456', FALSE, FALSE),
       ('seller2', 'seller456', FALSE, FALSE);

INSERT INTO BuyerAccount (AccountID, AvailableFunds, TotalFunds)
VALUES (1, 1000.00, 1500.00),
       (3, 2000.00, 3000.00);

INSERT INTO SellerAccount (AccountID, Funds)
VALUES (2, 500.00),
       (4, 750.00);

INSERT INTO Item (ItemID, Name, Description, Images, InitialPrice, StartDate, DurationDays, DurationHours, DurationMinutes, IsPublished, IsFrozen,
                  IsArchived, IsComplete, IsFailed, SellerID)
VALUES (1, 'Antique Vase', 'A rare antique vase from the 18th century.', '[
  {
    "url": "image1.jpg"
  },
  {
    "url": "image2.jpg"
  }
]', 300.00, '2024-10-22 10:00:00', 3, 20, 10, TRUE, FALSE, FALSE, FALSE, FALSE, 2),
       (2, 'Vintage Painting', 'An original painting from the 19th century.', '[
         {
           "url": "painting1.jpg"
         }
       ]', 500.00, '2024-10-21 12:00:00', 2, 5, 20, TRUE, FALSE, FALSE, FALSE, FALSE, 4);

INSERT INTO Bid (BidID, BuyerID, ItemID, BidAmount)
VALUES (1, 1, 1, 350.00),
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
SELECT * FROM Item;