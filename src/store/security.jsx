import {createSlice} from '@reduxjs/toolkit';

const router = createSlice({
    name: "security",
    initialState: {
        id: null,
        vk: null,
        info: null,
        email: null,
        username: null,
        access: null,
        vkToken: null,
        vkScope: null,
        vkExpires: null,
        accessToken: null,
        refreshToken: null
    },
    reducers: {
        setVK: (state, {payload}) => { state.vk=payload; },
        setVKToken: (state, {payload}) => {
            state.vkExpires=payload.expires;
            state.vkToken=payload.accessToken;
            if(payload.scope!='') state.vkScope=payload.scope.split(',');
        },
        setAccessToken: (state, {payload}) => { state.accessToken=payload; },
        setRefreshToken: (state, {payload}) => { state.refreshToken=payload; },
        setTokens: (state, {payload}) => {
            state.accessToken=payload.accessToken;
            state.refreshToken=payload.refreshToken;
        },
        securityStart: (state, {payload}) => {
            state.id=payload.id;
            state.info=payload.info;
            state.email=payload.email;
            state.access=payload.access;
            state.username=payload.username;
        }
    }
});

export const { setVK, setVKToken, setTokens, setAccessToken, setRefreshToken, securityStart } = router.actions;
export default router.reducer;