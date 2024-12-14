'use client';

import Snowfall from 'react-snowfall'; // Import Snowfall effect
import React, { useEffect, useState } from 'react';
import { useRouter } from "next/navigation";
import './globals.css';
import axios from 'axios';
import { BarChart, Bar, LineChart, Line, XAxis, YAxis, Tooltip, CartesianGrid, ResponsiveContainer } from 'recharts';
import { Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, Button, Typography } from '@mui/material';
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';

const instance = axios.create({
    baseURL: 'https://mtlda2oa5d.execute-api.us-east-2.amazonaws.com/Test',
});

// export interface Item {
//     PurchaseID: number;
//     ItemID: number;
//     Name: string
//     Description: string;
//     Images: string[];
//     PurchasePrice: number;
//     AuctionHouseProfit: string;
//     BuyerName: string;
//     BuyerID: number;
//     BidTime: string;
//     HighestBidAmount: number,
//     ParticipantsList: ParticipantsList[]

// }
// export interface ParticipantsList {
//     ItemID: number;
//     BuyerID: number;
//     BuyerName: string;
//     BidAmount: number;
//     MaxBidAmount: number;
// }

interface BidItem {
    ItemID: number;
    ItemName: string;
    HighestBidAmount: number;
}
interface TopBidItem {
    ItemID: number;
    ItemName: string;
    TotalBids: number;
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
interface ProfitItem {
    Name: string;
    Description: string;
    Images: string;
    InitialPrice: number;
    PurchasePrice: number;
    AuctionHouseProfit: number;
}
interface Item {
    ItemID: number,
    Name: string,
    Description: string,
    //Images": "[\"20241110_001036/0.png\", \"20241110_001036/1.png\"]",
    InitialPrice: number,
    StartDate: string,
    //   DurationDays: 3,
    //   DurationHours: 20,
    //   DurationMinutes: 10,
    //   SellerID: 2,
    PurchaseID: number,
    PurchasePrice: number,
    AuctionHouseProfit: number
}

interface Purchase{
    PurchaseID: number;
    ItemID: number;
    Name: string;
    Description: string;
    Images: string[];
    PurchasePrice: number;
    AuctionHouseProfit: number;
    BuyerName: string;
    BuyerID: number;
}


interface ForensicReportData {
    purchasesReport: Purchase[];
    totalProfit: { TotalProfit: number }[];
    topProfitItems: Item[];
    topMostBids: TopBidItem[];
    topHeighestBidItems: BidItem[]
    topBidderItems: BidderItem[];
    participants: Participant[];
}
export default function ForensicReportPage() {


    const [topProfitItems, setTopProfitItems] = useState([]);
    const [totalProfit, setTotalProfit] = useState<number | null>(null);
    const [isProfitPopupOpen, setProfitPopupOpen] = useState(false);
    const [errorMessage, setErrorMessage] = useState('');
    const [isModalOpen, setModalOpen] = useState(false);
    const [topMostBids, setTopMostBids] = useState([]);
    const [isBidsPopupOpen, setBidsPopupOpen] = useState(false);
    const [loading, setLoading] = useState(false);
    const [topHighestBidItems, setTopHighestBidItems] = useState([]);
    const [isHighestBidsPopupOpen, setHighestBidsPopupOpen] = useState(false);
    const [topBidderItems, setTopBidderItems] = useState<BidderItem[]>([]);
    const [istopBidderItemsPopupOpen, settopBidderItemsPopupOpen] = useState(false);
    const [participants, setParticipants] = useState<Participant[]>([]);
    const [, setPurchases] = useState<Purchase[]>([]);
    const [forensicReport, setforensicReport] = useState<ForensicReportData>();
    const [showPopup, setShowPopup] = useState(false);

    const router = useRouter();
    useEffect(() => {
        setLoading(false);
        handleItemDetail();
    }, []);

    const handleItemModel = () => {
        setModalOpen(true);
    }
    const handleProfitModel = () => {
        setProfitPopupOpen(true);
    }

    const handleItemDetail = () => {
        try {
            setLoading(true);
            instance.post('/admin/getforensicsreport')
                .then((response) => {
                    // console.log('Response:', response);

                    if (response.data) {
                        setforensicReport(response.data);
                       
                    }
                    if (response.data && response.data.purchasesReport) {
                        setPurchases(response.data.purchasesReport);
                    }

                    if (response.data && response.data.topProfitItems) {
                        const parsedItems = response.data.topProfitItems.map((item: ProfitItem) => ({
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
                        // console.log("sortedData", sortedData);
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
                    setLoading(false);
                })
                .catch((error) => {
                    console.log(error);
                    setErrorMessage('Error retrieving items.');
                    setLoading(false);
                })
        }
        catch (error) {
            setErrorMessage('Failed to load auction report' + error);
            setLoading(false);
        } finally {
            setLoading(false);
        }


    }
    const downloadForensicReportPDF = (data: ForensicReportData) => {
        try {
            const doc = new jsPDF();
            let currentY = 15; 
    
            // Add title
            doc.setFontSize(16);
            doc.text('Forensic Auction Report', 14, currentY);
            currentY += 20; 
            console.log('data', data);
            if (data.purchasesReport.length > 0) {
                autoTable(doc, {
                    startY: currentY,
                    head: [['#', 'Item Name', 'Initial Price', 'Purchase Price', 'Profit']],
                    body: data.purchasesReport.map((item, index) => [
                        (index + 1).toString(),
                        item.Name,
                        item.BuyerName,
                        item.PurchasePrice != null ? `$${item.PurchasePrice.toFixed(2)}` : '$0.00',
                        `$${item.AuctionHouseProfit.toFixed(2)}`
                    ]),
                    styles: { fontSize: 8 },
                    margin: { left: 14 },
                });
    
                
                const rowsHeight = data.topProfitItems.length * 10;
                currentY += rowsHeight + 20; 
            }
    
            // Total Profit Section
            doc.setFontSize(12);
            doc.text('Total Profit: $' + data.totalProfit[0].TotalProfit, 14, currentY);
            currentY += 10;
    
            // Top Profit Items Section
            doc.setFontSize(14);
            doc.text('Top Profit Items:', 14, currentY);
            currentY += 10;
    
            // Table for Top Profit Items
            if (data.topProfitItems.length > 0) {
                autoTable(doc, {
                    startY: currentY,
                    head: [['#', 'Item Name', 'Initial Price', 'Purchase Price', 'Profit']],
                    body: data.topProfitItems.map((item, index) => [
                        (index + 1).toString(),
                        item.Name,
                        `$${item.InitialPrice.toFixed(2)}`,
                        item.PurchasePrice != null ? `$${item.PurchasePrice.toFixed(2)}` : '$0.00',
                        `$${item.AuctionHouseProfit.toFixed(2)}`
                    ]),
                    styles: { fontSize: 8 },
                    margin: { left: 14 },
                });
    
                
                const rowsHeight = data.topProfitItems.length * 10;
                currentY += rowsHeight + 20; 
            }
    
            // Top Most Bids Section
            doc.setFontSize(14);
            doc.text('Top Most Bids:', 14, currentY);
            currentY += 10;
    
            // Table for Top Most Bids
            if (data.topMostBids.length > 0) {
                autoTable(doc, {
                    startY: currentY,
                    head: [['#', 'Item Name', 'Total Bids']],
                    body: data.topMostBids.map((item, index) => [
                        (index + 1).toString(),
                        item.ItemName,
                        item.TotalBids.toString()
                    ]),
                    styles: { fontSize: 8 },
                    margin: { left: 14 },
                });
    
               
                const rowsHeight = data.topMostBids.length * 10;
                currentY += rowsHeight + 20; 
            }
    
            // Top Highest Bid Items Section
            doc.setFontSize(14);
            doc.text('Top Highest Bid Items:', 14, currentY);
            currentY += 10;
    
            // Table for Top Highest Bid Items
            if (data.topHeighestBidItems.length > 0) {
                autoTable(doc, {
                    startY: currentY,
                    head: [['#', 'Item Name', 'Highest Bid Amount']],
                    body: data.topHeighestBidItems.map((item, index) => [
                        (index + 1).toString(),
                        item.ItemName,
                        item.HighestBidAmount != null ? `$${item.HighestBidAmount.toFixed(2)}` : '$0.00'
                    ]),
                    styles: { fontSize: 8 },
                    margin: { left: 14 },
                });
    
                
                const rowsHeight = data.topHeighestBidItems.length * 10;
                currentY += rowsHeight + 20; 
            }
    
            // Bidder Information Section 
            doc.setFontSize(16);
            if (currentY + 30 > doc.internal.pageSize.height) {
                doc.addPage(); 
                currentY = 15; 
            }
            doc.text('Bidder Information:', 10, currentY);
            currentY += 20; 
    
            // Table for Bidder Information
            if (data.topBidderItems.length > 0) {
                autoTable(doc, {
                    startY: currentY,
                    head: [['#', 'Item Name', 'Distinct Bidders']],
                    body: data.topBidderItems.map((item, index) => [
                        (index + 1).toString(),
                        item.ItemName,
                        item.DistinctBidders.toString()
                    ]),
                    styles: { fontSize: 8 },
                    margin: { left: 14 },
                });
    
                
                const rowsHeight = data.topBidderItems.length * 10;
                currentY += rowsHeight + 20; 
            }
    
            // Participants Section 
            doc.setFontSize(16);
            if (currentY + 30 > doc.internal.pageSize.height) {
                doc.addPage(); 
                currentY = 15; 
            }
            doc.text('Participants:', 10, currentY);
            currentY += 20; 
    
            // Table for Participants
            if (data.participants.length > 0) {
                autoTable(doc, {
                    startY: currentY,
                    head: [['#', 'Buyer Name', 'Item Name', 'Sale Value']],
                    body: data.participants.map((participant, index) => [
                        (index + 1).toString(),
                        participant.BuyerName,
                        participant.ItemName,
                        `$${participant.SaleValue.toFixed(2)}`
                    ]),
                    styles: { fontSize: 8 },
                    margin: { left: 14 },
                });
    
           
                const rowsHeight = data.participants.length * 10;
                currentY += rowsHeight + 20; 
            }
    
          
            doc.save('Forensic_Auction_Report.pdf');
            console.log('PDF generated successfully!');
        } catch (error) {
            console.error('Error generating PDF:', error);
        }
    };
    
    
    {/* Top Profit Items Section */}
    {/* Total Profit Section */}
    {/* Top Most Bids Section */}
    {/* Top Highest Bid Items Section */}
    {/* Top number of Bidder Items Section */}
    {/* Participants report */}
    return (
        <main className="min-h-screen p-6 bg-red-700">
            {/* Snowfall Effect */}
            <Snowfall color="white" snowflakeCount={150} />
            <div style={{ padding: '20px' }}>
            <Button variant="contained" color="primary" onClick={() => router.back()}>
                Go to Admin Page
            </Button>
            </div>
            <div style={{ padding: '20px' }}>
            <Button variant="contained" color="primary" onClick={() => forensicReport && downloadForensicReportPDF(forensicReport)}>
                Download Forensic Report PDF
            </Button>
            </div>
            
            {errorMessage && (
                <Typography color="error" variant="body1">
                    {errorMessage}
                </Typography>
            )}

            {loading ? (
                <div className="loader">
                    <div className="spinner"></div>
                </div>
            ) : (
                <TableContainer component={Paper} style={{ marginTop: '20px' }}>
                    <Table>
                        <TableHead>
                            <TableRow>
                                <TableCell>Section Name</TableCell>
                                <TableCell>View Result</TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            <TableRow><TableCell>Top 10 Most Profitable Items</TableCell><TableCell>
                                {/* Action buttons */}
                                <Button
                                    variant="contained"
                                    color="primary"
                                    onClick={() => handleItemModel()}
                                >
                                    View Chart - Top Profit Items
                                </Button>
                                </TableCell></TableRow>
                                        
                                <TableRow><TableCell>Top 10 Most Profitable Items</TableCell><TableCell>
                                <Button
                                    variant="contained"
                                    color="primary"
                                    onClick={() => handleProfitModel()}
                                >
                                    View Total Profit
                                </Button></TableCell></TableRow>
                                            
                                <TableRow><TableCell>Top 10 Most Profitable Items</TableCell><TableCell>
                                <Button
                                    variant="contained"
                                    color="primary"
                                    onClick={() => setBidsPopupOpen(true)}
                                >
                                    View Top Most Bids
                                </Button></TableCell></TableRow>

                                <TableRow><TableCell>Top 10 Most Profitable Items</TableCell><TableCell>
                                <Button
                                    variant="contained"
                                    color="primary"
                                    onClick={() => setHighestBidsPopupOpen(true)}
                                >
                                    View Top Highest Bid Items
                                </Button></TableCell></TableRow>

                                <TableRow><TableCell>Top 10 Most Profitable Items</TableCell><TableCell>
                                <Button
                                    variant="contained"
                                    color="primary"
                                    onClick={() => settopBidderItemsPopupOpen(true)}
                                >
                                    View Top Bidder Items
                                </Button></TableCell></TableRow>

                                <TableRow><TableCell>Top 10 Most Profitable Items</TableCell><TableCell>
                                <Button
                                    variant="contained"
                                    color="primary"
                                    onClick={() => setShowPopup(true)}
                                >
                                    Show Participants Report
                                </Button></TableCell></TableRow>
                            </TableBody>
                        </Table>
                    </TableContainer>)}

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
        </main>
    );
}


