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

# Users Available(Testing, You can make your own too except the Admin):

UserID: buyer1 Password: buyer123

UserID: seller1 Password: seller123

UserID: Admin Password: Admin123

(Password is Case Sensitive)

# Improvements:
    AWS Screen Refresh Issue
    Avoid clicking the refresh button and using browser back button, as this may cause display disturbances or unexpected behavior.

    In the Seller → Add Item use case, while images are successfully uploaded to the S3 bucket, there currently isn't a way to view them within the application. As the Items when Added are not published, they cannot be viewed in the buyer home page. Currently while testing them, they are set as published as default so the added items are visible in the buyer account home page
