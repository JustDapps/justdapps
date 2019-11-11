import React from 'react';
import { GoogleLogin } from 'react-google-login';

const WelcomePage = (props) => {
    const onGoogleResponse = (response) => {
        console.log(response);
        const tokenBlob = new Blob(
            [JSON.stringify({ access_token: response.accessToken }, null, 2)],
            { type: 'application/json' }
        );
        const options = {
            method: 'POST',
            body: tokenBlob,
            mode: 'cors',
            cache: 'default',
            credentials: 'include',
        };

        fetch('http://localhost:3001/auth/google', options)
            .then(r => {
                const token = r.headers.get('x-auth-token');
                r.json()
                    .then(user => {
                        if (token) {
                            //this.setState({isAuthenticated: true, user, token});
                            console.log(`user ${JSON.stringify(user)}`);
                            console.log(`token ${token}`);
                        }
                    })
            });
    };

    const onGoogleFailure = error => {
        alert(error);
    }

    const testSecretApi = () => {
        const options = {
            method: 'GET',
            mode: 'cors',
            credentials: 'include',
        };

        fetch('http://localhost:3001/models/', options)
            .then(response => {
                response.text()
                    .then(res => {
                        console.log(res);
                    })
            })
    }

    //const [state, setstate] = useState({isAuthenticated: false})

    return <>
        <div>
            Welcome
        </div>
        <GoogleLogin
            clientId='1056858998168-fb2el4h0vc42f75f03a30dku0qids7uf.apps.googleusercontent.com'
            buttonText='Login'
            onSuccess={onGoogleResponse}
            onFailure={onGoogleFailure}
        />

        <button
            onClick={testSecretApi}>
            test secret api
        </button>
    </>
}

export default WelcomePage;