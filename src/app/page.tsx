'use client'
import React from 'react';
import { useRouter } from "next/navigation";
// import image from './images/q1.png'


export default function Home() {
  const router = useRouter();
  // const [username, setUsername] = useState('');

  return (<>
    <main>
      <h1>HomePage</h1>
      <p>Welcome to the Home page</p>
      <p>
        <button type="button" onClick={() => router.push('/pages/LoginPage')}>Go to Login</button>
      </p>
      {/* <img src="https://groovy-auction-house.s3.us-east-2.amazonaws.com/images/Hammer_2024-11-08T00%3A13%3A20.687Z/1.png" alt="Sample" /> */}
      {/* <img src="" alt="Sample" /> */}
      {/* <div data-testid="gameOverImage" id="image gameOverImage">
        <img id="gameOverImage" src={image.src} alt="Game Over"  />
      </div> */}
      {/* <img src="images/q1.PNG" alt="Sample" /> */}

      {/* <p>
        <button type="button" onClick={() => router.push('/pages/AddItemPage')}>Go to AddItem</button>
      </p> */}
      {/* <p>
        <button type="button" onClick={() => router.push('/pages/BuyerHomePage')}>Go to BuyerHomePage</button>
      </p>
      <p>
        <button type="button" onClick={() => router.push('/pages/SellerHomePage')}>Go to SellerHomePage</button>
      </p> */}
      {/* <p>
        <button type="button" onClick={() => router.push('/pages/AdminPage')}>Go to Admin Home</button>
      </p> */}
    </main>
  </>
  );
}
