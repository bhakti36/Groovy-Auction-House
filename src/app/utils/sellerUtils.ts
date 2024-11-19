import { Item } from "../models/item";

export const determineItemStatusAndActions = (item: Item) => {
    const now = new Date();
    const endTime = new Date(item.startDate);
    endTime.setDate(endTime.getDate() + item.durationDays);
    endTime.setHours(endTime.getHours() + item.durationHours);
    endTime.setMinutes(endTime.getMinutes() + item.durationMinutes);
  
    const timeLeft = endTime.getTime() - now.getTime();
    let status = "Inactive";
    let actions: string[] = [];
  
    if (item.isFrozen) {
      status = "Frozen";
      actions = ["Request Unfreeze"];
    } else if (timeLeft > 0) {
      if (item.status === "Published") {
        status = "Active";
        actions = item.bids.length > 0 ? [] : ["Unpublish"];
      } else {
        status = "Inactive";
        actions = ["Publish", "Edit", "Remove"];
      }
    } else {
      if (item.bids.length > 0) {
        status = "Fulfill";
        actions = ["Fulfill Item"];
      } else {
        status = "Archive";
        actions = ["Archive Item"];
      }
    }
  
    return { status, actions };
  };
  