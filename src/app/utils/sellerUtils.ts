import { Item } from "../models/item";

export const determineItemStatusAndActions = (item: Item) => {
    const now = new Date();
    const endTime = new Date(item.startDate);
    endTime.setDate(endTime.getDate() + item.durationDays);
    endTime.setHours(endTime.getHours() + item.durationHours);
    endTime.setMinutes(endTime.getMinutes() + item.durationMinutes);
    // console.log("end", endTime);
  
    const timeLeft = endTime.getTime() - now.getTime();
    let status = "";
    let actions: string[] = [];
  
    if (item.isFrozen) {
      status = "Frozen";
      actions = ["Request Unfreeze"];
    } else if (timeLeft > 0) {
      if (item.isPublished) {
        status = "Active";
        actions = item.bids.length > 0 ? [] : ["Unpublish"];
      } else {
        status = "Inactive";
        actions = ["Publish", "Edit", "Remove"];
      }
    } else {
      if (item.bids.length > 0) {
        status = "Completed";
        actions = ["Fulfill"];
      } else {
        status = "Failed";
        actions = ["Archive"];
      }
    }
    console.log("status", status, item.name);
  
    return { status, actions };
  };
  