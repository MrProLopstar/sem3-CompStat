import React, { useState } from 'react';
import { configureStore } from "@reduxjs/toolkit";
import { createLogger } from "redux-logger";
import app from './app';
import router from "./router";
import security from "./security";

const store = configureStore({
  reducer: {
    app,
    router,
    security
  },
  middleware: (getDefaultMiddleware) => {
    const middlewares = getDefaultMiddleware({
      serializableCheck: false
    });

    middlewares.push(
      createLogger({
        predicate: (_, action) => !action.type.startsWith('security/'),
        stateTransformer: (state) => {
          const newState = { ...state };
          delete newState.security;
          return newState;
        }
      })
    );

    return middlewares;
  },
});

export const { dispatch, getState } = store;
export default store;
