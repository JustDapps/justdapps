import {AUTH_GOOGLE_SUCCESS, AUTH_GOOGLE_FAILURE, LOGOUT} from '../actions';

const initialState = {isAuthenticated: false, user: {name: ''}, error: null};

const authReducer = (state = initialState, action) => {
    switch (action.type) {
        case AUTH_GOOGLE_SUCCESS:
            return {isAuthenticated: true, user: {name: action.userName}, error: null};
        case AUTH_GOOGLE_FAILURE:
            return {isAuthenticated: false, user: {name: ''}, error: action.error};
        case LOGOUT:
            return initialState;
        default:
            return state;
    }
}

export default authReducer;
