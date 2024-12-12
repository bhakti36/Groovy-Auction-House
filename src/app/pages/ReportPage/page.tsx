'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from "next/navigation";
import './globals.css';
import axios from 'axios';
import { Grid, Card, CardContent, Typography, Divider, Box, Button, Pagination } from '@mui/material';

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
    ParticipantsList: ParticipantsList[],
    InitialPrice:number;

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
    const [item, setItem] = useState<Item | null>(null);

    const [auctionReport, setAuctionReport] = useState<Item[]>([]);
    const [errorMessage, setErrorMessage] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 5;
    const [userName, setUserName] = useState('');
    const startIndex = (currentPage - 1) * itemsPerPage;
    const currentItems = auctionReport.slice(startIndex, startIndex + itemsPerPage);
    const router = useRouter();
    useEffect(() => {

        handleItemDetail();
    }, []);

    const handleItemDetail = () => {
        instance.post('/admin/getauctionreport')
            .then((response) => {

                console.log('Response:', response.data);
                setAuctionReport(response.data);
            })
            .catch((error) => {
                console.log(error);
                setErrorMessage('Failed to load auction report.');
            })
    }

    const handlePageChange = (_event: React.ChangeEvent<unknown>, page: number) => {
        setCurrentPage(page);
    };
    const handleSuccessfulAuction = () => {
        console.log('Successful Auction clicked!');
        // Add logic for successful auction here
    };

    const handleFailedItem = () => {
        console.log('Failed Item clicked!');
        // Add logic for failed items here
    };

    return (
        <div style={{ padding: '20px' }}>

            <div> <button type="button" onClick={() => router.push('/pages/AdminPage')}>Go to Admin Page</button></div>

            <Typography variant="h4" gutterBottom>
                Auction Report
            </Typography>

            {errorMessage && (
                <Typography color="error" variant="body1">
                    {errorMessage}
                </Typography>
            )}



            <Grid container spacing={2} sx={{ padding: 2 }}>
                {currentItems.map((item, index) => (
                    <Grid item xs={12} md={6} key={index}>
                        <Card>
                            <CardContent>
                                <Typography variant="h6">{item.Name}</Typography>
                                <Typography variant="body2" color="text.secondary">
                                    {item.Description}
                                </Typography>
                                <Divider sx={{ margin: "10px 0" }} />

                                <Box>
                                <Typography variant="subtitle2">
                                InitialPrice: ${item.InitialPrice}
                                    </Typography>
                                    <Typography variant="subtitle2">
                                        Auction House Profit: ${item.AuctionHouseProfit}
                                    </Typography>
                                    <Typography variant="subtitle2">
                                        Buyer: {item.BuyerName}
                                    </Typography>
                                    <Typography variant="subtitle2">
                                        Highest Bid Amount: ${item.HighestBidAmount}
                                    </Typography>
                                </Box>
                                <Divider sx={{ margin: "10px 0" }} />

                                <Typography variant="subtitle1">Participants:</Typography>
                                <Box>
                                    {item.ParticipantsList.map((participant, pIndex) => (
                                        <Typography key={pIndex} variant="body2">
                                            - {participant.BuyerName} (<strong>Number of Bids: </strong>
                                            {participant.TotalBids}, <strong>Max Bid $  </strong>
                                            {participant.MaxBidAmount},<strong>Bid TimeStamp : </strong>
                                            {participant.BidTimeStamp})
                                        </Typography>
                                    ))}
                                </Box>
                            </CardContent>
                        </Card>
                    </Grid>
                ))}
            </Grid>

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
    );

}


