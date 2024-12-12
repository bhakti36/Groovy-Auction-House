'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from "next/navigation";
import './globals.css';
import axios from 'axios';
import { BarChart, Bar, LineChart, Line, XAxis, YAxis, Tooltip, CartesianGrid, ResponsiveContainer } from 'recharts';

const instance = axios.create({
    baseURL: 'https://mtlda2oa5d.execute-api.us-east-2.amazonaws.com/Test',
});

export interface Item {
    PurchaseID: number;
    ItemID: number;
    Name: string
    Description: string;
    Images: string[];
    PurchasePrice: number;
    AuctionHouseProfit: string;
    BuyerName: string;
    BuyerID: number;
    BidTime: string;
    HighestBidAmount: number,
    ParticipantsList: ParticipantsList[]

}
export interface ParticipantsList {
    ItemID: number;
    BuyerID: number;
    BuyerName: string;
    BidAmount: number;
    MaxBidAmount: number;
}
interface BidItem {
    ItemID: number;
    ItemName: string;
    HighestBidAmount: number;
}
interface BidderItem {
    ItemID: number;
    ItemName: string;
    DistinctBidders: number;
}
interface Participant {
    AccountID: number;
    BuyerName: string;
    ItemName: string;
    SaleValue: number;
}

export default function ForensicReportPage() {
   

    const [topProfitItems, setTopProfitItems] = useState([]);
    const [totalProfit, setTotalProfit] = useState<number | null>(null);
    const [isProfitPopupOpen, setProfitPopupOpen] = useState(false);
    const [errorMessage, setErrorMessage] = useState('');
    const [isModalOpen, setModalOpen] = useState(false);
    const [topMostBids, setTopMostBids] = useState([]);
    const [isBidsPopupOpen, setBidsPopupOpen] = useState(false);
    
    const [topHighestBidItems, setTopHighestBidItems] = useState([]);
    const [isHighestBidsPopupOpen, setHighestBidsPopupOpen] = useState(false);
    const [topBidderItems, setTopBidderItems] = useState<BidderItem[]>([]);
    const [istopBidderItemsPopupOpen, settopBidderItemsPopupOpen] = useState(false);
    const [participants, setParticipants] = useState<Participant[]>([]);
    
    const [showPopup, setShowPopup] = useState(false);
   
    const router = useRouter();
    useEffect(() => {

        handleItemDetail();
    }, []);

    const handleItemModel = () => {
        setModalOpen(true);
    }
    const handleProfitModel = () => {
        setProfitPopupOpen(true);
    }

    const handleItemDetail = () => {
        instance.post('/admin/getforensicsreport')
            .then((response) => {
                console.log('Response:', response);
                if (response.data && response.data.topProfitItems) {
                    const parsedItems = response.data.topProfitItems.map((item: any) => ({
                        Name: item.Name,
                        AuctionHouseProfit: item.AuctionHouseProfit,
                        Images: JSON.parse(item.Images),
                    }));
                    setTopProfitItems(parsedItems);

                }
                //for top profit section
                if (response.data && response.data.totalProfit && response.data.totalProfit.length > 0) {
                    setTotalProfit(response.data.totalProfit[0].TotalProfit);

                }
                //for top most bids
                if (response.data && response.data.topMostBids) {
                    setTopMostBids(response.data.topMostBids);
                }
                //for heighest bid popup
                if (response.data && response.data.topHeighestBidItems) {
                    const sortedData = response.data.topHeighestBidItems.sort(
                        (a: BidItem, b: BidItem) => a.HighestBidAmount - b.HighestBidAmount
                    );
                    console.log("sortedData", sortedData);
                    setTopHighestBidItems(sortedData);
                }
                //top bidder
                if (response.data && response.data.topBidderItems) {
                    const sortedData = response.data.topBidderItems.sort(
                        (a: BidderItem, b: BidderItem) => a.DistinctBidders - b.DistinctBidders
                    );
                    setTopBidderItems(sortedData);
                }
                //participants data
                if (response.data && response.data.participants) {
                    //console.log("size",response.data.participants.length);
                    setParticipants(response.data.participants);
                }

            })
            .catch((error) => {
                console.log(error);
                setErrorMessage('Error retrieving items.');
            })
    }
   

 
    return (
        <div className="forensic-report-container">
             <div> <button type="button" onClick={() => router.push('/pages/AdminPage')}>Go to Admin Page</button></div>
            {/* Top Profit Items Section */}
            <div>
                <div className="section" id="top-profit-items">
                    <h2>Top 10 Most Profitable Items</h2>

                    <button className="section-button" onClick={() => handleItemModel()}>View Chart</button>
                </div>

                {isModalOpen && (
                    <div className="modal-overlay" onClick={() => setModalOpen(false)}>
                        <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                            <button className="popup-close" onClick={() => setModalOpen(false)}>
                                &times;
                            </button>
                            <h3 className="chart-title">Top Profit Items</h3>
                            <div className="chart-container">
                                <ResponsiveContainer width="100%" height={400}>
                                    <BarChart data={topProfitItems} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                                        <CartesianGrid strokeDasharray="3 3" />
                                        <XAxis dataKey="Name" />
                                        <YAxis />
                                        <Tooltip />
                                        <Bar dataKey="AuctionHouseProfit" fill="#8884d8" />
                                    </BarChart>
                                </ResponsiveContainer>
                            </div>
                        </div>
                    </div>
                )}
            </div>
            {/* Total Profit Section */}
            <div className="section" id="total-profit">
                <h2>Total Profit Earned by Auction House</h2>

                <button className="section-button" onClick={() => handleProfitModel()}>View Total Profit</button>
            </div>
            {isProfitPopupOpen && (
                <div className="small-popup-overlay" onClick={() => setProfitPopupOpen(false)}>
                    <div className="small-popup-content" onClick={(e) => e.stopPropagation()}>
                        <button className="popup-close" onClick={() => setProfitPopupOpen(false)}>
                            &times;
                        </button>
                        <p className="total-profit-text">Total Profit: ${totalProfit?.toFixed(2)}</p>
                    </div>
                </div>
            )}

            {/* Top Most Bids Section */}
            <div className="section" id="top-most-bids">
                <h2>Top 10 Items with the Most Bids</h2>

                <button className="section-button" onClick={() => setBidsPopupOpen(true)}>View Top Most Bids</button>
                {isBidsPopupOpen && (
                    <div className="chart-popup-overlay" onClick={() => setBidsPopupOpen(false)}>
                        <div className="chart-popup-content" onClick={(e) => e.stopPropagation()}>
                            <button className="popup-close" onClick={() => setBidsPopupOpen(false)}>
                                &times;
                            </button>
                            <h3 className="chart-title">Top 10 Items with the Most Bids</h3>
                            <div className="chart-container">
                                <ResponsiveContainer width="100%" height="100%">
                                    <BarChart data={topMostBids} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                                        <CartesianGrid strokeDasharray="3 3" />
                                        <XAxis dataKey="ItemName" />
                                        <YAxis />
                                        <Tooltip />
                                        <Bar dataKey="TotalBids" fill="#82ca9d" />
                                    </BarChart>
                                </ResponsiveContainer>
                            </div>
                        </div>
                    </div>
                )}
            </div>
            {/* Top Highest Bid Items Section */}
            <div className="section" id="top-highest-bid-items">
                <h2>Top 10 Items with the Highest Bid Values</h2>

                <button className="section-button" onClick={() => setHighestBidsPopupOpen(true)}>View Top Highest Bid Items</button>
            </div>

            {isHighestBidsPopupOpen && (
                <div className="line-popup-overlay" onClick={() => setHighestBidsPopupOpen(false)}>
                    <div className="line-popup-content" onClick={(e) => e.stopPropagation()}>
                        <button className="popup-close" onClick={() => setHighestBidsPopupOpen(false)}>
                            &times;
                        </button>
                        <h3 className="line-title">Top 10 Items with the Highest Bid Values</h3>
                        <div className="chart-container">
                            <ResponsiveContainer width="100%" height="100%">
                                <LineChart
                                    data={topHighestBidItems}
                                    margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                                >
                                    <CartesianGrid strokeDasharray="3 3" />
                                    <XAxis dataKey="ItemName" />
                                    <YAxis />
                                    <Tooltip />
                                    <Line type="monotone" dataKey="HighestBidAmount" stroke="#82ca9d" />
                                </LineChart>
                            </ResponsiveContainer>
                        </div>
                    </div>
                </div>
            )}
            {/* Top number of Bidder Items Section */}
            <div className="section" id="top-bidder-items">
                <h2>Top 10 Items with the Most Bidders</h2>

                <button className="section-button" onClick={() => settopBidderItemsPopupOpen(true)}>View Top Highest Bid Items</button>
                {istopBidderItemsPopupOpen && topBidderItems.length > 0 && (
                    <div className="popup">
                        <button className="popup-close" onClick={() => settopBidderItemsPopupOpen(false)}>
                            &times;
                        </button>
                        <h3 className="chart-title">Top 10 Items with the Most Bidders</h3>
                        <div className="chart-container">
                            <ResponsiveContainer width="100%" height={400}>
                                <LineChart
                                    data={topBidderItems}
                                    margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                                >
                                    <CartesianGrid strokeDasharray="3 3" />
                                    <XAxis dataKey="ItemName" />
                                    <YAxis />
                                    <Tooltip />
                                    <Line type="monotone" dataKey="DistinctBidders" stroke="#8884d8" />
                                </LineChart>
                            </ResponsiveContainer>
                        </div>
                    </div>
                )}

            </div>
            {/* Participants report */}
            <div className="sectionparticipants" id="participants-report">
                <h2>Participants Report for Each Item</h2>
                <button className="section-button" onClick={() => setShowPopup(true)}>Show Participants</button>

                {showPopup && (
                    <div className="popupparticipants">
                        <div className="popup-contentparticipants">
                            <h2>Participants Report</h2>
                            <div className="table-container">
                                <table className="participants-table">
                                    <thead>
                                        <tr>
                                            <th>Buyer Name</th>
                                            <th>Item Name</th>
                                            <th>Sale Value</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {participants.map((participant) => (
                                            <tr key={participant.AccountID}>
                                                <td>{participant.BuyerName}</td>
                                                <td>{participant.ItemName}</td>
                                                <td>${participant.SaleValue}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                            <button className="close-popup" onClick={() => setShowPopup(false)}>
                                Close
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );

}


