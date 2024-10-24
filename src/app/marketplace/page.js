// Mark this component as a Client Component
"use client";

// Import necessary modules
import { WalletContext } from "@/context/wallet";
import { useContext, useEffect, useState } from "react";
import { ethers } from "ethers";
import MarketplaceJson from "../marketplace.json";
import styles from "./marketplace.module.css";
import Header from "../components/header/Header";
import Footer from "../components/footer/Footer";
import axios from "axios";
import NFTCard from "../components/nftCard/NFTCard";
import { motion } from "framer-motion"; // Framer Motion import

export default function Marketplace() {
  const [items, setItems] = useState([]);
  const [filteredItems, setFilteredItems] = useState([]);
  const [filter, setFilter] = useState("all"); // Default filter
  const { isConnected, signer } = useContext(WalletContext);

  async function getNFTitems() {
    const itemsArray = [];
    if (!signer) return;
    let contract = new ethers.Contract(
      MarketplaceJson.address,
      MarketplaceJson.abi,
      signer
    );

    let transaction = await contract.getAllListedNFTs();

    for (const i of transaction) {
      const tokenId = parseInt(i.tokenId);
      const tokenURI = await contract.tokenURI(tokenId);
      const meta = (await axios.get(tokenURI)).data;
      const price = ethers.formatEther(i.price);

      const item = {
        price,
        tokenId,
        seller: i.seller,
        owner: i.owner,
        image: meta.image,
        name: meta.name,
        description: meta.description,
      };

      itemsArray.push(item);
    }
    return itemsArray;
  }

  const filterItems = (items, filter) => {
    if (filter === "all") return items;
    if (filter === "lowToHigh") return [...items].sort((a, b) => a.price - b.price);
    if (filter === "highToLow") return [...items].sort((a, b) => b.price - a.price);
    return items;
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        const itemsArray = await getNFTitems();
        setItems(itemsArray);
        setFilteredItems(filterItems(itemsArray, filter)); // Set filtered items
      } catch (error) {
        console.error("Error fetching NFT items:", error);
      }
    };

    fetchData();
  }, [isConnected]);

  useEffect(() => {
    setFilteredItems(filterItems(items, filter)); // Update filtered items when the filter changes
  }, [filter, items]);

  return (
    <div className={styles.container}>
      <Header />
      <motion.div
        className={styles.innerContainer}
        initial={{ opacity: 0, y: 50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, ease: "easeOut" }} // Add smooth scroll effect
      >
        <div className={styles.content}>
          {isConnected ? (
            <>
              <motion.div
                className={styles.nftSection}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 1.2, ease: "easeIn" }}
              >
                <h2 className={styles.heading}>NFTs</h2>

                {/* Filter Dropdown */}
                <select
                  value={filter}
                  onChange={(e) => setFilter(e.target.value)}
                  className={styles.filterDropdown}
                >
                  <option value="all">All</option>
                  <option value="lowToHigh">Price: Low to High</option>
                  <option value="highToLow">Price: High to Low</option>
                </select>

                {Array.isArray(filteredItems) && filteredItems.length > 0 ? (
                  <div className={styles.nftGrid}>
                    {filteredItems.map((value, index) => (
                      <NFTCard item={value} key={index} />
                    ))}
                  </div>
                ) : (
                  <div className={styles.noNFT}>No NFT Listed Now...</div>
                )}
              </motion.div>
            </>
          ) : (
            <div className={styles.notConnected}>Connect Metamask Wallet to Continue</div>
          )}
        </div>
      </motion.div>
      {/* <Footer /> */}
    </div>
  );
}
