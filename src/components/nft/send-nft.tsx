import React, { useState } from "react";

interface Props {
    handleSend: (destination: string) => void;
    setShowSend: (show: boolean) => void;
    loading?: boolean;
}

export const SendPopup:React.FC<Props> = ({ handleSend, setShowSend, loading }) => {
    const [destination, setDestination] = useState("");

    return (
        <div className="popup">
            <div className="popup-header">
                <button className="close-btn" onClick={() => setShowSend(false)}>X</button>
                <h3>Send Selected NFTs with email</h3>
            </div>
            <div className="popup-content">
                <img src="/seamless-nft.png" alt="NFT Image" className="popup-image"/>
                <form onSubmit={e => e.preventDefault()}>
                    <label htmlFor="destination">Destination Email or Handle:</label>
                    <input 
                        id="destination" 
                        type="text"
                        // value={destination}
                        disabled={loading} 
                        onChange={e => setDestination(e.target.value)} 
                    />
                    <button 
                        type="button" 
                        onClick={() => handleSend(destination)}
                        disabled={loading} 
                        className={loading ? "loading-btn" : ""}
                    >
                        {loading ? <div className="spinner"></div> : "Send NFT(s)"}
                    </button>
                </form>
            </div>
        </div>
    )
}