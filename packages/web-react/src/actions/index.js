export const AUTH_GOOGLE_SUCCESS = 'AUTH_GOOGLE_SUCCESS';
export const AUTH_GOOGLE_FAILURE = 'AUTH_GOOGLE_FAILURE';
export const LOGOUT = 'LOGOUT';

export const MODELS_LOAD = 'MODELS_LOAD';


export const authGoogleSuccess = (userName) => ({ type: AUTH_GOOGLE_SUCCESS, userName });
export const authGoogleFailure = (error) => ({ type: AUTH_GOOGLE_FAILURE, error });
export const logout = () => ({ type: LOGOUT });

export const loadModelsList = (models) => ({ type: MODELS_LOAD, models })

export const startAuthGoogle = (googleAuthToken) => (dispatch) => {
    const tokenBlob = new Blob(
        [JSON.stringify({ access_token: googleAuthToken }, null, 2)],
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
            r.json()
                .then(user => {
                    if (user) {
                        dispatch(authGoogleSuccess(user.displayName));
                    } else {
                        dispatch(authGoogleFailure("No token provided"));
                    }
                })
        },
            error => dispatch(authGoogleFailure(error))
        );
};

export const loadModels = () => (dispatch) => {
    const models = [{ name: 'test' }, { name: 'test2' }];
    dispatch(loadModelsList(models));
}