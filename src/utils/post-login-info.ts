
const API_URL = process.env.NEXT_PUBLIC_BACKEND_URL?? 'http://localhost:3001';

async function postLoginInfo(
    emailOrHandle: string | undefined,
    userAddr: string | null,
    loginMethod: string | null,
    accountAddress: string,
    network: string,
) {
    if (emailOrHandle == undefined || userAddr == null || loginMethod == null) {
        console.log("No email or handle or userAddr provided");
        return;
    }
    try {
        try {
            const checkLoginStatus = await fetch(`${API_URL}/name/${emailOrHandle}`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                },
            });
            const loginInfo = await checkLoginStatus.json();
            console.log("Login status: ", loginInfo);
            if (!loginInfo) {
                if (loginInfo.network == network && loginInfo.loginMethod == loginMethod) {
                    console.log("User already logged in");
                    return;
                }
            }
        } catch (error) {
            const loginResponse = await fetch(`${API_URL}`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    username: emailOrHandle,
                    address: userAddr,
                    smartAccount: accountAddress,
                    loginMethod: loginMethod,
                    network: network,
                }),
            });
            console.log("Login response: ", loginResponse);
        }
    } catch (error) {
        console.error(error);
    }
}

export default postLoginInfo;