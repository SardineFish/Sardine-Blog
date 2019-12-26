import React from "react";
import { User } from "../data/user";

export const UserContext = React.createContext({
    login: false,
    user: null as (User | null)
});