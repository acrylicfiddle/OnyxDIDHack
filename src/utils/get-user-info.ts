const API_URL = process.env.NEXT_PUBLIC_BACKEND_URL?? 'http://localhost:3001/';

async function getUserInfo(
    emailOrHandle: string | undefined,
    network: string,
    currentAddress: string,
) {
    if (emailOrHandle == undefined) {
        console.log("No email or handle or userAddr provided");
        return;
    }
    try {
        const checkUserStatus = await fetch(`${API_URL}name/${emailOrHandle}`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
            },
        });
        let userInfo = await checkUserStatus.json();
        console.log("Login status: ", userInfo);
        for (let i=0; i < userInfo.length; i++) {
            if (userInfo[i].network == network) {
                userInfo = userInfo[i];
                break;
            }
        }

        if (!userInfo) {
            console.log("That user does not exist");
            return;
        }
        
        if (userInfo.network != network ) {
            console.log("Invalid network");
            return;
        }

        if (userInfo.smartAccount == currentAddress) {
            console.log("Cannot send to my address");
            return;
        }
        return userInfo;
    } catch (error) {
        console.error(error);
    }
}

export default getUserInfo;