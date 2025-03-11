'use client';
import Snowfall from 'react-snowfall'; // Import Snowfall effect
import React, { useEffect, useState } from 'react';
import { useRouter } from "next/navigation";
import './globals.css';
import axios from 'axios';
import { Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, Button, Typography, Box, Pagination } from '@mui/material';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

const instance = axios.create({
    baseURL: 'https://mtlda2oa5d.execute-api.us-east-2.amazonaws.com/Test',
});

export interface Item {
    PurchaseID: number;
    ItemID: number;
    Name: string;
    Description: string;
    Images: string[];
    PurchasePrice: number;
    AuctionHouseProfit: string;
    BuyerName: string;
    BuyerID: number;
    BidTime: string;
    HighestBidAmount: number;
    ParticipantsList: ParticipantsList[];
    InitialPrice: number;
}

export interface ParticipantsList {
    ItemID: number;
    BuyerID: number;
    BuyerName: string;
    TotalBids: number;
    MaxBidAmount: number;
    BidTimeStamp: string;
}

export default function ReportPage() {
    const [auctionReport, setAuctionReport] = useState<Item[]>([]);
    const [errorMessage, setErrorMessage] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const [loading, setLoading] = useState(false);
    const itemsPerPage = 10;
    const startIndex = (currentPage - 1) * itemsPerPage;
    const currentItems = auctionReport.slice(startIndex, startIndex + itemsPerPage);
    const router = useRouter();

    useEffect(() => {
        fetchAuctionReport();
    }, []);

    const fetchAuctionReport = async () => {
        try {
            setLoading(true);
            const response = await instance.post('/admin/getauctionreport');
            if (response.data) {
                setAuctionReport(response.data);
            }
        } catch (error) {
            console.error('Error fetching auction report:', error);
            setErrorMessage('Failed to load auction report.');
        } finally {
            setLoading(false);
        }
    };

    const downloadIndividualAuctionPDF = (item: Item) => {
        try {
            const doc = new jsPDF();
            const { Name, Description, PurchasePrice, AuctionHouseProfit, InitialPrice, BuyerName, ParticipantsList } = item;

            doc.setFontSize(16);
            doc.text(`Auction Report - ${Name}`, 14, 15);

            doc.setFontSize(12);
            doc.text(`Description: ${Description}`, 14, 25);
            doc.text(`Initial Price: $${InitialPrice}`, 14, 35);
            doc.text(`Purchase Price: $${PurchasePrice}`, 14, 45);
            doc.text(`Auction House Profit: $${AuctionHouseProfit}`, 14, 55);
            doc.text(`Buyer: ${BuyerName}`, 14, 65);

            if (ParticipantsList && ParticipantsList.length > 0) {
                autoTable(doc, {
                    startY: 75,
                    head: [['Buyer Name', 'Total Bids', 'Max Bid Amount', 'Bid Timestamp']],
                    body: ParticipantsList.map(participant => [
                        participant.BuyerName,
                        participant.TotalBids.toString(),
                        `$${participant.MaxBidAmount.toFixed(2)}`,
                        new Date(participant.BidTimeStamp).toLocaleString(),
                    ]),
                    styles: { fontSize: 10 },
                    margin: { left: 14 },
                });
            }

            doc.save(`${Name}_Auction_Report.pdf`);
        } catch (error) {
            console.error('Error generating PDF:', error);
        }
    };

    const handlePageChange = (_event: React.ChangeEvent<unknown>, page: number) => {
        setCurrentPage(page);
    };

    return (
        <main className="min-h-screen p-6 bg-red-700">
            {/* Snowfall Effect */}
            <Snowfall color="white" snowflakeCount={150} />
        <div style={{ padding: '20px' }}>
            <Button variant="contained" color="primary" onClick={() => router.back()}>
                Go to Admin Page
            </Button>

            <Typography variant="h4" gutterBottom style={{ marginTop: '20px' }}>
                Auction Report
            </Typography>

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
                                <TableCell>Name</TableCell>
                                <TableCell>Description</TableCell>
                                <TableCell>Buyer</TableCell>
                                <TableCell>Initial Price</TableCell>
                                <TableCell>Purchase Price</TableCell>
                                <TableCell>Auction House Profit</TableCell>
                                <TableCell>Actions</TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {currentItems.map((item) => (
                                <TableRow key={item.ItemID}>
                                    <TableCell>{item.Name}</TableCell>
                                    <TableCell>{item.Description}</TableCell>
                                    <TableCell>{item.BuyerName}</TableCell>
                                    <TableCell>${item.InitialPrice}</TableCell>
                                    <TableCell>${item.PurchasePrice}</TableCell>
                                    <TableCell>${item.AuctionHouseProfit}</TableCell>
                                    <TableCell>
                                        <Button
                                            variant="contained"
                                            color="secondary"
                                            onClick={() => downloadIndividualAuctionPDF(item)}
                                        >
                                            Export PDF
                                        </Button>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </TableContainer>
            )}

            {/* Pagination */}
            <Box sx={{ display: 'flex', justifyContent: 'center', marginTop: 4 }}>
                <Pagination
                    count={Math.ceil(auctionReport.length / itemsPerPage)}
                    page={currentPage}
                    onChange={handlePageChange}
                    color="primary"
                />
            </Box>
        </div>
        </main>
    );
}