# Groovy-Auction-House
# Team Members:
Bhakti Natwarlal Patel
Badrivishal Ajeet Paurana
Shucheng Fang
Yilu Yang

# Auction House on React And AWS

# Completed Usecase for Group.Iteration.One

1) Buyer UseCase
1. Buyer/CreateAccount 
2. Buyer/LoginAccount 
3. Buyer/CloseAccount 
4. Buyer/AddFunds 
2) Seller UseCase
5. Seller/CreateAccount 
6. Seller/LoginAccount 
7. Seller/CloseAccount 
8. Seller/AddItem 
3) Admin
9. Admin/FreezeItem
10. Admin/UnFreezeItem


# Project Setup and Running the Application
1. To start the application, simply run the following command:
npm run dev
This command will open the home page of the application. The home page provides links to various other pages for easy navigation.
2. Navigation and Routing
To access the login page, click on the "Go to Login" button on the home page. This button will redirect you to the login page, as specified in the screen design.

# Improvements:
    If new Account is created, Buyer or Seller, Auto Update the Buyer and Seller Tables in SQL.
    PlaceBids Needs to Check if the last bid on the item is the same buyer
    Need to limit the input of the Edit Item Page to 
    AWS Screen Refresh Issue
    Avoid clicking the refresh button on the AWS screen, as this may cause display disturbances or unexpected behavior.

    View Uploaded Images in Seller's AddItem Use Case
    In the Seller → Add Item use case, while images are successfully uploaded to the S3 bucket, there currently isn't a way to view them within the application. Consider adding functionality to display uploaded images.