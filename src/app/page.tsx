'use client'
import Link  from "next/link";
import React, { useState } from 'react';
import { useRouter } from "next/navigation";

export default function Home() {
  const router = useRouter();
  const [username, setUsername] = useState('');

  return (<>
    <main>
      <h1>HomePage</h1>
      <p>Welcome to the Home page</p>
      <p>
        <button type="button" onClick={() => router.push('/pages/LoginPage')}>Go to Login</button>
      </p>
      <p>
        <button type="button" onClick={() => router.push('/pages/AddItemPage')}>Go to AddItem</button>
      </p>
      <p>
        <button type="button" onClick={() => router.push('/pages/BuyerHomePage')}>Go to BuyerHomePage</button>
      </p>
      <p>
        <button type="button" onClick={() => router.push('/pages/SellerHomePage')}>Go to SellerHomePage</button>
      </p>
      <p>
        <button type="button" onClick={() => router.push('/pages/AdminPage')}>Go to Admin Home</button>
      </p>
    </main>
  </>
  );
}
