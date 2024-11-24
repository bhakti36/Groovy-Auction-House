"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import FilterBar from "@/app/component/FilterBar";
import { determineItemStatusAndActions } from "@/app/utils/sellerUtils";
import { Item, ItemJson, Bid, BidJson } from "@/app/models/item";
import axios from "axios";
import "@/app/component/FilterBar.css";

const instance = axios.create({
  baseURL: "https://mtlda2oa5d.execute-api.us-east-2.amazonaws.com/Test",
});

export default function SellerPage() {
  let totalFunds = 0;
  const [walletAmount, setWalletAmount] = useState(0);
  // const [showNewItemDialog, setShowNewItemDialog] = useState(false);
  // const [newItemName, setNewItemName] = useState('');
  const router = useRouter();
  const [, setErrorMessage] = useState("");
  const [userNameHome, setUserName] = useState("");
  const [searchQuery] = useState("");
  const [sortChoice] = useState("timeLeft");
  const [userID, setUserID] = useState<number | null>(null);
  const [filter, setFilter] = useState<string>("All");
  const [items, setItems] = useState<Item[]>([]);
  
  useEffect(() => {
    const info = sessionStorage.getItem("userInfo");
    let userName = "";
    // console.log(info)
    if (info != null) {
      console.log(info);
      const json = JSON.parse(info);
      console.log("json", json);
      console.log("username", json.success.username);
      totalFunds = parseInt(json.success.funds);
      console.log(totalFunds);
      setWalletAmount(totalFunds);
      userName = json.success.username;
      setUserName(userName);
      setUserID(json.success.accountID);  
      handleViewItem();
      console.log("handleViewItem", items);
    }
    
  }, [userID]);

  const handleAddNewItem = () => {
    router.push("/pages/AddItemPage");
  };

  const handleCloseAccount = () => {
    const userConfirmed = window.confirm(
      "Are you sure you want to close your account? This action cannot be undone."
    );
  
    if (userConfirmed) {
      const request = {
        sellerID: userID,
      };
  
      instance
        .post("/seller/closeAccount", request)
        .then((response) => {
          console.log("Response:", response.data);
          setErrorMessage("");
          setWalletAmount(0);
          alert("Account closed.");
          router.replace("/pages/LoginPage");
        })
        .catch((error) => {
          console.error(
            "Error response:",
            error.response ? error.response.data : error.message
          );
          setErrorMessage("Error closing account.");
        });
    } else {
      alert("Account closure canceled.");
    }
  };  

  const handleViewItem = () => {
    const request = { sellerID: userID };
    console.log("Request:", request);

    instance
      .post("/seller/reviewItems", request)
      .then((response) => {
        // console.log("Response:", response.data);
        if (response.data.status !== 200) {
          setErrorMessage("Error retrieving items.");
          return;
        }
        const responseItems: ItemJson[] =
          response.data?.success?.items || response.data.items || [];
        console.log("Response Items:", responseItems);
        const base_html =
          "https://groovy-auction-house.s3.us-east-2.amazonaws.com/images/";

        const formattedItems: Item[] = responseItems.map((item: ItemJson) => {
          const imageUrl =
            base_html + (JSON.parse(item.Images)[0] || "default_image.jpg");
          const timeLeft = calculateTimeLeft(
            item.StartDate,
            item.DurationDays,
            item.DurationHours,
            item.DurationMinutes
          );

          // Determine status and actions
          const { status, actions } = determineItemStatusAndActions({
            id: item.ItemID,
            name: item.Name,
            description: item.Description,
            image: imageUrl,
            value: `$${item.InitialPrice}`,
            timeLeft,
            startDate: item.StartDate,
            durationDays: item.DurationDays,
            durationHours: item.DurationHours,
            durationMinutes: item.DurationMinutes,
            isFrozen: item.IsFrozen,
            isPublished: item.IsPublished,
            isArchived: item.IsArchived,
            bids: item.bids.map((bid: BidJson) => ({
              id: bid.BidID,
              buyerID: bid.BuyerID,
              bidAmount: bid.BidAmount,
              bidTimeStamp: bid.BidTimeStamp,
            })),
            status: "",
            actions: [],
          });

          return {
            id: item.ItemID,
            name: item.Name,
            description: item.Description,
            image: imageUrl,
            value: `$${item.InitialPrice}`,
            timeLeft,
            startDate: item.StartDate,
            durationDays: item.DurationDays,
            durationHours: item.DurationHours,
            durationMinutes: item.DurationMinutes,
            isFrozen: item.IsFrozen,
            isPublished: item.IsPublished,
            isArchived: item.IsArchived,
            bids: item.bids.map((bid: BidJson) => ({
              id: bid.BidID,
              buyerID: bid.BuyerID,
              bidAmount: bid.BidAmount,
              bidTimeStamp: bid.BidTimeStamp,
            })),
            status,
            actions,
          };
        });
        console.log("Formated Items:", formattedItems);
        setItems(formattedItems);
        setErrorMessage("");
      })
      .catch((error) => {
        console.error("Error response:", error);
        setErrorMessage("Error retrieving items.");
      });
  };

  useEffect(() => {
    const interval = setInterval(() => {
      setItems((prevItems) =>
        prevItems.map((item) => ({
          ...item,
          timeLeft: calculateTimeLeft(
            item.startDate,
            item.durationDays,
            item.durationHours,
            item.durationMinutes
          ),
        }))
      );
    }, 1000);

    return () => clearInterval(interval);
  }, [userID]);

  const handleEditItem = (itemID: number) => {
    router.push(`/pages/EditItemPage?ItemID=${itemID}`);
  };

  const handleFullfillItem = (itemID: number) => {
    const userConfirmed = window.confirm(
      "Are you sure you want to Fullfill this item?"
    );
  
    if (userConfirmed) {
      const request = {
        ItemID: itemID,
        SellerID: userID
      };
  
      instance
        .post("/seller/fullfillItem", request)
        .then((response) => {
          console.log("Response:", response.data);
          setErrorMessage("");
        })
        .catch((error) => {
          console.error(
            "Error response:",
            error.response ? error.response.data : error.message
          );
          setErrorMessage("Error fullfill item.");
        });
    } else {
      alert("Item Fullfill canceled.");
    }
  };

  const handleArchiveItem = (itemID: number) => {
    const userConfirmed = window.confirm(
      "Are you sure you want to Archive this item?"
    );
  
    if (userConfirmed) {
      const request = {
        ItemID: itemID,
        SellerID: userID
      };
  
      instance
        .post("/seller/archiveItem", request)
        .then((response) => {
          console.log("Response:", response.data);
          setErrorMessage("");
        })
        .catch((error) => {
          console.error(
            "Error response:",
            error.response ? error.response.data : error.message
          );
          setErrorMessage("Error archive item.");
        });
    } else {
      alert("Item Archive canceled.");
    }
  };

  const doAction = (action: string, itemID: number) => {
    console.log("Action:", action);
    console.log("ItemID:", itemID);
    switch (action) {
      case "Publish":
        console.log("Publishing item");
        break;
      case "Unpublish":
        console.log("Unpublishing item");
        break;
      case "Edit":
        console.log("Editing item");
        handleEditItem(itemID);
        break;
      case "Remove":
        console.log("Removing item");
        break;
      case "Fulfill":
        console.log("Fulfilling item");
        handleFullfillItem(itemID);
        break;
      case "Archive":
        console.log("Archiving item");
        handleArchiveItem(itemID);
        break;
      case "Request Unfreeze":
        console.log("Requesting unfreeze");
        break;
      default:
        console.log("Invalid action");
        break;
    }
  };

  const calculateTimeLeft = (
    startDate: string,
    durationDays: number,
    durationHours: number,
    durationMinutes: number
  ) => {
    const now = new Date();
    const start = new Date(startDate);

    start.setDate(start.getDate() + durationDays);
    start.setHours(start.getHours() + durationHours);
    start.setMinutes(start.getMinutes() + durationMinutes);

    const diff = start.getTime() - now.getTime();

    if (diff <= 0) return "Ended";

    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((diff % (1000 * 60)) / 1000);

    if (days > 0) return `${days}d ${hours}h ${minutes}m ${seconds}s`;
    if (hours > 0) return `${hours}h ${minutes}m ${seconds}s`;
    if (minutes > 0) return `${minutes}m ${seconds}s`;
    return `${seconds}s`;
  };

  const filteredItems = items
    .filter((item) => filter === "All" || item.status === filter)
    .sort((a, b) => {
      if (sortChoice === "timeLeft") {
        return a.timeLeft.localeCompare(b.timeLeft);
      }
      return 0;
    });

  return (
    <main className="min-h-screen p-6 bg-gray-100">
      <header className="flex justify-between items-center p-4 bg-white shadow-md">
        <h1 className="text-xl font-semibold">Seller Home Page</h1>
        <h1>{userNameHome}</h1>
      </header>
      <div className="mt-10 flex justify-end items-center space-x-4">
        <div className="text-lg">Wallet: ${walletAmount}</div>
        <button
          onClick={() => handleAddNewItem()}
          className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600"
        >
          New Item
        </button>
        <button
          onClick={handleCloseAccount}
          className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600"
        >
          Close Account
        </button>
      </div>
      <FilterBar setFilter={setFilter} />
      <div className="grid-container">
        {filteredItems.map((item) => (
          <div key={item.id} className="item-card">
            <img src={item.image} alt={item.name} className="item-image" />
            <h3 className="item-name">{item.name}</h3>
            <div className="item-status-value">
              <p className="item-time">Time Left</p>
              <p className="item-time">{item.timeLeft}</p>
            </div>
            <div className="item-status-value">
              <p className="item-status">{item.status}</p>
              <p className="item-value">{item.value}</p>
            </div>
            {item.isFrozen ? (
              <div className="overlay">
              </div>
            ) : <div></div>}
              <div className="item-actions">
                {item.actions.map((action) => (
                  <button
                    key={action}
                    onClick={() => doAction(action, item.id)}
                    className={`action-button ${action
                      .replace(/\s+/g, "-")
                      .toLowerCase()}-button`}
                  >
                    {action}
                  </button>
                ))}
              </div>
            
          </div>
        ))}
      </div>
    </main>
  );
}
